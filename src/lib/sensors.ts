import type {
  SensorAvailability,
  CompassReading,
  AccelerometerReading,
  SensorType,
} from '@/types/adventure'

/** Detect which sensors are available on this device. */
export function detectSensors(): SensorAvailability {
  const hasCompass = 'DeviceOrientationEvent' in window || 'ondeviceorientationabsolute' in window
  const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  const hasGyro = 'Gyroscope' in window
  const hasAccel = 'Accelerometer' in window || 'DeviceMotionEvent' in window
  return {
    compass: hasCompass,
    accelerometer: hasAccel,
    gyroscope: hasGyro,
    geolocation: 'geolocation' in navigator,
    camera: hasCamera,
  }
}

/** Returns true if the given sensor type is available. */
export function isSensorAvailable(type: SensorType, availability: SensorAvailability): boolean {
  switch (type) {
    case 'compass': return availability.compass
    case 'accelerometer': return availability.accelerometer
    case 'gyroscope': return availability.gyroscope
    case 'geolocation': return availability.geolocation
    case 'camera': return availability.camera
    case 'none': return true
  }
}

// ── Compass ────────────────────────────────────────────────────────────

export type CompassCallback = (reading: CompassReading) => void

let compassHandler: ((e: DeviceOrientationEvent) => void) | null = null

/** Start compass readings. iOS requires permission. Returns stop fn. */
export async function startCompass(cb: CompassCallback): Promise<() => void> {
  // iOS 13+ permission gate
  const anyDOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof anyDOE.requestPermission === 'function') {
    try {
      const res = await anyDOE.requestPermission()
      if (res !== 'granted') return () => {}
    } catch {
      return () => {}
    }
  }

  compassHandler = (e: DeviceOrientationEvent) => {
    // webkitCompassHeading gives heading on iOS; alpha on others
    const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading
    if (typeof heading === 'number' && !isNaN(heading)) {
      cb({ heading, accuracy: (e as unknown as { webkitCompassAccuracy?: number }).webkitCompassAccuracy ?? 0 })
    } else if (e.alpha !== null) {
      cb({ heading: 360 - e.alpha, accuracy: 0 })
    }
  }
  window.addEventListener('deviceorientation', compassHandler, true)
  return () => {
    if (compassHandler) {
      window.removeEventListener('deviceorientation', compassHandler, true)
      compassHandler = null
    }
  }
}

// ── Accelerometer / Tilt ───────────────────────────────────────────────

export type AccelerometerCallback = (reading: AccelerometerReading) => void

let motionHandler: ((e: DeviceMotionEvent) => void) | null = null

/** Start accelerometer readings. iOS requires permission. Returns stop fn. */
export async function startAccelerometer(cb: AccelerometerCallback): Promise<() => void> {
  const anyDME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof anyDME.requestPermission === 'function') {
    try {
      const res = await anyDME.requestPermission()
      if (res !== 'granted') return () => {}
    } catch {
      return () => {}
    }
  }

  motionHandler = (e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return
    // Tilt from vertical: angle of the z-axis relative to gravity
    const total = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2)
    const tilt = total > 0 ? Math.acos(Math.abs(acc.z) / total) * (180 / Math.PI) : 0
    cb({ x: acc.x, y: acc.y, z: acc.z, tilt })
  }
  window.addEventListener('devicemotion', motionHandler, true)
  return () => {
    if (motionHandler) {
      window.removeEventListener('devicemotion', motionHandler, true)
      motionHandler = null
    }
  }
}

// ── Camera ──────────────────────────────────────────────────────────────

/** Request camera access. Returns a MediaStream or null. */
export async function requestCamera(facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    })
  } catch {
    return null
  }
}
