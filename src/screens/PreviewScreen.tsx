import ScreenShell from '@/components/ScreenShell'
import AdventureMap from '@/components/AdventureMap'
import type { Adventure } from '@/types/adventure'
import { formatDistance, formatDuration } from '@/lib/geo'
import { ALL_CATEGORIES } from '@/data/challenges'

interface Props {
  adventure: Adventure
  onBack: () => void
  onStart: () => void
}

export default function PreviewScreen({ adventure, onBack, onStart }: Props) {
  const diffColors: Record<string, string> = {
    easy: 'text-success-400', medium: 'text-accent-400', hard: 'text-error-400', extreme: 'text-purple-400',
  }
  return (
    <ScreenShell title="Adventure Preview" icon="🗺" onBack={onBack}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-ink-100 mb-1">{adventure.title}</h2>
        <p className="text-sm text-ink-400">{adventure.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <span className="bg-ink-900 px-3 py-1.5 rounded-lg text-ink-300">📍 {adventure.locationName}</span>
        <span className="bg-ink-900 px-3 py-1.5 rounded-lg text-ink-300">📏 {formatDistance(adventure.distanceKm)}</span>
        <span className="bg-ink-900 px-3 py-1.5 rounded-lg text-ink-300">⏱ {formatDuration(adventure.durationMin)}</span>
        <span className={`bg-ink-900 px-3 py-1.5 rounded-lg ${diffColors[adventure.difficulty]}`}>{adventure.difficulty}</span>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl">
        <AdventureMap adventure={adventure} />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Route Checkpoints</h3>
        <div className="space-y-2">
          {adventure.checkpoints.map((cp, i) => {
            const cat = cp.challenge ? ALL_CATEGORIES.find(c => c.id === cp.challenge!.category) : null
            return (
              <div key={i} className="flex items-center gap-3 bg-ink-900 rounded-xl p-3 border border-ink-800">
                <span className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center text-xs font-bold text-ink-200">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-200">{cp.label}</p>
                  {cp.challenge && (
                    <p className="text-xs text-ink-500">{cat?.icon} {cp.challenge.title} · +{cp.challenge.xp} XP</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition"
      >
        Start Adventure
      </button>
    </ScreenShell>
  )
}
