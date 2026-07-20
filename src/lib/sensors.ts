import type { SensorAvailability, SensorType } from '@/types/adventure'

export function detectSensors(): SensorAvailability {
  if (typeof window === 'undefined') {
    return { compass: false, accelerometer: false, gyroscope: false, camera: false, gps: false }
  }
  return {
    compass: typeof DeviceOrientationEvent !== 'undefined',
    accelerometer: typeof DeviceMotionEvent !== 'undefined',
    gyroscope: typeof window !== 'undefined' && 'Gyroscope' in window,
    camera: typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia,
    gps: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  }
}

export function isSensorAvailable(type: SensorType, avail: SensorAvailability): boolean {
  if (type === 'none') return true
  return avail[type] ?? false
}

// Low-pass filter for compass smoothing to reduce jitter
class CompassFilter {
  private smoothed: number | null = null
  private alpha = 0.15

  update(raw: number): number {
    if (this.smoothed === null) {
      this.smoothed = raw
      return raw
    }
    // Handle wraparound (0/360 boundary)
    let diff = raw - this.smoothed
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    this.smoothed = (this.smoothed + diff * this.alpha + 360) % 360
    return this.smoothed
  }

  reset() {
    this.smoothed = null
  }
}

const compassFilter = new CompassFilter()

export function startCompass(cb: (heading: number) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  compassFilter.reset()

  const handler = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    const raw = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : 0)
    cb(compassFilter.update(raw))
  }

  const orient = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof orient.requestPermission === 'function') {
    orient.requestPermission().then((state: string) => {
      if (state === 'granted') window.addEventListener('deviceorientation', handler, true)
    }).catch(() => {})
  } else {
    window.addEventListener('deviceorientation', handler, true)
  }

  return () => window.removeEventListener('deviceorientation', handler, true)
}

export function startAccelerometer(cb: (x: number, y: number, z: number) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity
    if (acc) cb(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0)
  }

  const motion = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof motion.requestPermission === 'function') {
    motion.requestPermission().then((state: string) => {
      if (state === 'granted') window.addEventListener('devicemotion', handler, true)
    }).catch(() => {})
  } else {
    window.addEventListener('devicemotion', handler, true)
  }

  return () => window.removeEventListener('devicemotion', handler, true)
}

export async function requestCamera(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream | null> {
  try {
    if (!navigator.mediaDevices?.getUserMedia) return null
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
  } catch {
    return null
  }
}
