import { useEffect, useState, useCallback, useRef } from 'react';

export type Geo = { lat: number; lng: number; accuracy: number; heading: number | null; speed: number | null };

export function useGeolocation(enabled: boolean) {
  const [position, setPosition] = useState<Geo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastRef = useRef<Geo | null>(null);

  const handle = useCallback((pos: GeolocationPosition) => {
    const geo: Geo = {
      lat: pos.coords.latitude, lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy, heading: pos.coords.heading, speed: pos.coords.speed,
    };
    if (lastRef.current) {
      const dt = geo.lat - lastRef.current.lat;
      const dn = geo.lng - lastRef.current.lng;
      const distM = Math.sqrt(dt * dt + dn * dn) * 111000;
      if (distM < 3) return;
    }
    lastRef.current = geo;
    setPosition(geo);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      return;
    }
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    watchId.current = navigator.geolocation.watchPosition(handle, (e) => setError(e.message), { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 });
    return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); };
  }, [enabled, handle]);

  return { position, error };
}
