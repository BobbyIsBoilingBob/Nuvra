import { useEffect, useRef, useState } from 'react'
import { Check, X, Play, Compass, Camera, Navigation, Smartphone, Star, Coins } from 'lucide-react'
import type { ChallengeAssignment, SensorAvailability } from '@/types/adventure'
import { categoryIcons, difficultyIcons } from '@/data/icons'
import { startCompass, startAccelerometer, requestCamera } from '@/lib/sensors'
import { getCurrentPosition, watchPosition } from '@/lib/gps'
import { distanceMeters } from '@/lib/geo'

type Phase = 'idle' | 'running' | 'success' | 'failed'

interface Props { challenge: ChallengeAssignment; sensorAvail: SensorAvailability; onComplete: (xp: number, coins: number) => void }

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
  const cleanupRef = useRef<(() => void) | null>(null)

  const sensor = challenge.sensorType
  const CatIcon = categoryIcons[challenge.category]
  const DiffIcon = difficultyIcons[challenge.difficulty]

  useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); if (cleanupRef.current) cleanupRef.current() }, [])

  const start = async () => {
    setPhase('running'); setError('')
    if (sensor === 'compass' && sensorAvail.compass) cleanupRef.current = startCompass(h => setHeading(h))
    else if (sensor === 'accelerometer' && sensorAvail.accelerometer) cleanupRef.current = startAccelerometer((x, y, z) => setTilt({ x, y, z }))
    else if (sensor === 'gps' && sensorAvail.gps) {
      const pos = await getCurrentPosition()
      if (pos) startPos.current = { lat: pos.lat, lng: pos.lng }
      const t = challenge.sensorConfig?.targetRadius as number
      if (t) setTargetDist(t * 10)
      cleanupRef.current = watchPosition(p => { if (startPos.current) setWalkDist(distanceMeters(startPos.current, { lat: p.lat, lng: p.lng })) })
    } else if (sensor === 'camera' && sensorAvail.camera) {
      const stream = await requestCamera('environment')
      if (stream && videoRef.current) { streamRef.current = stream; videoRef.current.srcObject = stream; setCameraOn(true) } else setError('Camera unavailable')
    }
  }

  const cleanup = () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); if (cleanupRef.current) cleanupRef.current() }
  const complete = () => { cleanup(); setPhase('success'); onComplete(challenge.xp, challenge.coins) }
  const fail = () => { cleanup(); setPhase('failed') }
  const sensorUnavailable = sensor !== 'none' && !sensorAvail[sensor]

  if (phase === 'success') return (
    <div className="text-center py-8 animate-bounce-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success-500/20 to-success-600/10 border-2 border-success-500/40 mb-3">
        <Check size={40} className="text-success-400" />
      </div>
      <p className="text-success-400 font-bold text-lg">Challenge Complete!</p>
      <p className="text-sm text-ink-400 mt-1.5 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1"><Star size={14} className="text-brand-400" /> +{challenge.xp} XP</span>
        <span className="flex items-center gap-1"><Coins size={14} className="text-accent-400" /> +{challenge.coins}</span>
      </p>
    </div>
  )

  if (phase === 'failed') return (
    <div className="text-center py-8 animate-pop">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-error-500/20 to-error-600/10 border-2 border-error-500/40 mb-3">
        <X size={40} className="text-error-400" />
      </div>
      <p className="text-error-400 font-bold text-lg">Challenge Skipped</p>
      <button onClick={() => setPhase('idle')} className="mt-4 px-5 py-2.5 bg-surface-200 rounded-xl text-sm text-ink-200 hover:bg-surface-300 btn-press">Try Again</button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-brand-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><CatIcon size={12} /> {challenge.category} · <DiffIcon size={12} className="inline" /> {challenge.difficulty}</p>
        <h3 className="text-lg font-bold text-ink-100 mt-1.5">{challenge.title}</h3>
        <p className="text-sm text-ink-400 mt-1 leading-relaxed">{challenge.description}</p>
        <p className="text-xs text-ink-500 mt-2.5 flex items-center gap-3">
          <span className="flex items-center gap-1"><Star size={12} className="text-brand-400" /> +{challenge.xp} XP</span>
          <span className="flex items-center gap-1"><Coins size={12} className="text-accent-400" /> +{challenge.coins} coins</span>
        </p>
      </div>

      {sensorUnavailable && <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl p-3"><p className="text-sm text-warning-400">Sensor not available. You can mark this challenge complete manually.</p></div>}

      {phase === 'running' && sensor === 'compass' && sensorAvail.compass && (
        <div className="text-center py-6 bg-surface-100 rounded-xl border border-white/[0.04]">
          <Compass size={40} className="mx-auto mb-2 text-brand-400" style={{ transform: `rotate(${heading}deg)`, transition: 'transform 0.1s' }} />
          <span className="text-5xl font-bold gradient-text">{Math.round(heading)}</span><span className="text-2xl text-ink-400 ml-1">°</span>
          <p className="text-sm text-ink-400 mt-2">Current heading</p>
          {challenge.sensorConfig?.targetHeading != null && <p className="text-xs text-ink-500 mt-1">Target: {Number(challenge.sensorConfig.targetHeading)}° ± {Number(challenge.sensorConfig.tolerance ?? 10)}°</p>}
        </div>
      )}
      {phase === 'running' && sensor === 'accelerometer' && sensorAvail.accelerometer && (
        <div className="text-center py-4 bg-surface-100 rounded-xl border border-white/[0.04]">
          <Smartphone size={28} className="mx-auto mb-2 text-brand-400" />
          <div className="grid grid-cols-3 gap-2">
            <div><p className="text-xs text-ink-500">X</p><p className="text-lg font-bold text-brand-400">{tilt.x.toFixed(1)}</p></div>
            <div><p className="text-xs text-ink-500">Y</p><p className="text-lg font-bold text-brand-400">{tilt.y.toFixed(1)}</p></div>
            <div><p className="text-xs text-ink-500">Z</p><p className="text-lg font-bold text-brand-400">{tilt.z.toFixed(1)}</p></div>
          </div>
        </div>
      )}
      {phase === 'running' && sensor === 'gps' && sensorAvail.gps && (
        <div className="py-4">
          <div className="flex justify-between text-sm text-ink-400 mb-2"><span className="flex items-center gap-1.5"><Navigation size={14} /> Distance walked</span><span className="tabular-nums">{Math.round(walkDist)}m / {targetDist}m</span></div>
          <div className="h-3 bg-surface-300 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (walkDist / targetDist) * 100)}%` }} /></div>
        </div>
      )}
      {phase === 'running' && sensor === 'camera' && sensorAvail.camera && (
        <div className="py-2">{cameraOn ? <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" style={{ maxHeight: '200px' }} /> : <p className="text-sm text-ink-500 text-center py-4 flex items-center justify-center gap-2"><Camera size={16} /> {error ? String(error) : 'Starting camera...'}</p>}</div>
      )}
      {phase === 'running' && Boolean(challenge.data?.question) && (
        <div className="py-2">
          <p className="text-sm text-ink-200 font-medium mb-3">{String(challenge.data?.question ?? '')}</p>
          <div className="space-y-2">{((challenge.data?.answers as string[]) ?? []).map((ans, i) => (
            <button key={i} onClick={() => setSelectedAnswer(i)} className={`w-full text-left px-4 py-3 rounded-xl text-sm btn-press ${selectedAnswer === i ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white' : 'bg-surface-200 text-ink-200 hover:bg-surface-300'}`}>{ans}</button>
          ))}</div>
        </div>
      )}

      {phase === 'idle' ? (
        <button onClick={start} className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white rounded-xl font-bold text-sm btn-press shadow-glow-brand flex items-center justify-center gap-2">
          <Play size={18} /> Start Challenge
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={complete} className="flex-1 py-3.5 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white rounded-xl font-bold text-sm btn-press shadow-lg shadow-success-500/20 flex items-center justify-center gap-2"><Check size={18} /> Mark Complete</button>
          <button onClick={fail} className="px-4 py-3.5 bg-surface-200 text-ink-400 rounded-xl text-sm btn-press hover:bg-surface-300 flex items-center gap-1"><X size={16} /> Skip</button>
        </div>
      )}
    </div>
  )
}
