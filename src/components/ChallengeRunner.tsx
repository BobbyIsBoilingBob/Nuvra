import { useEffect, useRef, useState } from 'react'
import type { ChallengeAssignment, SensorAvailability } from '@/types/adventure'
import { startCompass, startAccelerometer, requestCamera } from '@/lib/sensors'
import { getCurrentPosition, watchPosition } from '@/lib/gps'
import { distanceMeters } from '@/lib/geo'

type Phase = 'idle' | 'running' | 'success' | 'failed'

interface Props {
  challenge: ChallengeAssignment
  sensorAvail: SensorAvailability
  onComplete: (xp: number, coins: number) => void
}

export default function ChallengeRunner({ challenge, sensorAvail, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [heading, setHeading] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0, z: 0 })
  const [walkDist, setWalkDist] = useState(0)
  const [targetDist, setTargetDist] = useState(300)
  const [cameraOn, setCameraOn] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startPos = useRef<{ lat: number; lng: number } | null>(null)

  const sensor = challenge.sensorType

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const start = async () => {
    setPhase('running')
    setError('')

    if (sensor === 'compass' && sensorAvail.compass) {
      startCompass(h => setHeading(h))
    } else if (sensor === 'accelerometer' && sensorAvail.accelerometer) {
      startAccelerometer((x, y, z) => setTilt({ x, y, z }))
    } else if (sensor === 'gps' && sensorAvail.gps) {
      const pos = await getCurrentPosition()
      if (pos) startPos.current = { lat: pos.lat, lng: pos.lng }
      const target = challenge.sensorConfig?.targetRadius as number
      if (target) setTargetDist(target * 10)
      const stopWatch = watchPosition(p => {
        if (startPos.current) {
          setWalkDist(distanceMeters(startPos.current, { lat: p.lat, lng: p.lng }))
        }
      })
      // Store cleanup
      return () => stopWatch()
    } else if (sensor === 'camera' && sensorAvail.camera) {
      const stream = await requestCamera('environment')
      if (stream && videoRef.current) {
        streamRef.current = stream
        videoRef.current.srcObject = stream
        setCameraOn(true)
      } else {
        setError('Camera unavailable')
      }
    }
  }

  const complete = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setPhase('success')
    onComplete(challenge.xp, challenge.coins)
  }

  const fail = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setPhase('failed')
  }

  const sensorUnavailable = sensor !== 'none' && !sensorAvail[sensor]

  if (phase === 'success') {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">✓</div>
        <p className="text-success-400 font-semibold">Challenge Complete!</p>
        <p className="text-sm text-ink-400 mt-1">+{challenge.xp} XP · +{challenge.coins} coins</p>
      </div>
    )
  }

  if (phase === 'failed') {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">✗</div>
        <p className="text-error-400 font-semibold">Challenge Failed</p>
        <button onClick={() => setPhase('idle')} className="mt-3 px-4 py-2 bg-ink-800 rounded-lg text-sm text-ink-200">Try Again</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider">{challenge.category} · {challenge.difficulty}</p>
        <h3 className="text-lg font-bold text-ink-100 mt-1">{challenge.title}</h3>
        <p className="text-sm text-ink-400 mt-1">{challenge.description}</p>
        <p className="text-xs text-ink-500 mt-2">+{challenge.xp} XP · +{challenge.coins} coins</p>
      </div>

      {sensorUnavailable && (
        <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl p-3">
          <p className="text-sm text-warning-400">Sensor not available on this device. You can mark this challenge as complete manually.</p>
        </div>
      )}

      {phase === 'running' && sensor === 'compass' && sensorAvail.compass && (
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-brand-400">{Math.round(heading)}°</div>
          <p className="text-sm text-ink-400 mt-2">Current heading</p>
          {challenge.sensorConfig?.targetHeading != null && (
            <p className="text-xs text-ink-500 mt-1">Target: {Number(challenge.sensorConfig.targetHeading)}° ± {Number(challenge.sensorConfig.tolerance ?? 10)}°</p>
          )}
        </div>
      )}

      {phase === 'running' && sensor === 'accelerometer' && sensorAvail.accelerometer && (
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-brand-400">
            X:{tilt.x.toFixed(1)} Y:{tilt.y.toFixed(1)} Z:{tilt.z.toFixed(1)}
          </div>
          <p className="text-sm text-ink-400 mt-2">Tilt readings</p>
        </div>
      )}

      {phase === 'running' && sensor === 'gps' && sensorAvail.gps && (
        <div className="py-4">
          <div className="flex justify-between text-sm text-ink-400 mb-2">
            <span>Distance walked</span>
            <span>{Math.round(walkDist)}m / {targetDist}m</span>
          </div>
          <div className="h-3 bg-ink-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, (walkDist / targetDist) * 100)}%` }} />
          </div>
        </div>
      )}

      {phase === 'running' && sensor === 'camera' && sensorAvail.camera && (
        <div className="py-2">
          {cameraOn ? (
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" style={{ maxHeight: '200px' }} />
          ) : (
            <p className="text-sm text-ink-500 text-center py-4">{Boolean(error) ? String(error) : 'Starting camera...'}</p>
          )}
        </div>
      )}

      {phase === 'running' && Boolean(challenge.data?.question) && (
        <div className="py-2">
          <p className="text-sm text-ink-200 font-medium mb-3">{String(challenge.data.question ?? '')}</p>
          <div className="space-y-2">
            {(challenge.data.answers as string[]).map((ans, i) => (
              <button
                key={i}
                onClick={() => setSelectedAnswer(i)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${
                  selectedAnswer === i ? 'bg-brand-500 text-white' : 'bg-ink-800 text-ink-200 hover:bg-ink-700'
                }`}
              >
                {ans}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'idle' ? (
        <button onClick={start} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition">
          Start Challenge
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={complete} className="flex-1 py-3 bg-success-500 hover:bg-success-600 text-white rounded-xl font-semibold text-sm transition">
            Mark Complete
          </button>
          <button onClick={fail} className="px-4 py-3 bg-ink-800 text-ink-400 rounded-xl text-sm transition hover:bg-ink-700">
            Skip
          </button>
        </div>
      )}
    </div>
  )
}
