import { useState, useEffect, useRef, useCallback } from 'react';
import { smoothPosition, type LatLng, DEFAULT_CENTER } from '../lib/map-utils';

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'weak' | 'error';

export interface GeoState {
  position: LatLng | null;
  heading: number | null;
  accuracy: number | null;
  speed: number | null;
  status: GeoStatus;
  message: string;
}

const STATUS_MESSAGES: Record<GeoStatus, string> = {
  idle: '',
  requesting: 'Requesting location permission...',
  granted: '',
  denied: 'Location permission denied. Using approximate location.',
  unavailable: 'GPS unavailable. Showing default area.',
  weak: 'Weak GPS signal. Position may be less accurate.',
  error: 'Unable to get your location. Please check settings.',
};

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
  });
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<LatLng | null>(null);

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
      const raw: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const smoothed = smoothPosition(raw, lastPosRef.current);
      lastPosRef.current = smoothed;

      const accuracy = pos.coords.accuracy;
      let status: GeoStatus = 'granted';
      let message = '';
      if (accuracy > 50) {
        status = 'weak';
        message = STATUS_MESSAGES.weak;
      }

      setState({
        position: smoothed,
        heading: pos.coords.heading ?? null,
        accuracy,
        speed: pos.coords.speed ?? null,
        status,
        message,
      });
    };

    const onError = (err: GeolocationPositionError) => {
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
          position: DEFAULT_CENTER,
        }));
      } else {
        setState((s) => ({
          ...s,
          status: 'error',
          message: STATUS_MESSAGES.error,
          position: DEFAULT_CENTER,
        }));
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });
  }, []);

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
