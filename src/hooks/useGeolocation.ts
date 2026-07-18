import { useEffect, useRef, useState, useCallback } from 'react';
import type { GeoPoint } from '../types';

const DRIFT_THRESHOLD_M = 5;
const SPEED_CAP_KMH = 15;

function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface GeoState {
  position: GeoPoint | null;
  route: GeoPoint[];
  distance: number;
  active: boolean;
  error: string | null;
}

interface GeoActions {
  start: (origin?: GeoPoint) => void;
  stop: () => void;
  reset: () => void;
}

export function useGeolocation(): GeoState & GeoActions {
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [route, setRoute] = useState<GeoPoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<GeoPoint | null>(null);
  const lastTimeRef = useRef<number>(0);

  const start = useCallback((origin?: GeoPoint) => {
    setError(null);
    setActive(true);
    if (origin) {
      setPosition(origin);
      setRoute([origin]);
      lastPointRef.current = origin;
      lastTimeRef.current = Date.now();
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }
    if (watchIdRef.current !== null) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: GeoPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(pt);
        setRoute((prev) => {
          if (prev.length === 0) { lastPointRef.current = pt; lastTimeRef.current = Date.now(); return [pt]; }
          const last = lastPointRef.current;
          if (!last) { lastPointRef.current = pt; lastTimeRef.current = Date.now(); return [...prev, pt]; }
          const dMeters = haversineMeters(last, pt);
          const now = Date.now();
          const dtSec = Math.max((now - lastTimeRef.current) / 1000, 1);
          const speedKmh = (dMeters / 1000) / (dtSec / 3600);
          if (dMeters < DRIFT_THRESHOLD_M || speedKmh > SPEED_CAP_KMH) return prev;
          setDistance((dist) => dist + dMeters);
          lastPointRef.current = pt;
          lastTimeRef.current = now;
          return [...prev, pt];
        });
      },
      (err) => { setError(err.message || 'Unable to get your location.'); },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
  }, []);

  const reset = useCallback(() => {
    setRoute([]); setDistance(0); setPosition(null);
    lastPointRef.current = null; lastTimeRef.current = 0;
  }, []);

  useEffect(() => {
    return () => { if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; } };
  }, []);

  return { position, route, distance, active, error, start, stop, reset };
}
