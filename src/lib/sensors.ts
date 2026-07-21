import type { SensorAvailability } from '@/types/adventure'

export function detectSensors(): SensorAvailability {
  const has = (name: string) => typeof name !== 'undefined' && name in window
  return {
    compass: typeof DeviceOrientationEvent !== 'undefined',
    accelerometer: typeof DeviceMotionEvent !== 'undefined',
    gyroscope: typeof DeviceMotionEvent !== 'undefined',
    camera: !!navigator.mediaDevices?.getUserMedia,
    gps: 'geolocation' in navigator,
  }
}

export function startCompass(onHeading: (heading: number) => void): () => void {
  let alpha = 0
  let beta = 0
  let gamma = 0
  let smoothed = 0
  let initialized = false

  const handler = (event: DeviceOrientationEvent) => {
    if (event.absolute || event.alpha != null) {
      alpha = event.alpha ?? 0
      beta = event.beta ?? 0
      gamma = event.gamma ?? 0
    } else {
      return
    }

    let heading = 360 - alpha

    if (beta !== undefined && gamma !== undefined) {
      const _beta = beta
      const _gamma = gamma
      if (_beta < -45 || _beta > 45) return
    }

    if (!initialized) {
      smoothed = heading
      initialized = true
    } else {
      let diff = heading - smoothed
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      smoothed += diff * 0.15
      smoothed = (smoothed + 360) % 360
    }
    onHeading(smoothed)
  }

  const tryStart = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const perm = await (DeviceOrientationEvent as any).requestPermission()
        if (perm !== 'granted') return
      }
      window.addEventListener('deviceorientationabsolute', handler as EventListener, true)
      window.addEventListener('deviceorientation', handler as EventListener, true)
    } catch {
      // ignore
    }
  }

  tryStart()

  return () => {
    window.removeEventListener('deviceorientationabsolute', handler as EventListener, true)
    window.removeEventListener('deviceorientation', handler as EventListener, true)
  }
}

export function startAccelerometer(onTilt: (x: number, y: number, z: number) => void): () => void {
  let smoothed = { x: 0, y: 0, z: 0 }
  let initialized = false

  const handler = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity
    if (!acc) return
    const x = acc.x ?? 0
    const y = acc.y ?? 0
    const z = acc.z ?? 0
    if (!initialized) {
      smoothed = { x, y, z }
      initialized = true
    } else {
      smoothed.x += (x - smoothed.x) * 0.2
      smoothed.y += (y - smoothed.y) * 0.2
      smoothed.z += (z - smoothed.z) * 0.2
    }
    onTilt(smoothed.x, smoothed.y, smoothed.z)
  }

  const tryStart = async () => {
    try {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const perm = await (DeviceMotionEvent as any).requestPermission()
        if (perm !== 'granted') return
      }
      window.addEventListener('devicemotion', handler as EventListener, true)
    } catch {
      // ignore
    }
  }

  tryStart()

  return () => window.removeEventListener('devicemotion', handler as EventListener, true)
}

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
