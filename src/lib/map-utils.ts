// ============================================================
// Map utilities — coordinate conversion, distance, bearing
// ============================================================
// Uses OpenStreetMap (Leaflet) instead of Google Maps because:
//  - No API key required, free for production use
//  - Excellent performance with canvas/WebGL tile layers
//  - Supports satellite, terrain, and standard road tiles via multiple providers
//  - Full plugin ecosystem for clustering, routing, geocoding
// ============================================================

import type { MapPoint, MapCheckpoint, MapTreasure, MapCoin } from '../data';

export interface LatLng { lat: number; lng: number }

// --- Grid (0-100) to LatLng conversion ---
// Adventure data uses a 0-100 grid. We project it onto real-world
// coordinates centered on the user's GPS location, scaled so the
// full route spans roughly `spanMeters` across.
const EARTH_RADIUS_M = 6378137;

function metersToLat(meters: number): number {
  return meters / EARTH_RADIUS_M * (180 / Math.PI);
}

function metersToLng(meters: number, lat: number): number {
  return meters / (EARTH_RADIUS_M * Math.cos((lat * Math.PI) / 180)) * (180 / Math.PI);
}

/**
 * Convert a 0-100 grid point to a real lat/lng given a center and span.
 * Grid (0,0) = south-west, (100,100) = north-east.
 */
export function gridToLatLng(
  point: { x: number; y: number },
  center: LatLng,
  spanMeters: number,
): LatLng {
  const halfSpan = spanMeters / 2;
  const offsetX = (point.x - 50) / 50 * halfSpan;
  const offsetY = (point.y - 50) / 50 * halfSpan;
  return {
    lat: center.lat + metersToLat(offsetY),
    lng: center.lng + metersToLng(offsetX, center.lat),
  };
}

/** Convert an entire route path. */
export function routeToLatLngs(
  route: MapPoint[],
  center: LatLng,
  spanMeters: number,
): LatLng[] {
  return route.map((p) => gridToLatLng(p, center, spanMeters));
}

/** Convert checkpoints. */
export function checkpointsToLatLngs(
  checkpoints: MapCheckpoint[],
  center: LatLng,
  spanMeters: number,
): Array<MapCheckpoint & { latlng: LatLng }> {
  return checkpoints.map((c) => ({
    ...c,
    latlng: gridToLatLng(c, center, spanMeters),
  }));
}

/** Convert treasures. */
export function treasuresToLatLngs(
  treasures: MapTreasure[],
  center: LatLng,
  spanMeters: number,
): Array<MapTreasure & { latlng: LatLng }> {
  return treasures.map((t) => ({
    ...t,
    latlng: gridToLatLng(t, center, spanMeters),
  }));
}

/** Convert coins. */
export function coinsToLatLngs(
  coins: MapCoin[],
  center: LatLng,
  spanMeters: number,
): Array<MapCoin & { latlng: LatLng }> {
  return coins.map((c) => ({
    ...c,
    latlng: gridToLatLng(c, center, spanMeters),
  }));
}

// --- Haversine distance (meters) ---
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// --- Bearing (degrees, 0 = north, clockwise) ---
export function bearing(a: LatLng, b: LatLng): number {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Total route length in meters. */
export function routeLengthMeters(route: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineMeters(route[i - 1], route[i]);
  }
  return total;
}

/** Estimated walking time (minutes) at 5 km/h. */
export function estimateWalkMinutes(distanceMeters: number): number {
  return Math.ceil((distanceMeters / 1000) * 12);
}

// --- GPS smoothing (exponential moving average) ---
export function smoothPosition(
  current: LatLng,
  previous: LatLng | null,
  alpha = 0.6,
): LatLng {
  if (!previous) return current;
  return {
    lat: previous.lat + alpha * (current.lat - previous.lat),
    lng: previous.lng + alpha * (current.lng - previous.lng),
  };
}

// --- Default fallback location (London) ---
export const DEFAULT_CENTER: LatLng = { lat: 51.5074, lng: -0.1278 };
