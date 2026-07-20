import type { GeoPoint } from '@/types/adventure'

const R = 6371e3 // Earth radius in metres

const toRad = (deg: number): number => (deg * Math.PI) / 180
const toDeg = (rad: number): number => (rad * 180) / Math.PI

/** Haversine distance between two points in metres. */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Total path length in metres. */
export function pathLengthMeters(points: GeoPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += distanceMeters(points[i - 1], points[i])
  }
  return total
}

/** Bearing from a to b in degrees (0-359, 0 = north). */
export function bearingDeg(a: GeoPoint, b: GeoPoint): number {
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLng = toRad(b.lng - a.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/**
 * Destination point given a start, bearing, and distance.
 * Standard great-circle formula. No hard-coded cities — purely geometric.
 */
export function destinationPoint(start: GeoPoint, bearing: number, distanceM: number): GeoPoint {
  const lat1 = toRad(start.lat)
  const lng1 = toRad(start.lng)
  const brng = toRad(bearing)
  const dr = distanceM / R

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(brng),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(dr) * Math.cos(lat1),
      Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2),
    )

  return { lat: toDeg(lat2), lng: ((toDeg(lng2) + 540) % 360) - 180 }
}

/** Midpoint of two coordinates. */
export function midpoint(a: GeoPoint, b: GeoPoint): GeoPoint {
  const lat1 = toRad(a.lat)
  const lng1 = toRad(a.lng)
  const lat2 = toRad(b.lat)
  const dLng = toRad(b.lng - a.lng)

  const bx = Math.cos(lat2) * Math.cos(dLng)
  const by = Math.cos(lat2) * Math.sin(dLng)
  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2),
  )
  const lng3 = lng1 + Math.atan2(by, Math.cos(lat1) + bx)
  return { lat: toDeg(lat3), lng: ((toDeg(lng3) + 540) % 360) - 180 }
}

/** Bounding box of a set of points with padding in metres. */
export function boundingBox(points: GeoPoint[], padMeters = 200): {
  south: number
  west: number
  north: number
  east: number
} {
  if (points.length === 0) {
    return { south: 0, west: 0, north: 0, east: 0 }
  }
  let minLat = points[0].lat
  let maxLat = points[0].lat
  let minLng = points[0].lng
  let maxLng = points[0].lng
  for (const p of points) {
    minLat = Math.min(minLat, p.lat)
    maxLat = Math.max(maxLat, p.lat)
    minLng = Math.min(minLng, p.lng)
    maxLng = Math.max(maxLng, p.lng)
  }
  const sw = destinationPoint({ lat: minLat, lng: minLng }, 225, padMeters)
  const ne = destinationPoint({ lat: maxLat, lng: maxLng }, 45, padMeters)
  return { south: sw.lat, west: sw.lng, north: ne.lat, east: ne.lng }
}

/** Format metres into a human distance string. */
export function formatDistance(m: number): string {
  if (m < 950) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(1)} km`
}

/** Format seconds into a human duration string. */
export function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

/** Rough walking speed in m/s used for duration estimates. */
export const WALKING_SPEED_MPS = 1.35
