import { useState, useEffect, useCallback, useRef } from 'react';
import { filterGpsReading } from '../lib/map-utils';

export type GpsReading = { lat: number; lng: number; ts: number; accuracy?: number };

export function useGeolocation() {
  const [position, setPosition] = useState<GpsReading | null>(null);
  const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const prevRef = useRef<GpsReading | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition((pos) => {
      const reading: GpsReading = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now(), accuracy: pos.coords.accuracy };
      if (prevRef.current) { const filtered = filterGpsReading(prevRef.current, reading); if (filtered) { setPosition(filtered); setRoute((prev) => [...prev, { lat: filtered.lat, lng: filtered.lng }]); const dLat = (filtered.lat - prevRef.current.lat) * 111000; const dLng = (filtered.lng - prevRef.current.lng) * 111000 * Math.cos((filtered.lat * Math.PI) / 180); setDistance((d) => d + Math.sqrt(dLat * dLat + dLng * dLng)); prevRef.current = filtered; } }
      else { prevRef.current = reading; setPosition(reading); setRoute([{ lat: reading.lat, lng: reading.lng }]); }
    }, (err) => setError(err.message), { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 });
  }, []);

  const stop = useCallback(() => { setTracking(false); if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; } }, []);
  const reset = useCallback(() => { setRoute([]); setDistance(0); prevRef.current = null; setPosition(null); }, []);
  useEffect(() => () => stop(), [stop]);
  return { position, route, distance, error, tracking, start, stop, reset };
}
