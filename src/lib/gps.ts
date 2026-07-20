import type { GpsPosition, GpsStatus } from '@/types/adventure'

let watchId: number | null = null

export function getCurrentPosition(): Promise<GpsPosition | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, heading: pos.coords.heading, speed: pos.coords.speed, timestamp: pos.timestamp }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    )
  })
}

export type GpsCallback = (pos: GpsPosition | null, status: GpsStatus) => void

export function watchPosition(cb: GpsCallback): () => void {
  if (!('geolocation' in navigator)) { cb(null, 'unavailable'); return () => {} }
  cb(null, 'requesting')
  watchId = navigator.geolocation.watchPosition(
    (pos) => cb({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, heading: pos.coords.heading, speed: pos.coords.speed, timestamp: pos.timestamp }, 'granted'),
    (err) => cb(null, err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
  )
  return () => { if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null } }
}

export function isGpsAvailable(): boolean { return 'geolocation' in navigator }
