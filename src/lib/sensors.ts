import type { SensorAvailability } from '@/types/adventure'

export function detectSensors(): SensorAvailability {
  return {
    compass: typeof DeviceOrientationEvent !== 'undefined',
    accelerometer: typeof DeviceMotionEvent !== 'undefined',
    gyroscope: typeof DeviceMotionEvent !== 'undefined',
    camera: !!navigator.mediaDevices?.getUserMedia,
    gps: 'geolocation' in navigator,
  }
}

export function startCompass(onHeading: (h: number) => void): () => void {
  let smoothed = 0, init = false
  const handler = (e: DeviceOrientationEvent) => {
    if (e.alpha == null) return
    let heading = 360 - e.alpha
    if (!init) { smoothed = heading; init = true } else {
      let diff = heading - smoothed
      if (diff > 180) diff -= 360; if (diff < -180) diff += 360
      smoothed += diff * 0.15; smoothed = (smoothed + 360) % 360
    }
    onHeading(smoothed)
  }
  ;(async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        if ((await (DeviceOrientationEvent as any).requestPermission()) !== 'granted') return
      }
      window.addEventListener('deviceorientationabsolute', handler as EventListener, true)
      window.addEventListener('deviceorientation', handler as EventListener, true)
    } catch {}
  })()
  return () => {
    window.removeEventListener('deviceorientationabsolute', handler as EventListener, true)
    window.removeEventListener('deviceorientation', handler as EventListener, true)
  }
}

export function startAccelerometer(onTilt: (x: number, y: number, z: number) => void): () => void {
  let s = { x: 0, y: 0, z: 0 }, init = false
  const handler = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity; if (!a) return
    const x = a.x ?? 0, y = a.y ?? 0, z = a.z ?? 0
    if (!init) { s = { x, y, z }; init = true } else { s.x += (x - s.x) * 0.2; s.y += (y - s.y) * 0.2; s.z += (z - s.z) * 0.2 }
    onTilt(s.x, s.y, s.z)
  }
  ;(async () => {
    try {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        if ((await (DeviceMotionEvent as any).requestPermission()) !== 'granted') return
      }
      window.addEventListener('devicemotion', handler as EventListener, true)
    } catch {}
  })()
  return () => window.removeEventListener('devicemotion', handler as EventListener, true)
}

export async function requestCamera(facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream | null> {
  try { return await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false }) } catch { return null }
}
