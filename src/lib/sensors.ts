import type { GpsPosition, SensorAvailability } from '@/types/adventure'

export function detectSensors(): SensorAvailability {
  return {
    gps: 'geolocation' in navigator,
    compass: typeof window !== 'undefined' && 'DeviceOrientation' in window,
    accelerometer: typeof window !== 'undefined' && 'DeviceMotion' in window,
  }
}

export function getCurrentPosition(): Promise<GpsPosition | null> {
  return new Promise(resolve => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, heading: pos.coords.heading ?? undefined, speed: pos.coords.speed ?? undefined }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  })
}

export function watchPosition(onPos: (p: GpsPosition) => void): () => void {
  if (!('geolocation' in navigator)) return () => {}
  let lastLat = 0, lastLng = 0
  const id = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      if (lastLat && Math.abs(lat - lastLat) < 0.00001 && Math.abs(lng - lastLng) < 0.00001) return
      lastLat = lat; lastLng = lng
      onPos({ lat, lng, accuracy: pos.coords.accuracy, heading: pos.coords.heading ?? undefined, speed: pos.coords.speed ?? undefined })
    },
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
  )
  return () => navigator.geolocation.clearWatch(id)
}

export function startCompass(onHeading: (h: number) => void): () => void {
  const handler = (e: DeviceOrientationEvent) => {
    const heading = e.alpha ? 360 - e.alpha : 0
    onHeading(Math.round(heading))
  }
  window.addEventListener('deviceorientation', handler)
  return () => window.removeEventListener('deviceorientation', handler)
}
