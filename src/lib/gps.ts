export interface Coordinates {
  lat: number
  lng: number
}

const EARTH_RADIUS_M = 6371000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function offsetCoords(origin: Coordinates, distanceM: number, bearingDeg: number): Coordinates {
  const dist = distanceM / EARTH_RADIUS_M
  const brg = toRad(bearingDeg)
  const lat1 = toRad(origin.lat)
  const lng1 = toRad(origin.lng)
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + Math.cos(lat1) * Math.sin(dist) * Math.cos(brg))
  const lng2 = lng1 + Math.atan2(Math.sin(brg) * Math.sin(dist) * Math.cos(lat1), Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2))
  return { lat: toDeg(lat2), lng: ((toDeg(lng2) + 540) % 360) - 180 }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

export function estimateSteps(distanceM: number): number {
  return Math.round(distanceM / 0.75)
}

export function generateWaypoints(origin: Coordinates, count: number, radius: number): Coordinates[] {
  const waypoints: Coordinates[] = []
  const angleStep = 360 / count
  for (let i = 0; i < count; i++) {
    const angle = (angleStep * i + Math.random() * 30 - 15) % 360
    const dist = radius * (0.6 + Math.random() * 0.4)
    waypoints.push(offsetCoords(origin, dist, angle))
  }
  return waypoints
}
