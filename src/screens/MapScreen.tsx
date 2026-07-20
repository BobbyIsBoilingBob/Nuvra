import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import AdventureMap from '@/components/AdventureMap'
import ChallengeRunner from '@/components/ChallengeRunner'
import type { Adventure, SensorAvailability } from '@/types/adventure'
import { detectSensors } from '@/lib/sensors'
import { formatDistance, formatDuration } from '@/lib/geo'
import { ALL_CATEGORIES } from '@/data/challenges'

interface Props {
  adventure: Adventure
  onBack: () => void
  onComplete: () => void
}

export default function MapScreen({ adventure, onBack, onComplete }: Props) {
  const [activeCp, setActiveCp] = useState(0)
  const [xp, setXp] = useState(0)
  const [coins, setCoins] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const sensorAvail: SensorAvailability = detectSensors()

  const currentChallenge = adventure.checkpoints[activeCp]?.challenge
  const allDone = completed.size >= adventure.checkpoints.length

  const handleChallengeComplete = (gainedXp: number, gainedCoins: number) => {
    setXp(xp + gainedXp)
    setCoins(coins + gainedCoins)
    setCompleted(prev => new Set([...prev, activeCp]))
    if (activeCp < adventure.checkpoints.length - 1) {
      setActiveCp(activeCp + 1)
    }
  }

  if (allDone) {
    return (
      <ScreenShell title="Adventure Complete!" icon="🏁" onBack={onBack}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-ink-100 mb-2">Adventure Complete!</h2>
          <p className="text-sm text-ink-400 mb-6">{adventure.title}</p>
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-400">{xp}</p>
              <p className="text-xs text-ink-500">XP Earned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-400">{coins}</p>
              <p className="text-xs text-ink-500">Coins Earned</p>
            </div>
          </div>
          <button onClick={onComplete} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition">
            Back to Home
          </button>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell title={adventure.title} icon="🗺" onBack={onBack}>
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-ink-400">📍 {adventure.locationName}</span>
        <span className="text-ink-400">📏 {formatDistance(adventure.distanceKm)} · ⏱ {formatDuration(adventure.durationMin)}</span>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="text-brand-400">⭐ {xp} XP</span>
        <span className="text-accent-400">🪙 {coins}</span>
        <span className="text-ink-500 ml-auto">Checkpoint {activeCp + 1}/{adventure.checkpoints.length}</span>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl">
        <AdventureMap adventure={adventure} />
      </div>

      {currentChallenge && !completed.has(activeCp) && (
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 mb-4">
          <ChallengeRunner
            challenge={currentChallenge}
            sensorAvail={sensorAvail}
            onComplete={handleChallengeComplete}
          />
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Route Checkpoints</h3>
        <div className="space-y-2">
          {adventure.checkpoints.map((cp, i) => {
            const cat = cp.challenge ? ALL_CATEGORIES.find(c => c.id === cp.challenge!.category) : null
            const done = completed.has(i)
            const active = i === activeCp
            return (
              <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border transition ${
                done ? 'bg-success-500/10 border-success-500/30' :
                active ? 'bg-brand-500/10 border-brand-500/30' :
                'bg-ink-900 border-ink-800'
              }`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  done ? 'bg-success-500 text-white' : active ? 'bg-brand-500 text-white' : 'bg-ink-700 text-ink-200'
                }`}>{done ? '✓' : i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-200">{cp.label}</p>
                  {cp.challenge && (
                    <p className="text-xs text-ink-500">{cat?.icon} {cp.challenge.title} · {cp.challenge.category}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ScreenShell>
  )
}
