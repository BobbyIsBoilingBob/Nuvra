import { useState, useEffect, useRef } from 'react'
import { Check, Camera, Navigation, Brain, CircleHelp as HelpCircle, Zap, Footprints } from 'lucide-react'
import type { Challenge, SensorAvailability } from '@/types/adventure'

interface Props { challenge: Challenge; sensorAvail: SensorAvailability; onComplete: (xp: number, coins: number) => void }

export default function ChallengeRunner({ challenge, sensorAvail, onComplete }: Props) {
  const [done, setDone] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [stepCount, setStepCount] = useState(0)
  const [riddleInput, setRiddleInput] = useState('')
  const [compassHeading, setCompassHeading] = useState(0)
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimitSec ?? 0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (challenge.category === 'fitness' && sensorAvail.accelerometer) {
      const handler = (e: DeviceMotionEvent) => { const acc = e.accelerationIncludingGravity; if (acc) { const mag = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2); if (mag > 15) setStepCount(s => s + 1) } }
      window.addEventListener('devicemotion', handler)
      return () => window.removeEventListener('devicemotion', handler)
    }
  }, [challenge.category, sensorAvail.accelerometer])

  useEffect(() => {
    if (challenge.category === 'compass' && sensorAvail.compass) {
      const handler = (e: DeviceOrientationEvent) => { setCompassHeading(Math.round(e.alpha ? 360 - e.alpha : 0)) }
      window.addEventListener('deviceorientation', handler)
      return () => window.removeEventListener('deviceorientation', handler)
    }
  }, [challenge.category, sensorAvail.compass])

  useEffect(() => {
    if (challenge.timeLimitSec && challenge.category === 'speed' && !done) {
      if (timeLeft <= 0) { handleComplete(); return }
      const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [timeLeft, challenge.timeLimitSec, challenge.category, done])

  function handleComplete() {
    if (done) return
    setDone(true); setShowResult(true)
    setTimeout(() => onComplete(challenge.xp, challenge.coins), 1200)
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-bounce-in">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center mb-3 shadow-glow-brand"><Check size={32} className="text-white" /></div>
        <p className="text-sm font-bold text-success-700">Challenge Complete!</p>
        <p className="text-xs text-ink-400 mt-1">+{challenge.xp} XP, +{challenge.coins} coins</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center"><CategoryIcon category={challenge.category} /></div>
        <div><p className="text-sm font-bold text-ink-900">{challenge.title}</p><p className="text-xs text-ink-400">{challenge.description}</p></div>
      </div>

      {challenge.category === 'trivia' && challenge.options && (
        <div className="space-y-2">
          <p className="text-sm text-ink-700 mb-3">{challenge.question}</p>
          {challenge.options.map((opt, i) => (
            <button key={i} onClick={() => setSelectedAnswer(i)} disabled={done} className={'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition btn-press ' + (selectedAnswer === i ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-surface-300 text-ink-700 hover:border-brand-400')}>{opt}</button>
          ))}
          <button onClick={handleComplete} disabled={selectedAnswer === null} className="btn-primary mt-2 disabled:opacity-40 disabled:cursor-not-allowed">Submit Answer</button>
        </div>
      )}

      {challenge.category === 'photo' && (
        <div className="space-y-3">
          <p className="text-sm text-ink-700">{challenge.photoPrompt}</p>
          <div className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-surface-400 bg-surface-50"><Camera size={32} className="text-ink-400" /></div>
          <button onClick={handleComplete} className="btn-primary">Capture & Complete</button>
        </div>
      )}

      {challenge.category === 'fitness' && (
        <div className="space-y-3 text-center">
          <p className="text-sm text-ink-700">Walk {challenge.targetSteps} steps</p>
          <div className="text-4xl font-extrabold text-brand-600">{stepCount}<span className="text-lg text-ink-400">/{challenge.targetSteps}</span></div>
          <div className="h-3 bg-surface-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-300" style={{ width: Math.min((stepCount / (challenge.targetSteps ?? 1)) * 100, 100) + '%' }} /></div>
          {!sensorAvail.accelerometer && <p className="text-xs text-warning-600">Sensor not available - tap complete</p>}
          <button onClick={handleComplete} disabled={stepCount < (challenge.targetSteps ?? 0) && sensorAvail.accelerometer} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Complete Challenge</button>
        </div>
      )}

      {challenge.category === 'compass' && (
        <div className="space-y-3 text-center">
          <p className="text-sm text-ink-700">Face north (0&deg;)</p>
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-surface-300" />
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(' + compassHeading + 'deg)' }}><Navigation size={32} className="text-brand-500" /></div>
          </div>
          <p className="text-2xl font-bold text-ink-900">{compassHeading}&deg;</p>
          <button onClick={handleComplete} className="btn-primary">Complete Challenge</button>
        </div>
      )}

      {challenge.category === 'riddle' && (
        <div className="space-y-3">
          <p className="text-sm text-ink-700 italic">{challenge.riddleText}</p>
          <input type="text" value={riddleInput} onChange={e => setRiddleInput(e.target.value)} placeholder="Your answer..." className="input-field" />
          <button onClick={handleComplete} disabled={!riddleInput.trim()} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Submit Answer</button>
        </div>
      )}

      {challenge.category === 'speed' && (
        <div className="space-y-3 text-center">
          <p className="text-sm text-ink-700">Reach the next checkpoint!</p>
          <p className="text-3xl font-bold text-ink-900">{timeLeft}s</p>
          <button onClick={handleComplete} className="btn-primary">Mark Arrived</button>
        </div>
      )}

      {(challenge.category === 'exploration' || challenge.category === 'puzzle') && (
        <div className="space-y-3">
          <p className="text-sm text-ink-700">{challenge.question ?? challenge.description}</p>
          {challenge.options ? (
            <>
              {challenge.options.map((opt, i) => (
                <button key={i} onClick={() => setSelectedAnswer(i)} disabled={done} className={'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition btn-press ' + (selectedAnswer === i ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-surface-300 text-ink-700 hover:border-brand-400')}>{opt}</button>
              ))}
              <button onClick={handleComplete} disabled={selectedAnswer === null} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Submit Answer</button>
            </>
          ) : <button onClick={handleComplete} className="btn-primary">Complete Challenge</button>}
        </div>
      )}
    </div>
  )
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, typeof Check> = { trivia: Brain, photo: Camera, fitness: Footprints, compass: Navigation, riddle: HelpCircle, speed: Zap, exploration: Navigation, puzzle: Brain }
  const Icon = icons[category] ?? Check
  return <Icon size={16} className="text-white" />
}
