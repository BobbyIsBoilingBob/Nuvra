export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GPS drift filter: ignore movements below this threshold (in km)
const GPS_DRIFT_THRESHOLD = 0.003; // 3 meters

// Maximum plausible walking speed (km/h) — reject jumps above this as GPS noise
const MAX_WALKING_SPEED = 15; // 15 km/h generous upper bound

export type GpsFilter = {
  lastLat: number | null;
  lastLon: number | null;
  lastTime: number | null;
  totalDistance: number;
};

export function createGpsFilter(): GpsFilter {
  return { lastLat: null, lastLon: null, lastTime: null, totalDistance: 0 };
}

export function filterGpsReading(filter: GpsFilter, lat: number, lon: number, time: number): { accepted: boolean; distance: number } {
  if (filter.lastLat === null || filter.lastLon === null || filter.lastTime === null) {
    filter.lastLat = lat;
    filter.lastLon = lon;
    filter.lastTime = time;
    return { accepted: true, distance: 0 };
  }

  const dist = haversineDistance(filter.lastLat, filter.lastLon, lat, lon);
  const elapsedHours = (time - filter.lastTime) / 3600000;

  // Reject GPS drift: movement below threshold
  if (dist < GPS_DRIFT_THRESHOLD) {
    return { accepted: false, distance: 0 };
  }

  // Reject impossible speed (GPS jump)
  if (elapsedHours > 0) {
    const speed = dist / elapsedHours;
    if (speed > MAX_WALKING_SPEED) {
      return { accepted: false, distance: 0 };
    }
  }

  filter.lastLat = lat;
  filter.lastLon = lon;
  filter.lastTime = time;
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
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
