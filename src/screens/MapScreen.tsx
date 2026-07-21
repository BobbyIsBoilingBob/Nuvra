import { useEffect, useState } from 'react'
import { Map, Navigation, Check, ChevronRight, Flag, Trophy, Star, Coins } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import AdventureMap from '@/components/AdventureMap'
import ChallengeRunner from '@/components/ChallengeRunner'
import type { Adventure, GpsPosition, SensorAvailability } from '@/types/adventure'
import { detectSensors } from '@/lib/sensors'
import { watchPosition } from '@/lib/gps'
import { recordAdventureCompletion } from '@/lib/db'

interface Props {
  adventure: Adventure
  onBack: () => void
  onComplete: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function MapScreen({ adventure, onBack, onComplete, onToast }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [playerPos, setPlayerPos] = useState<GpsPosition | null>(null)
  const [totalXp, setTotalXp] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)
  const [sensorAvail] = useState<SensorAvailability>(detectSensors)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const cleanup = watchPosition(p => setPlayerPos({ lat: p.lat, lng: p.lng, accuracy: p.accuracy, timestamp: Date.now() }))
    return cleanup
  }, [])

  const handleChallengeComplete = (xp: number, coins: number) => {
    setCompleted(prev => new Set(prev).add(currentIdx))
    setTotalXp(x => x + xp)
    setTotalCoins(c => c + coins)
  }

  const handleNext = () => {
    if (currentIdx < adventure.checkpoints.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      setFinished(true)
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    const { error } = await recordAdventureCompletion({
      adventure, xpEarned: totalXp, coinsEarned: totalCoins, challengesCompleted: completed.size,
    })
    setSaving(false)
    if (error) onToast('error', 'Save failed', error)
    else onToast('reward', 'Adventure Complete!', `+${totalXp} XP · +${totalCoins} coins`)
    onComplete()
  }

  if (finished) {
    return (
      <ScreenShell title="Adventure Complete" icon={<Trophy size={18} className="text-accent-400" />} onBack={onBack}>
        <div className="text-center py-8 animate-pop">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent-500/20 border-2 border-accent-500/40 mb-4">
            <Trophy size={48} className="text-accent-400" />
          </div>
          <h2 className="text-2xl font-bold text-ink-100">Congratulations!</h2>
          <p className="text-sm text-ink-400 mt-1">You completed {adventure.title}</p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-ink-900 border border-ink-800 rounded-2xl p-4">
              <Star size={24} className="mx-auto mb-1 text-brand-400" />
              <p className="text-2xl font-bold text-brand-400">{totalXp}</p>
              <p className="text-xs text-ink-500 uppercase mt-1">XP Earned</p>
            </div>
            <div className="bg-ink-900 border border-ink-800 rounded-2xl p-4">
              <Coins size={24} className="mx-auto mb-1 text-accent-400" />
              <p className="text-2xl font-bold text-accent-400">{totalCoins}</p>
              <p className="text-xs text-ink-500 uppercase mt-1">Coins Earned</p>
            </div>
          </div>
          <button
            onClick={handleFinish} disabled={saving}
            className="w-full mt-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={18} /> Finish & Save</>}
          </button>
        </div>
      </ScreenShell>
    )
  }

  const currentCp = adventure.checkpoints[currentIdx]
  const currentChallenge = currentCp?.challenge

  return (
    <ScreenShell
      title={adventure.title}
      icon={<Map size={18} />}
      onBack={onBack}
      headerRight={
        <span className="text-xs text-ink-500 tabular-nums">{currentIdx + 1} / {adventure.checkpoints.length}</span>
      }
    >
      <div className="space-y-4">
        <AdventureMap adventure={adventure} playerPos={playerPos} completedIndices={completed} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-500 uppercase font-semibold">Progress</span>
            <span className="text-xs text-ink-400 tabular-nums">{completed.size} / {adventure.checkpoints.length} done</span>
          </div>
          <div className="h-2.5 bg-ink-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${(completed.size / adventure.checkpoints.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-ink-900 border border-ink-800 rounded-2xl p-4">
          {currentChallenge ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs text-brand-400 font-bold">{currentIdx + 1}</div>
                <span className="text-sm font-semibold text-ink-200">{currentCp.label}</span>
              </div>
              <ChallengeRunner key={currentIdx} challenge={currentChallenge} sensorAvail={sensorAvail} onComplete={handleChallengeComplete} />
            </>
          ) : (
            <div className="text-center py-4">
              <Navigation size={24} className="mx-auto mb-2 text-ink-500" />
              <p className="text-sm text-ink-300">{currentCp.label}</p>
              <p className="text-xs text-ink-500 mt-1">Walk to this checkpoint</p>
            </div>
          )}
        </div>

        {completed.has(currentIdx) && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            {currentIdx < adventure.checkpoints.length - 1 ? <><ChevronRight size={18} /> Next Checkpoint</> : <><Flag size={18} /> Finish Adventure</>}
          </button>
        )}

        {playerPos && (
          <p className="text-xs text-ink-500 text-center flex items-center justify-center gap-1">
            <Navigation size={12} /> {playerPos.lat.toFixed(4)}, {playerPos.lng.toFixed(4)} · ±{Math.round(playerPos.accuracy)}m
          </p>
        )}
      </div>
    </ScreenShell>
  )
}
