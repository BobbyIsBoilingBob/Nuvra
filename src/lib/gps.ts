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
  let lastPos: GpsPosition | null = null
  const id = navigator.geolocation.watchPosition(
    pos => {
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp }
      if (lastPos) {
        const dLat = newPos.lat - lastPos.lat
        const dLng = newPos.lng - lastPos.lng
        const dist = Math.sqrt(dLat * dLat + dLng * dLng)
        if (dist < 0.00001 && newPos.accuracy > lastPos.accuracy) return
      }
      lastPos = newPos
      onUpdate(newPos)
    },
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
  )
  return () => navigator.geolocation.clearWatch(id)
}
