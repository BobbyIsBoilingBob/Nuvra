import type { SensorAvailability, CompassReading, AccelerometerReading, SensorType } from '@/types/adventure'

export function detectSensors(): SensorAvailability {
  return {
    compass: 'DeviceOrientationEvent' in window || 'ondeviceorientationabsolute' in window,
    accelerometer: 'Accelerometer' in window || 'DeviceMotionEvent' in window,
    gyroscope: 'Gyroscope' in window,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  }
}

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

export type CompassCallback = (reading: CompassReading) => void
let compassHandler: ((e: DeviceOrientationEvent) => void) | null = null

export async function startCompass(cb: CompassCallback): Promise<() => void> {
  const anyDOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof anyDOE.requestPermission === 'function') {
    try { const res = await anyDOE.requestPermission(); if (res !== 'granted') return () => {} } catch { return () => {} }
  }
  compassHandler = (e: DeviceOrientationEvent) => {
    const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading
    if (typeof heading === 'number' && !isNaN(heading)) cb({ heading, accuracy: (e as unknown as { webkitCompassAccuracy?: number }).webkitCompassAccuracy ?? 0 })
    else if (e.alpha !== null) cb({ heading: 360 - e.alpha, accuracy: 0 })
  }
  window.addEventListener('deviceorientation', compassHandler, true)
  return () => { if (compassHandler) { window.removeEventListener('deviceorientation', compassHandler, true); compassHandler = null } }
}

export type AccelerometerCallback = (reading: AccelerometerReading) => void
let motionHandler: ((e: DeviceMotionEvent) => void) | null = null

export async function startAccelerometer(cb: AccelerometerCallback): Promise<() => void> {
  const anyDME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof anyDME.requestPermission === 'function') {
    try { const res = await anyDME.requestPermission(); if (res !== 'granted') return () => {} } catch { return () => {} }
  }
  motionHandler = (e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return
    const total = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2)
    const tilt = total > 0 ? Math.acos(Math.abs(acc.z) / total) * (180 / Math.PI) : 0
    cb({ x: acc.x, y: acc.y, z: acc.z, tilt })
  }
  window.addEventListener('devicemotion', motionHandler, true)
  return () => { if (motionHandler) { window.removeEventListener('devicemotion', motionHandler, true); motionHandler = null } }
}

export async function requestCamera(facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream | null> {
  try { return await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false }) } catch { return null }
}
