export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DRIFT_THRESHOLD_M = 5;
const SPEED_CAP_KMH = 15;

export function filterGpsReading(prev: { lat: number; lng: number; ts: number }, next: { lat: number; lng: number; ts: number }) {
  const dist = haversineDistance(prev.lat, prev.lng, next.lat, next.lng);
  const dt = Math.max(1, (next.ts - prev.ts) / 1000);
  if (dist < DRIFT_THRESHOLD_M) return null;
  const speedKmh = (dist / dt) * 3.6;
  if (speedKmh > SPEED_CAP_KMH) return null;
  return next;
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

export function formatDuration(s: number): string {
  const mins = Math.floor(s / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export function routeToLatLngs(route: { lat: number; lng: number }[]): [number, number][] {
  return route.map((p) => [p.lat, p.lng] as [number, number]);
}
