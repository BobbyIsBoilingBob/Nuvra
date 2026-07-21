import { useEffect, useState } from 'react'
import { Mountain, Clock, Star, MapPin } from 'lucide-react'
import { getAdventureHistory } from '@/lib/db'
import type { AdventureHistoryItem } from '@/types/adventure'
import { formatDuration, formatDistance } from '@/lib/geo'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }

export default function HistoryScreen({ onNavigate }: Props) {
  const [history, setHistory] = useState<AdventureHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const h = await getAdventureHistory()
      setHistory(h || []); setLoading(false)
    })()
  }, [])

  return (
    <ScreenShell title="History" subtitle="Past adventures">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : history.length === 0 ? (
        <EmptyState icon={<Mountain size={32} />} title="No history yet" message="Your completed adventures will appear here" actionLabel="Start Adventure" onAction={() => onNavigate('generator')} />
      ) : (
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={h.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2"><MapPin size={14} className="text-brand-400" /><span className="text-sm font-bold text-ink-100">{h.adventure_name}</span></div>
                <span className="text-xs text-ink-500">{new Date(h.completed_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-500 mb-3">
                <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(h.duration)}</span>
                <span className="flex items-center gap-1"><Mountain size={12} /> {h.treasures_found} challenges</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-brand-400" /> +{h.xp_earned} XP</span>
              </div>
              <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full" style={{ width: '100%' }} /></div>
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
