import type { GeoPoint } from '@/types/adventure'

export const EARTH_RADIUS_M = 6371000

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function bearingDeg(a: GeoPoint, b: GeoPoint): number {
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLng = toRad(b.lng - a.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export function destinationPoint(origin: GeoPoint, bearingDeg: number, distanceM: number): GeoPoint {
  const lat1 = toRad(origin.lat)
  const lng1 = toRad(origin.lng)
  const brng = toRad(bearingDeg)
  const d = distanceM / EARTH_RADIUS_M
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng))
  const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2))
  return { lat: toDeg(lat2), lng: ((toDeg(lng2) + 540) % 360) - 180 }
}

export function pathLengthMeters(path: GeoPoint[]): number {
  let total = 0
  for (let i = 1; i < path.length; i++) total += distanceMeters(path[i - 1], path[i])
  return total
}

export function boundingBox(path: GeoPoint[]): { north: number; south: number; east: number; west: number } {
  if (path.length === 0) return { north: 0, south: 0, east: 0, west: 0 }
  let north = path[0].lat, south = path[0].lat, east = path[0].lng, west = path[0].lng
  for (const p of path) {
    if (p.lat > north) north = p.lat
    if (p.lat < south) south = p.lat
    if (p.lng > east) east = p.lng
    if (p.lng < west) west = p.lng
  }
  const pad = 0.005
  return { north: north + pad, south: south - pad, east: east + pad, west: west - pad }
}

export const WALKING_SPEED_MPS = 1.4

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; percent: number } {
  const level = levelFromXp(xp)
  const currentLevelXp = Math.pow(level - 1, 2) * 100
  const nextLevelXp = Math.pow(level, 2) * 100
  const current = xp - currentLevelXp
  const needed = nextLevelXp - currentLevelXp
  return { current, needed, percent: Math.min(100, (current / needed) * 100) }
}
