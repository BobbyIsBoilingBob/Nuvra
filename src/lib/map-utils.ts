export type LatLng = { lat: number; lng: number };
export const DEFAULT_CENTER: LatLng = { lat: 51.5074, lng: -0.1278 };

const EARTH_RADIUS_KM = 6371;

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function haversineMeters(p1: LatLng, p2: LatLng): number {
  return haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng) * 1000;
}

export type GpsFilter = { lastLat: number | null; lastLon: number | null; lastTime: number | null; totalDistance: number; };

const GPS_DRIFT_THRESHOLD_KM = 0.005;
const MAX_WALKING_SPEED_KMH = 15;

export function createGpsFilter(): GpsFilter {
  return { lastLat: null, lastLon: null, lastTime: null, totalDistance: 0 };
}

export function filterGpsReading(filter: GpsFilter, lat: number, lon: number, time: number): { accepted: boolean; distance: number } {
  if (filter.lastLat === null || filter.lastLon === null || filter.lastTime === null) {
    filter.lastLat = lat; filter.lastLon = lon; filter.lastTime = time;
    return { accepted: true, distance: 0 };
  }
  const dist = haversineDistance(filter.lastLat, filter.lastLon, lat, lon);
  const elapsedHours = (time - filter.lastTime) / 3600000;
  if (dist < GPS_DRIFT_THRESHOLD_KM) return { accepted: false, distance: 0 };
  if (elapsedHours > 0) {
    const speed = dist / elapsedHours;
    if (speed > MAX_WALKING_SPEED_KMH) return { accepted: false, distance: 0 };
  }
  filter.lastLat = lat; filter.lastLon = lon; filter.lastTime = time;
  filter.totalDistance += dist;
  return { accepted: true, distance: dist };
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function routeToLatLngs(route: { x: number; y: number }[], center: LatLng, spanMeters = 800): LatLng[] {
  const metersPerDegLat = 111320;
  const halfSpan = spanMeters / 2;
  return route.map((p) => ({
    lat: center.lat + ((p.y - 50) / 50) * (halfSpan / metersPerDegLat),
    lng: center.lng + ((p.x - 50) / 50) * (halfSpan / (111320 * Math.cos((center.lat * Math.PI) / 180))),
  }));
}

export function checkpointsToLatLngs(checkpoints: { id: string; x: number; y: number; label: string; kind: string }[], center: LatLng, spanMeters = 800): { id: string; label: string; kind: string; latlng: LatLng }[] {
  const metersPerDegLat = 111320;
  const halfSpan = spanMeters / 2;
  return checkpoints.map((c) => ({
    id: c.id, label: c.label, kind: c.kind,
    latlng: {
      lat: center.lat + ((c.y - 50) / 50) * (halfSpan / metersPerDegLat),
      lng: center.lng + ((c.x - 50) / 50) * (halfSpan / (111320 * Math.cos((center.lat * Math.PI) / 180))),
    },
  }));
}

export function treasuresToLatLngs(treasures: { id: string; x: number; y: number; rarity: string }[], center: LatLng, spanMeters = 800): { id: string; rarity: string; latlng: LatLng }[] {
  const metersPerDegLat = 111320;
  const halfSpan = spanMeters / 2;
  return treasures.map((t) => ({
    id: t.id, rarity: t.rarity,
    latlng: {
      lat: center.lat + ((t.y - 50) / 50) * (halfSpan / metersPerDegLat),
      lng: center.lng + ((t.x - 50) / 50) * (halfSpan / (111320 * Math.cos((center.lat * Math.PI) / 180))),
    },
  }));
}
