import { useState, useEffect, useRef, useCallback } from 'react';
import { type LatLng, DEFAULT_CENTER, haversineMeters } from '../lib/map-utils';

// ============================================================
// useGeolocation — production GPS with adaptive Kalman filtering
// Handles: denied, unavailable, weak, timeout, offline,
// background/foreground transitions, stop/walk detection,
// impossible-jump rejection, and battery-aware throttling.
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
  requesting: 'Finding your location...',
  granted: '',
  denied: 'Location permission denied. Enable it in your browser settings to track your adventure.',
  unavailable: 'GPS is unavailable on this device. The adventure will continue in demo mode.',
  weak: 'Weak GPS signal. Move to an open area with a clear view of the sky.',
  timeout: 'Location request timed out. Retrying automatically...',
  offline: 'You are offline. Showing your last known position.',
  error: 'Location error. Check your device GPS settings and try again.',
};

// --- Tuning constants ---
const WALK_SPEED_THRESHOLD = 0.6; // m/s — above this = walking
const STOP_TIMEOUT_MS = 4000; // no movement for 4s = stopped
const STALE_DATA_MS = 30000; // data older than 30s = stale
const MAX_ACCURACY_M = 120; // reject positions worse than this
const MIN_ACCURACY_M = 5; // clamp unrealistically good accuracy
const KALMAN_PROCESS_NOISE = 2.5;
const KALMAN_MEASUREMENT_NOISE_BASE = 8.0;

// Impossible-jump detection: if a jump exceeds this speed (m/s), reject it.
const MAX_PLAUSIBLE_SPEED_MS = 35; // ~126 km/h — beyond any walking/running
// When stopped, reject micro-jumps below this distance (meters) to prevent jitter.
const STOP_JITTER_THRESHOLD_M = 2.5;
// Throttle: when stopped, only accept a position update every N ms.
const STOPPED_THROTTLE_MS = 4000;

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
      variance: Math.max(accuracy * accuracy, KALMAN_MEASUREMENT_NOISE_BASE),
      lastUpdate: Date.now(),
    };
    return { position: measurement, state };
  }

  const dt = (Date.now() - prev.lastUpdate) / 1000;
  if (dt <= 0) {
    return { position: { lat: prev.lat, lng: prev.lng }, state: prev };
  }

  const processVariance = KALMAN_PROCESS_NOISE * dt;
  const predictedVariance = prev.variance + processVariance;
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
  const lastAcceptedTimeRef = useRef<number>(0);
  const movementRef = useRef<MovementState>('idle');
  const positionRef = useRef<LatLng | null>(null);
  const accuracyRef = useRef<number | null>(null);
  const speedRef = useRef<number>(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth heading to prevent jitter (shortest-path angular interpolation)
  const smoothHeading = useCallback((raw: number | null): number | null => {
    if (raw == null || isNaN(raw)) return lastHeadingRef.current;
    if (lastHeadingRef.current == null) {
      lastHeadingRef.current = raw;
      return raw;
    }
    let diff = raw - lastHeadingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothed = lastHeadingRef.current + diff * 0.25;
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
      const accuracy = Math.max(MIN_ACCURACY_M, Math.min(pos.coords.accuracy, MAX_ACCURACY_M));
      const timestamp = pos.timestamp;

      // Reject stale data
      if (Date.now() - timestamp > STALE_DATA_MS) return;

      const raw: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const now = Date.now();

      // --- Impossible-jump detection ---
      const prev = kalmanRef.current;
      if (prev) {
        const dist = haversineMeters({ lat: prev.lat, lng: prev.lng }, raw);
        const dt = Math.max((now - prev.lastUpdate) / 1000, 0.1);
        const impliedSpeed = dist / dt;
        if (impliedSpeed > MAX_PLAUSIBLE_SPEED_MS) {
          // Impossible jump — reject this update entirely
          return;
        }
      }

      // --- Stop-based jitter suppression ---
      if (movementRef.current === 'stopped') {
        const distFromLast = prev
          ? haversineMeters({ lat: prev.lat, lng: prev.lng }, raw)
          : 0;
        // If the micro-jump is below the jitter threshold, ignore it
        if (distFromLast < STOP_JITTER_THRESHOLD_M) {
          return;
        }
        // Throttle: when stopped, only accept updates every STOPPED_THROTTLE_MS
        if (now - lastAcceptedTimeRef.current < STOPPED_THROTTLE_MS) {
          return;
        }
      }
      lastAcceptedTimeRef.current = now;

      // --- Kalman filter ---
      const { position: filtered, state: kalmanState } = kalmanFilter(raw, accuracy, kalmanRef.current);
      kalmanRef.current = kalmanState;

      // --- Speed estimation ---
      const gpsSpeed = pos.coords.speed;
      let speed: number;
      if (gpsSpeed != null && !isNaN(gpsSpeed) && gpsSpeed >= 0) {
        speed = gpsSpeed;
      } else if (positionRef.current) {
        const dt2 = Math.max((now - (kalmanRef.current?.lastUpdate ?? now)) / 1000, 0.1);
        const dist = haversineMeters(positionRef.current, filtered);
        speed = dist / dt2;
      } else {
        speed = 0;
      }

      // --- Movement detection ---
      let movement: MovementState = movementRef.current;
      if (speed > WALK_SPEED_THRESHOLD) {
        movement = 'walking';
        lastMovementTimeRef.current = now;
      } else if (now - lastMovementTimeRef.current > STOP_TIMEOUT_MS) {
        movement = 'stopped';
      }
      movementRef.current = movement;

      // --- Status ---
      let status: GeoStatus = 'granted';
      let message = '';
      if (accuracy > 50) {
        status = 'weak';
        message = STATUS_MESSAGES.weak;
      }

      const heading = smoothHeading(pos.coords.heading);

      positionRef.current = filtered;
      accuracyRef.current = accuracy;
      speedRef.current = speed;

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
          position: s.position ?? DEFAULT_CENTER,
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
        // Auto-retry after a brief delay
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => startTracking(), 2000);
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
  }, [smoothHeading]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
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
      if (visible && enabled && watchIdRef.current !== null) {
        // Restart tracking when returning to foreground
        stopTracking();
        startTracking();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [enabled, startTracking, stopTracking]);

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
