import { useState, useEffect, useCallback, memo } from 'react'
import { Navigation, MapPin, Clock, Check, X, Trophy } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import { AdventureMap } from '@/components/AdventureMap'
import { ChallengeRunner } from '@/components/ChallengeRunner'
import { detectSensors, watchPosition, startCompass } from '@/lib/sensors'
import { distanceMeters, formatDistance, formatDuration } from '@/lib/geo'
import { recordAdventureCompletion } from '@/lib/db'
import type { ScreenName, Adventure, GpsPosition, SensorAvailability } from '@/types/adventure'

interface Props { adventure: Adventure; onNavigate: (s: ScreenName) => void; onComplete: () => void }

function MapScreenInner({ adventure, onNavigate, onComplete }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [sensorAvail] = useState<SensorAvailability>(() => detectSensors())
  const [playerPos, setPlayerPos] = useState<GpsPosition | null>(null)
  const [heading, setHeading] = useState(0)
  const [currentCp, setCurrentCp] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [totalXp, setTotalXp] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const stopWatch = watchPosition(pos => setPlayerPos(pos))
    const stopCompass = startCompass(h => setHeading(h))
    return () => { stopWatch(); stopCompass() }
  }, [])

  const handleChallengeComplete = useCallback((xp: number, coins: number) => {
    setCompleted(prev => { const next = new Set(prev); next.add(currentCp); return next })
    setTotalXp(prev => prev + xp)
    setTotalCoins(prev => prev + coins)
    push('reward', 'Checkpoint cleared!', '+' + xp + ' XP, +' + coins + ' coins')
    if (currentCp < adventure.checkpoints.length - 1) {
      setCurrentCp(prev => prev + 1)
    } else {
      setFinished(true)
    }
  }, [currentCp, adventure.checkpoints.length, push])

  const handleFinish = useCallback(async () => {
    await recordAdventureCompletion({ adventure, xpEarned: totalXp, coinsEarned: totalCoins, challengesCompleted: completed.size })
    push('success', 'Adventure complete!', 'Check your profile for rewards')
    onComplete()
  }, [adventure, totalXp, totalCoins, completed.size, push, onComplete])

  const currentCheckpoint = adventure.checkpoints[currentCp]
  const distToNext = playerPos && currentCheckpoint ? distanceMeters(playerPos, currentCheckpoint.position) : null

  if (finished) {
    return (
      <>
        <ScreenShell title="Adventure Complete" subtitle={adventure.locationName} icon={<Trophy size={18} />} onBack={() => onNavigate('home')}>
          <div className="flex flex-col items-center justify-center py-8 animate-bounce-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-4 shadow-glow-brand">
              <Trophy size={48} className="text-white" />
            </div>
            <p className="text-lg font-extrabold text-ink-900">Congratulations!</p>
            <p className="text-sm text-ink-400 mt-1">You completed all checkpoints</p>
            <div className="grid grid-cols-2 gap-3 mt-6 w-full">
              <div className="card-premium p-4 text-center">
                <p className="text-2xl font-extrabold text-brand-600">{totalXp}</p>
                <p className="text-xs text-ink-400">XP Earned</p>
              </div>
              <div className="card-premium p-4 text-center">
                <p className="text-2xl font-extrabold text-accent-600">{totalCoins}</p>
                <p className="text-xs text-ink-400">Coins Earned</p>
              </div>
            </div>
            <button onClick={handleFinish} className="btn-primary mt-6 w-full">Finish & Claim Rewards</button>
          </div>
        </ScreenShell>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </>
    )
  }

  if (!currentCheckpoint) {
    return (
      <ScreenShell title="Adventure" subtitle={adventure.locationName} icon={<MapPin size={18} />} onBack={() => onNavigate('home')}>
        <EmptyState icon={<X size={28} />} title="No checkpoints" message="This adventure has no checkpoints." actionLabel="Go Home" onAction={() => onNavigate('home')} />
      </ScreenShell>
    )
  }

  return (
    <>
      <ScreenShell title="Active Adventure" subtitle={adventure.locationName} icon={<Navigation size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-card">
            <AdventureMap adventure={adventure} playerPos={playerPos} completedIndices={completed} heading={heading} />
          </div>

          {/* Progress bar */}
          <div className="card-premium p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-ink-700">Progress</p>
              <p className="text-xs font-bold text-brand-600">{completed.size} / {adventure.checkpoints.length}</p>
            </div>
            <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500" style={{ width: (completed.size / adventure.checkpoints.length) * 100 + '%' }} />
            </div>
          </div>

          {/* Distance to next checkpoint */}
          {distToNext !== null && (
            <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl p-3">
              <MapPin size={18} className="text-brand-500" />
              <div className="flex-1">
                <p className="text-xs text-ink-400">Next checkpoint</p>
                <p className="text-sm font-bold text-ink-900">{formatDistance(distToNext / 1000)} away</p>
              </div>
              {distToNext < 50 && <span className="text-xs font-bold text-success-600 bg-success-50 px-2 py-1 rounded-full">Arrived!</span>}
            </div>
          )}

          {/* Current challenge */}
          <div className="card-premium p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center text-xs font-bold">{currentCp + 1}</span>
              <p className="text-sm font-bold text-ink-900">Checkpoint {currentCp + 1}</p>
            </div>
            {currentCheckpoint.challenge ? (
              <ChallengeRunner challenge={currentCheckpoint.challenge} sensorAvail={sensorAvail} onComplete={handleChallengeComplete} />
            ) : (
              <button onClick={() => handleChallengeComplete(50, 20)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Check size={16} /> Mark Complete
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex-1 card-premium p-3 text-center">
              <p className="text-lg font-extrabold text-brand-600">{totalXp}</p>
              <p className="text-[10px] text-ink-400">XP</p>
            </div>
            <div className="flex-1 card-premium p-3 text-center">
              <p className="text-lg font-extrabold text-accent-600">{totalCoins}</p>
              <p className="text-[10px] text-ink-400">Coins</p>
            </div>
            <div className="flex-1 card-premium p-3 text-center">
              <Clock size={16} className="mx-auto text-ink-400 mb-1" />
              <p className="text-[10px] text-ink-400">Time</p>
            </div>
          </div>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const MapScreen = memo(MapScreenInner)
