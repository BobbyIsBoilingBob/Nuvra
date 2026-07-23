import type { GpsPosition, SensorAvailability } from '@/types/adventure'

export function detectSensors(): SensorAvailability {
  return { gps: 'geolocation' in navigator, compass: typeof window !== 'undefined' && 'DeviceOrientation' in window, accelerometer: typeof window !== 'undefined' && 'DeviceMotion' in window }
}
export function getCurrentPosition(): Promise<GpsPosition | null> {
  return new Promise(resolve => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, heading: pos.coords.heading ?? undefined, speed: pos.coords.speed ?? undefined }),
      () => resolve(null), { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  })
}

// Throttled GPS watcher to reduce re-renders — only emits when position changes beyond threshold
export function watchPosition(onPos: (p: GpsPosition) => void, minDeltaMeters = 3): () => void {
  if (!('geolocation' in navigator)) return () => {}
  let lastLat = 0, lastLng = 0
  const id = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude
      // Skip if change is below threshold (reduces jitter and re-renders)
      if (lastLat) {
        const dLat = (lat - lastLat) * 111000
        const dLng = (lng - lastLng) * 111000 * Math.cos(lat * Math.PI / 180)
        if (Math.sqrt(dLat * dLat + dLng * dLng) < minDeltaMeters) return
      }
      lastLat = lat; lastLng = lng
      onPos({ lat, lng, accuracy: pos.coords.accuracy, heading: pos.coords.heading ?? undefined, speed: pos.coords.speed ?? undefined })
    }, () => {}, { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
  )
  return () => navigator.geolocation.clearWatch(id)
}

// Throttled compass to reduce re-renders — only emits when heading changes by >= 2 degrees
export function startCompass(onHeading: (h: number) => void, minDelta = 2): () => void {
  let lastHeading = -1
  const handler = (e: DeviceOrientationEvent) => {
    const heading = e.alpha ? Math.round(360 - e.alpha) : 0
    if (lastHeading < 0 || Math.abs(heading - lastHeading) >= minDelta) {
      lastHeading = heading
      onHeading(heading)
    }
  }
  window.addEventListener('deviceorientation', handler)
  return () => window.removeEventListener('deviceorientation', handler)
}
