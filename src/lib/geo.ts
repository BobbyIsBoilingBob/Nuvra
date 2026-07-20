import type { GeoPoint } from '@/types/adventure'

const R = 6371e3
const toRad = (d: number): number => (d * Math.PI) / 180
const toDeg = (r: number): number => (r * 180) / Math.PI

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function pathLengthMeters(points: GeoPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += distanceMeters(points[i - 1], points[i])
  return total
}

export function bearingDeg(a: GeoPoint, b: GeoPoint): number {
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat), dLng = toRad(b.lng - a.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export function destinationPoint(start: GeoPoint, bearing: number, distanceM: number): GeoPoint {
  const lat1 = toRad(start.lat), lng1 = toRad(start.lng), brng = toRad(bearing), dr = distanceM / R
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(brng))
  const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(dr) * Math.cos(lat1), Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2))
  return { lat: toDeg(lat2), lng: ((toDeg(lng2) + 540) % 360) - 180 }
}

export function boundingBox(points: GeoPoint[], padMeters = 200): { south: number; west: number; north: number; east: number } {
  if (points.length === 0) return { south: 0, west: 0, north: 0, east: 0 }
  let minLat = points[0].lat, maxLat = points[0].lat, minLng = points[0].lng, maxLng = points[0].lng
  for (const p of points) { minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat); minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng) }
  const sw = destinationPoint({ lat: minLat, lng: minLng }, 225, padMeters)
  const ne = destinationPoint({ lat: maxLat, lng: maxLng }, 45, padMeters)
  return { south: sw.lat, west: sw.lng, north: ne.lat, east: ne.lng }
}

export function formatDistance(m: number): string { return m < 950 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km` }
export function formatDuration(min: number): string { if (min < 60) return `${Math.round(min)} min`; const h = Math.floor(min / 60), m = Math.round(min % 60); return m === 0 ? `${h} hr` : `${h} hr ${m} min` }
export const WALKING_SPEED_MPS = 1.35
