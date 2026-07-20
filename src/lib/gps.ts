import type { GpsPosition, GpsStatus } from '@/types/adventure'

export function isGpsAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

export function getCurrentPosition(): Promise<GpsPosition | null> {
  return new Promise((resolve) => {
    if (!isGpsAvailable()) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  })
}

export function watchPosition(cb: (pos: GpsPosition) => void): () => void {
  if (!isGpsAvailable()) return () => {}
  const id = navigator.geolocation.watchPosition(
    (pos) => cb({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    }),
    () => {},
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
  )
  return () => navigator.geolocation.clearWatch(id)
}

export function getGpsStatus(): GpsStatus {
  return isGpsAvailable() ? 'idle' : 'unavailable'
}
