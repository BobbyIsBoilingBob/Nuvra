import { useEffect, useRef, useState } from 'react'
import type { ChallengeAssignment, GpsPosition } from '@/types/adventure'
import { startCompass, startAccelerometer, requestCamera, isSensorAvailable, detectSensors } from '@/lib/sensors'
import { distanceMeters, formatDistance } from '@/lib/geo'

export interface ChallengeRunnerProps {
  challenge: ChallengeAssignment
  playerPos: GpsPosition | null
  onComplete: (result: { xp: number; coins: number }) => void
  onSkip: () => void
}

type Phase = 'idle' | 'running' | 'success' | 'failed'

export function ChallengeRunner({ challenge, playerPos, onComplete, onSkip }: ChallengeRunnerProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [sensorData, setSensorData] = useState<Record<string, unknown>>({})
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const startTimeRef = useRef<number>(0)
  const sensors = detectSensors()

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  // Start the challenge
  const start = async () => {
    setPhase('running')
    setProgress(0)
    startTimeRef.current = Date.now()
    setMessage('')

    switch (challenge.sensorType) {
      case 'compass':
        await runCompassChallenge()
        break
      case 'accelerometer':
        await runAccelerometerChallenge()
        break
      case 'geolocation':
        runGeolocationChallenge()
        break
      case 'camera':
        await runCameraChallenge()
        break
      case 'none':
        runManualChallenge()
        break
      default:
        runManualChallenge()
    }
  }

  // Compass challenges
  const runCompassChallenge = async () => {
    const target = (challenge.sensorConfig?.targetHeading ?? challenge.data.targetHeading) as number
    const tolerance = (challenge.sensorConfig?.tolerance ?? 5) as number
    const holdSeconds = (challenge.sensorConfig?.holdSeconds ?? challenge.data.holdSeconds ?? 3) as number
    const targetMeters = challenge.data.targetMeters as number | undefined

    let holdStart = 0
    let walkStart: GeoPointLite | null = null

    const stop = await startCompass((reading) => {
      setSensorData({ heading: reading.heading, target, tolerance })
      const diff = Math.min(
        Math.abs(reading.heading - target),
        360 - Math.abs(reading.heading - target),
      )
      if (diff <= tolerance) {
        if (holdStart === 0) holdStart = Date.now()
        const held = (Date.now() - holdStart) / 1000
        if (held >= holdSeconds && !targetMeters) {
          setPhase('success')
          cleanupRef.current?.()
        }
        if (targetMeters && walkStart === null && playerPos) {
          walkStart = { lat: playerPos.lat, lng: playerPos.lng }
        }
        if (targetMeters && walkStart && playerPos) {
          const walked = distanceMeters(walkStart, playerPos)
          setProgress(walked / targetMeters)
          if (walked >= targetMeters) {
            setPhase('success')
            cleanupRef.current?.()
          }
        }
      } else {
        holdStart = 0
      }
    })
    cleanupRef.current = stop
  }

  // Accelerometer challenges (balance, step counting, steady motion)
  const runAccelerometerChallenge = async () => {
    const maxTilt = (challenge.sensorConfig?.maxTiltDeg ?? 15) as number
    const targetMeters = (challenge.sensorConfig?.targetMeters ?? challenge.data.targetMeters ?? 100) as number
    const walkStart = playerPos ? { lat: playerPos.lat, lng: playerPos.lng } : null
    let tiltFailures = 0

    const stop = await startAccelerometer((reading) => {
      setSensorData({ tilt: reading.tilt, maxTilt, targetMeters })
      if (reading.tilt > maxTilt) {
        tiltFailures++
        setMessage(`Tilt too high! Keep it under ${maxTilt}°`)
      } else if (walkStart && playerPos) {
        const walked = distanceMeters(walkStart, playerPos)
        const pct = Math.min(1, walked / targetMeters)
        setProgress(pct)
        setMessage(`Walked ${formatDistance(walked)} of ${formatDistance(targetMeters)}`)
        if (pct >= 1) {
          setPhase('success')
          cleanupRef.current?.()
        }
      } else if (!walkStart) {
        setMessage('Need GPS to track walking distance...')
      }
    })
    cleanupRef.current = stop
  }

  // Geolocation challenges (walk X metres)
  const runGeolocationChallenge = () => {
    const targetMeters = (challenge.data.targetMeters ?? 200) as number
    if (!playerPos) {
      setMessage('Waiting for GPS signal...')
      return
    }
    const start = { lat: playerPos.lat, lng: playerPos.lng }
    setMessage(`Walk ${formatDistance(targetMeters)} from here`)

    // Poll position
    const interval = setInterval(() => {
      if (playerPos) {
        const walked = distanceMeters(start, playerPos)
        const pct = Math.min(1, walked / targetMeters)
        setProgress(pct)
        setSensorData({ walked, target: targetMeters })
        if (pct >= 1) {
          setPhase('success')
          clearInterval(interval)
        }
      }
    }, 1000)
    cleanupRef.current = () => clearInterval(interval)
  }

  // Camera challenges (photography)
  const runCameraChallenge = async () => {
    const s = await requestCamera('environment')
    if (!s) {
      setMessage('Camera not available — you can mark this complete manually.')
      return
    }
    setStream(s)
    if (videoRef.current) {
      videoRef.current.srcObject = s
      videoRef.current.play().catch(() => {})
    }
  }

  // Manual challenges (trivia, observation, etc.)
  const runManualChallenge = () => {
    if (challenge.data.question && challenge.data.options) {
      setMessage('Answer the question below')
    } else {
      setMessage('Complete the task and tap "Done" when finished')
    }
  }

  const handleAnswer = (idx: number) => {
    const correct = challenge.data.answer as number
    if (idx === correct) {
      setPhase('success')
    } else {
      setPhase('failed')
      setMessage('Not quite — try again or skip.')
      setTimeout(() => setPhase('running'), 1500)
    }
  }

  const handlePhotoCapture = () => {
    setPhase('success')
    stream?.getTracks().forEach((t) => t.stop())
  }

  const handleManualDone = () => {
    setPhase('success')
  }

  // On success, report rewards
  useEffect(() => {
    if (phase === 'success') {
      onComplete({ xp: challenge.rewardXp, coins: challenge.rewardCoins })
    }
  }, [phase])

  const sensorOk = isSensorAvailable(challenge.sensorType, sensors)

  return (
    <div className="bg-ink-800 rounded-2xl p-5 border border-ink-700 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-400">
            {challenge.category} · {challenge.difficulty}
          </span>
          <h3 className="font-display text-lg font-bold text-ink-50 mt-0.5">{challenge.title}</h3>
        </div>
        <div className="text-right text-xs text-ink-400">
          <div className="text-brand-400 font-semibold">+{challenge.rewardXp} XP</div>
          <div className="text-accent-400">+{challenge.rewardCoins} coins</div>
        </div>
      </div>

      <p className="text-sm text-ink-300 leading-relaxed mb-4">{challenge.description}</p>

      {/* Sensor unavailable warning */}
      {!sensorOk && challenge.sensorType !== 'none' && phase === 'idle' && (
        <div className="bg-ink-900 rounded-xl p-3 mb-4 border border-ink-700">
          <p className="text-xs text-ink-400 mb-2">
            This challenge uses the {challenge.sensorType} sensor, which is not available on this device.
            You can skip it or mark it complete manually.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPhase('success')} className="text-xs px-3 py-1.5 rounded-lg bg-brand-600 text-white font-medium">Mark complete</button>
            <button onClick={onSkip} className="text-xs px-3 py-1.5 rounded-lg bg-ink-700 text-ink-300">Skip</button>
          </div>
        </div>
      )}

      {/* Phase: idle — start button */}
      {phase === 'idle' && sensorOk && (
        <button
          onClick={start}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
        >
          Start Challenge
        </button>
      )}

      {/* Phase: running */}
      {phase === 'running' && (
        <div className="space-y-3">
          {/* Sensor data display */}
          {challenge.sensorType === 'compass' && (
            <div className="bg-ink-900 rounded-xl p-4 text-center">
              <div className="text-4xl font-display font-bold text-brand-400">
                {Math.round((sensorData.heading as number) ?? 0)}°
              </div>
              <div className="text-xs text-ink-400 mt-1">
                Target: {(sensorData.target as number) ?? 0}° (±{(sensorData.tolerance as number) ?? 5}°)
              </div>
            </div>
          )}

          {challenge.sensorType === 'accelerometer' && (
            <div className="bg-ink-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-display font-bold text-brand-400">
                {Math.round((sensorData.tilt as number) ?? 0)}°
              </div>
              <div className="text-xs text-ink-400 mt-1">
                Max tilt: {(sensorData.maxTilt as number) ?? 15}°
              </div>
            </div>
          )}

          {/* Camera view */}
          {challenge.sensorType === 'camera' && Boolean(stream) && (
            <div className="rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} className="w-full h-auto" playsInline muted />
              <button
                onClick={handlePhotoCapture}
                className="w-full py-3 bg-brand-600 text-white font-semibold"
              >
                Capture Photo
              </button>
            </div>
          )}

          {/* Progress bar for distance challenges */}
          {(challenge.sensorType === 'geolocation' || challenge.sensorType === 'accelerometer') && phase === 'running' && (
            <div>
              <div className="w-full h-2 bg-ink-900 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
              <div className="text-xs text-ink-400 mt-1 text-center">{message}</div>
            </div>
          )}

          {/* Trivia question */}
          {challenge.sensorType === 'none' && Boolean(challenge.data.question) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink-100">{challenge.data.question as string}</p>
              <div className="grid gap-2">
                {(challenge.data.options as string[]).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="text-left px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-700 text-ink-100 text-sm transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual completion */}
          {challenge.sensorType === 'none' && !Boolean(challenge.data.question) && (
            <div className="space-y-2">
              <p className="text-xs text-ink-400">{message}</p>
              <button
                onClick={handleManualDone}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-colors"
              >
                Done
              </button>
            </div>
          )}

          <button onClick={onSkip} className="w-full text-xs text-ink-500 hover:text-ink-300 py-1">
            Skip challenge
          </button>
        </div>
      )}

      {/* Phase: success */}
      {phase === 'success' && (
        <div className="text-center py-4 animate-fade-in">
          <div className="text-3xl mb-2">✓</div>
          <div className="font-display font-bold text-brand-400">Challenge Complete!</div>
          <div className="text-sm text-ink-400 mt-1">
            +{challenge.rewardXp} XP · +{challenge.rewardCoins} coins
          </div>
        </div>
      )}

      {/* Phase: failed */}
      {phase === 'failed' && (
        <div className="text-center py-4">
          <div className="text-sm text-accent-400">{message as string}</div>
        </div>
      )}
    </div>
  )
}

type GeoPointLite = { lat: number; lng: number }
