import { useEffect, useState } from 'react'
import { Calendar, Star, Gift } from 'lucide-react'
import { getSeasonalProgress } from '@/lib/db'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function SeasonalScreen() {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const p = await getSeasonalProgress()
      setProgress(p); setLoading(false)
    })()
  }, [])

  if (loading) return <ScreenShell title="Seasonal" subtitle="Season events"><div className="flex justify-center py-20"><LoadingSpinner /></div></ScreenShell>
  if (!progress) return <ScreenShell title="Seasonal" subtitle="Season events"><EmptyState icon={<Calendar size={32} />} title="No active season" message="Check back later for seasonal events" /></ScreenShell>

  const advPct = Math.min(100, (progress.adventures_completed / progress.target_adventures) * 100)
  const distPct = Math.min(100, (progress.distance_walked / progress.target_distance) * 100)

  return (
    <ScreenShell title="Seasonal" subtitle="Current season">
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-brand-500/15 to-accent-500/10 border border-brand-500/20 rounded-2xl p-5 text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow-brand mb-3"><Calendar size={32} className="text-white" /></div>
          <h2 className="text-xl font-bold text-ink-100">Adventure Season</h2>
          <p className="text-sm text-ink-400 mt-1">Complete goals for rewards</p>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-100 border border-white/[0.04] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-ink-100 flex items-center gap-1.5"><Star size={14} className="text-brand-400" /> Adventures Completed</p>
              <span className="text-xs text-ink-500">{progress.adventures_completed} / {progress.target_adventures}</span>
            </div>
            <div className="h-2.5 bg-surface-300 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500" style={{ width: `${advPct}%` }} /></div>
          </div>
          <div className="bg-surface-100 border border-white/[0.04] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-ink-100 flex items-center gap-1.5"><Calendar size={14} className="text-brand-400" /> Distance Walked</p>
              <span className="text-xs text-ink-500">{progress.distance_walked?.toFixed(1) || 0} / {progress.target_distance} km</span>
            </div>
            <div className="h-2.5 bg-surface-300 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-500" style={{ width: `${distPct}%` }} /></div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Gift size={12} /> Season Reward</h3>
          <div className={`rounded-xl border p-3.5 flex items-center gap-3 ${progress.reward_claimed ? 'bg-gradient-to-r from-accent-500/15 to-brand-500/10 border-accent-500/30' : 'bg-surface-100 border-white/[0.04]'}`}>
            <div className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center"><Gift size={18} className={progress.reward_claimed ? 'text-accent-400' : 'text-ink-600'} /></div>
            <div className="flex-1"><p className="text-sm font-semibold text-ink-100">Season Grand Prize</p><p className="text-xs text-ink-500">Complete all goals to unlock</p></div>
            {progress.reward_claimed && <span className="text-xs font-bold text-accent-400">Claimed</span>}
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
