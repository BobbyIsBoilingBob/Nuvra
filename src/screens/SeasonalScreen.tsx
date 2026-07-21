import { useEffect, useState } from 'react'
import { Leaf, Clock, Zap } from 'lucide-react'
import { getSeasonalProgress } from '@/lib/db'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function SeasonalScreen() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => { const d = await getSeasonalProgress(); setData(d); setLoading(false) })() }, [])

  return (
    <ScreenShell title="Seasonal" subtitle="Limited-time events">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : !data ? <EmptyState icon={<Leaf size={32} />} title="No active season" message="Check back for seasonal events" /> : (
        <div className="space-y-4">
          <div className="card-premium p-6 text-center bg-gradient-to-br from-brand-500/10 to-accent-500/10">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-3"><Leaf className="text-white" size={28} /></div>
            <p className="text-lg font-bold gradient-text">{data.seasonName}</p>
            <p className="text-sm text-ink-400 mt-1">Level {data.level}</p>
          </div>

          <div className="card-premium p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-sm font-bold text-ink-100">Season Progress</p><span className="text-xs text-ink-500">{data.xp} / {data.xpToLevel} XP</span></div>
            <div className="h-3 bg-surface-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all" style={{ width: `${Math.min(100, (data.xp / data.xpToLevel) * 100)}%` }} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card-premium p-4 flex items-center gap-3"><Clock size={20} className="text-accent-400" /><div><p className="text-xs text-ink-500">Days Left</p><p className="text-sm font-bold text-ink-100">{data.daysLeft}</p></div></div>
            <div className="card-premium p-4 flex items-center gap-3"><Zap size={20} className="text-brand-400" /><div><p className="text-xs text-ink-500">Season Level</p><p className="text-sm font-bold text-ink-100">{data.level}</p></div></div>
          </div>
        </div>
      )}
    </ScreenShell>
  )
}
