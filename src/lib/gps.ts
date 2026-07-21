import type { GpsPosition } from '@/types/adventure'

export function getCurrentPosition(): Promise<GpsPosition | null> {
  return new Promise(resolve => {
    if (!('geolocation' in navigator)) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  })
}

export function watchPosition(onUpdate: (pos: GpsPosition) => void): () => void {
  if (!('geolocation' in navigator)) return () => {}
  let last: GpsPosition | null = null
  const id = navigator.geolocation.watchPosition(
    pos => {
      const np = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp }
      if (last) {
        const dLat = np.lat - last.lat, dLng = np.lng - last.lng
        if (Math.sqrt(dLat * dLat + dLng * dLng) < 0.00001 && np.accuracy > last.accuracy) return
      }
      last = np; onUpdate(np)
    },
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
  )
  return () => navigator.geolocation.clearWatch(id)
}
