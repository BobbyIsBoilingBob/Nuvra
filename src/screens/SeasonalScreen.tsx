import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getSeasonalProgress } from '@/lib/db'
import { formatDistance } from '@/lib/geo'

interface Props { onBack: () => void }

export default function SeasonalScreen({ onBack }: Props) {
  const [progress, setProgress] = useState<{ adventures_completed: number; distance_walked: number; target_adventures: number; target_distance: number; reward_claimed: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSeasonalProgress().then(p => {
      setProgress(p)
      setLoading(false)
    })
  }, [])

  const advPct = progress ? Math.min(100, (progress.adventures_completed / progress.target_adventures) * 100) : 0
  const distPct = progress ? Math.min(100, (progress.distance_walked / progress.target_distance) * 100) : 0

  return (
    <ScreenShell title="Seasonal" icon="🍂" onBack={onBack}>
      <div className="bg-gradient-to-br from-orange-500/20 to-accent-500/10 rounded-2xl p-6 border border-orange-500/30 text-center mb-4">
        <div className="text-5xl mb-3">🍂</div>
        <h2 className="text-lg font-bold text-ink-100 mb-1">Autumn Season</h2>
        <p className="text-sm text-ink-400 mb-4">Limited-time autumn-themed adventures and challenges.</p>
        <p className="text-xs text-accent-400">Ends in 14 days</p>
      </div>

      {loading ? <LoadingSpinner label="Loading seasonal progress..." /> : progress ? (
        <div className="space-y-3">
          <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-200 font-semibold">🍂 Leaf Collector</span>
              <span className="text-ink-500">{progress.adventures_completed}/{progress.target_adventures}</span>
            </div>
            <p className="text-xs text-ink-400 mb-2">Complete {progress.target_adventures} adventures this season</p>
            <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent-500 rounded-full transition-all" style={{ width: `${advPct}%` }} />
            </div>
          </div>
          <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-200 font-semibold">🌅 Golden Hour Walker</span>
              <span className="text-ink-500">{formatDistance(progress.distance_walked)} / {formatDistance(progress.target_distance)}</span>
            </div>
            <p className="text-xs text-ink-400 mb-2">Walk {formatDistance(progress.target_distance)} this season</p>
            <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent-500 rounded-full transition-all" style={{ width: `${distPct}%` }} />
            </div>
          </div>
          {progress.reward_claimed && (
            <p className="text-center text-sm text-success-400 font-medium">✓ Season reward claimed!</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-500 text-center">No seasonal event active.</p>
      )}
    </ScreenShell>
  )
}
