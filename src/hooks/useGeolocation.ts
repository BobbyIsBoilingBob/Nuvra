import { useEffect, useRef, useState, useCallback } from 'react';
import { createGpsFilter, filterGpsReading, haversineMeters, type LatLng } from '../lib/map-utils';

export type GeoState = {
  position: LatLng | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  totalDistance: number;
  isMoving: boolean;
  error: string | null;
  watching: boolean;
};

export type GeoActions = {
  start: () => void;
  stop: () => void;
  reset: () => void;
};

export function useGeolocation(): [GeoState, GeoActions] {
  const [state, setState] = useState<GeoState>({
    position: null, accuracy: null, speed: null, heading: null,
    totalDistance: 0, isMoving: false, error: null, watching: false,
  });

  const filterRef = useRef(createGpsFilter());
  const watchIdRef = useRef<number | null>(null);
  const lastMovingTimeRef = useRef<number>(0);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy, speed, heading } = pos.coords;
    const now = pos.timestamp;

    const result = filterGpsReading(filterRef.current, latitude, longitude, now);

    setState((prev) => {
      // Only accept the position if the filter accepted it
      const newPosition = result.accepted ? { lat: latitude, lng: longitude } : prev.position;
      const newDistance = filterRef.current.totalDistance;

      // Determine if actually moving: accepted reading + distance > 0
      const isMoving = result.accepted && result.distance > 0;
      if (isMoving) lastMovingTimeRef.current = now;

      // If we haven't moved in 4 seconds, consider stopped
      const stopped = now - lastMovingTimeRef.current > 4000;

      return {
        position: newPosition,
        accuracy,
        speed: speed ?? null,
        heading: heading ?? null,
        totalDistance: newDistance,
        isMoving: isMoving || !stopped,
        error: null,
        watching: true,
      };
    });
  }, []);

  const start = useCallback(() => {
    if (watchIdRef.current !== null) return;
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }
    setState((prev) => ({ ...prev, watching: true, error: null }));
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => setState((prev) => ({ ...prev, error: err.message, watching: false })),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    );
  }, [handlePosition]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, watching: false, isMoving: false }));
  }, []);

  const reset = useCallback(() => {
    filterRef.current = createGpsFilter();
    lastMovingTimeRef.current = 0;
    setState((prev) => ({ ...prev, totalDistance: 0, isMoving: false }));
  }, []);

  useEffect(() => () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); }, []);

  return [state, { start, stop, reset }];
}
