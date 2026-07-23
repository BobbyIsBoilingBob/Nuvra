import { useEffect, useState } from 'react'
import { Clock, Star, Coins, Mountain, MapPin } from 'lucide-react'
import { getAdventureHistory } from '@/lib/db'
import type { AdventureHistoryItem } from '@/types/adventure'
import { formatDuration } from '@/lib/geo'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }
export default function HistoryScreen({ onNavigate }: Props) {
  const [history, setHistory] = useState<AdventureHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { const h = await getAdventureHistory(); setHistory(h || []); setLoading(false) })() }, [])
  return (
    <>
      <ScreenShell title="History" subtitle="Your past adventures">
        {loading ? <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div> : history.length === 0 ? <EmptyState icon={<Mountain size={32} />} title="No adventures yet" message="Complete your first adventure to see it here" actionLabel="Generate" onAction={() => onNavigate('generator')} /> : (
          <div className="space-y-3">{history.map((h, i) => (
            <div key={h.id} className="card-premium p-4 stagger" style={{ animationDelay: i * 40 + 'ms' }}>
              <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center flex-shrink-0"><Mountain size={20} className="text-brand-500" /></div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-ink-900 truncate">{h.adventure_name}</p><p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {h.location_name}</p><div className="flex items-center gap-3 mt-2"><span className="flex items-center gap-1 text-xs text-ink-400"><Clock size={12} /> {formatDuration(h.duration)}</span><span className="flex items-center gap-1 text-xs font-semibold text-brand-600"><Star size={12} /> +{h.xp_earned}</span><span className="flex items-center gap-1 text-xs font-semibold text-accent-600"><Coins size={12} /> +{h.coins_earned}</span><span className="text-xs text-ink-400">{h.treasures_found} challenges</span></div></div><span className="text-xs text-ink-400 flex-shrink-0">{new Date(h.completed_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span></div>
            </div>
          ))}</div>
        )}
      </ScreenShell>
      <BottomNav active="history" onNavigate={onNavigate} />
    </>
  )
}
