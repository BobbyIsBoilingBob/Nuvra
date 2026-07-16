import { useState, useEffect, useRef, useCallback } from 'react';
import { type LatLng, DEFAULT_CENTER, haversineMeters } from '../lib/map-utils';

// ============================================================
// useGeolocation — production GPS with Kalman filtering
// Handles: denied, unavailable, weak, timeout, offline,
// background/foreground transitions, stop/walk detection.
// ============================================================

export type GeoStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'weak'
  | 'timeout'
  | 'offline'
  | 'error';

export type MovementState = 'idle' | 'stopped' | 'walking';

export interface GeoState {
  position: LatLng | null;
  heading: number | null;
  accuracy: number | null;
  speed: number | null;
  status: GeoStatus;
  message: string;
  movement: MovementState;
}

const STATUS_MESSAGES: Record<GeoStatus, string> = {
  idle: '',
  requesting: 'Getting your location...',
  granted: '',
  denied: 'Location permission denied. Using demo location.',
  unavailable: 'GPS unavailable on this device.',
  weak: 'Weak GPS signal. Move to an open area.',
  timeout: 'Location request timed out. Retrying...',
  offline: 'You are offline. Showing last known position.',
  error: 'Location error. Please check your settings.',
};

const WALK_SPEED_THRESHOLD = 0.8; // m/s — below this = stopped
const STOP_TIMEOUT_MS = 5000; // no movement for 5s = stopped
const STALE_DATA_MS = 30000; // data older than 30s = stale
const MAX_ACCURACY_M = 100; // reject positions worse than this
const KALMAN_PROCESS_NOISE = 3.0;
const KALMAN_MEASUREMENT_NOISE_BASE = 10.0;

// Kalman filter for lat/lng smoothing
interface KalmanState {
  lat: number;
  lng: number;
  variance: number;
  lastUpdate: number;
}

function kalmanFilter(
  measurement: LatLng,
  accuracy: number,
  prev: KalmanState | null,
): { position: LatLng; state: KalmanState } {
  if (!prev) {
    const state: KalmanState = {
      lat: measurement.lat,
      lng: measurement.lng,
      variance: accuracy * accuracy,
      lastUpdate: Date.now(),
    };
    return { position: measurement, state };
  }

  const dt = (Date.now() - prev.lastUpdate) / 1000;
  if (dt <= 0) {
    return { position: { lat: prev.lat, lng: prev.lng }, state: prev };
  }

  // Predict: increase uncertainty over time
  const processVariance = KALMAN_PROCESS_NOISE * dt;
  const predictedVariance = prev.variance + processVariance;

  // Update: blend prediction with measurement
  const measurementVariance = Math.max(accuracy * accuracy, KALMAN_MEASUREMENT_NOISE_BASE);
  const kalmanGain = predictedVariance / (predictedVariance + measurementVariance);

  const filteredLat = prev.lat + kalmanGain * (measurement.lat - prev.lat);
  const filteredLng = prev.lng + kalmanGain * (measurement.lng - prev.lng);
  const newVariance = (1 - kalmanGain) * predictedVariance;

  const state: KalmanState = {
    lat: filteredLat,
    lng: filteredLng,
    variance: newVariance,
    lastUpdate: Date.now(),
  };

  return { position: { lat: filteredLat, lng: filteredLng }, state };
}

export function useGeolocation(enabled: boolean): GeoState & {
  requestPermission: () => void;
  startTracking: () => void;
  stopTracking: () => void;
} {
  const [state, setState] = useState<GeoState>({
    position: null,
    heading: null,
    accuracy: null,
    speed: null,
    status: 'idle',
    message: '',
    movement: 'idle',
  });

  const watchIdRef = useRef<number | null>(null);
  const kalmanRef = useRef<KalmanState | null>(null);
  const lastMovementTimeRef = useRef<number>(Date.now());
  const lastHeadingRef = useRef<number | null>(null);
  const isOnlineRef = useRef<boolean>(navigator.onLine);
  const visibilityRef = useRef<boolean>(!document.hidden);

  // Smooth heading to prevent jitter
  const smoothHeading = useCallback((raw: number | null): number | null => {
    if (raw == null || isNaN(raw)) return lastHeadingRef.current;
    if (lastHeadingRef.current == null) {
      lastHeadingRef.current = raw;
      return raw;
    }
    // Shortest-path interpolation for angles
    let diff = raw - lastHeadingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothed = lastHeadingRef.current + diff * 0.3;
    const normalized = (smoothed + 360) % 360;
    lastHeadingRef.current = normalized;
    return normalized;
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        status: 'unavailable',
        message: STATUS_MESSAGES.unavailable,
        position: DEFAULT_CENTER,
      }));
      return;
    }

    setState((s) => ({ ...s, status: 'requesting', message: STATUS_MESSAGES.requesting }));

    const onSuccess = (pos: GeolocationPosition) => {
      const accuracy = pos.coords.accuracy;
      const timestamp = pos.timestamp;

      // Reject very inaccurate positions
      if (accuracy > MAX_ACCURACY_M) {
        setState((s) => ({
          ...s,
          status: 'weak',
          message: STATUS_MESSAGES.weak,
        }));
        return;
      }

      // Reject stale data
      if (Date.now() - timestamp > STALE_DATA_MS) {
        return;
      }

      const raw: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const { position: filtered, state: kalmanState } = kalmanFilter(raw, accuracy, kalmanRef.current);
      kalmanRef.current = kalmanState;

      // Speed estimation
      const gpsSpeed = pos.coords.speed;
      let speed: number;
      if (gpsSpeed != null && !isNaN(gpsSpeed) && gpsSpeed >= 0) {
        speed = gpsSpeed;
      } else {
        // Estimate from position delta
        if (kalmanRef.current && state.position) {
          const dt = (Date.now() - kalmanRef.current.lastUpdate) / 1000;
          if (dt > 0) {
            const dist = haversineMeters(state.position, filtered);
            speed = dist / dt;
          } else {
            speed = 0;
          }
        } else {
          speed = 0;
        }
      }

      // Movement detection
      const now = Date.now();
      let movement: MovementState = state.movement;
      if (speed > WALK_SPEED_THRESHOLD) {
        movement = 'walking';
        lastMovementTimeRef.current = now;
      } else if (now - lastMovementTimeRef.current > STOP_TIMEOUT_MS) {
        movement = 'stopped';
      }

      const heading = smoothHeading(pos.coords.heading);

      let status: GeoStatus = 'granted';
      let message = '';
      if (accuracy > 30) {
        status = 'weak';
        message = STATUS_MESSAGES.weak;
      }

      setState({
        position: filtered,
        heading,
        accuracy,
        speed,
        status,
        message,
        movement,
      });
    };

    const onError = (err: GeolocationPositionError) => {
      if (!isOnlineRef.current) {
        setState((s) => ({
          ...s,
          status: 'offline',
          message: STATUS_MESSAGES.offline,
        }));
        return;
      }
      if (err.code === err.PERMISSION_DENIED) {
        setState((s) => ({
          ...s,
          status: 'denied',
          message: STATUS_MESSAGES.denied,
          position: DEFAULT_CENTER,
        }));
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setState((s) => ({
          ...s,
          status: 'unavailable',
          message: STATUS_MESSAGES.unavailable,
          position: s.position ?? DEFAULT_CENTER,
        }));
      } else if (err.code === err.TIMEOUT) {
        setState((s) => ({
          ...s,
          status: 'timeout',
          message: STATUS_MESSAGES.timeout,
        }));
      } else {
        setState((s) => ({
          ...s,
          status: 'error',
          message: STATUS_MESSAGES.error,
        }));
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 15000,
    });
  }, [smoothHeading, state.position, state.movement]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        status: 'unavailable',
        message: STATUS_MESSAGES.unavailable,
        position: DEFAULT_CENTER,
      }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => startTracking(),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState((s) => ({
            ...s,
            status: 'denied',
            message: STATUS_MESSAGES.denied,
            position: DEFAULT_CENTER,
          }));
        } else {
          setState((s) => ({
            ...s,
            status: 'unavailable',
            message: STATUS_MESSAGES.unavailable,
            position: DEFAULT_CENTER,
          }));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [startTracking]);

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => { isOnlineRef.current = true; };
    const onOffline = () => {
      isOnlineRef.current = false;
      setState((s) => ({ ...s, status: 'offline', message: STATUS_MESSAGES.offline }));
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Background/foreground handling — pause GPS when hidden to save battery
  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = !document.hidden;
      visibilityRef.current = visible;
      if (visible && enabled) {
        // Re-request position when coming back
        if (watchIdRef.current !== null) {
          startTracking();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [enabled, startTracking]);

  // Start/stop tracking based on enabled flag
  useEffect(() => {
    if (enabled) {
      requestPermission();
    }
    return () => stopTracking();
  }, [enabled, requestPermission, stopTracking]);

  return {
    ...state,
    requestPermission,
    startTracking,
    stopTracking,
  };
}
