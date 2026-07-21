import { useEffect, useState } from 'react'
import { History, MapPin, Clock, Zap, Gem } from 'lucide-react'
import { getAdventureHistory } from '@/lib/db'
import type { AdventureHistoryItem } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

const diffColors: Record<string, string> = { easy: 'text-brand-400', medium: 'text-sky-400', hard: 'text-accent-400', extreme: 'text-rose-400' }

export default function HistoryScreen() {
  const [items, setItems] = useState<AdventureHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => { const h = await getAdventureHistory(); setItems(h || []); setLoading(false) })() }, [])

  return (
    <ScreenShell title="History" subtitle="Your adventure log">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : items.length === 0 ? <EmptyState icon={<History size={32} />} title="No adventures yet" message="Complete your first adventure to see it here" /> : (
        <div className="space-y-3">
          {items.map((h, i) => (
            <div key={h.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <div><p className="text-sm font-bold text-ink-100">{h.adventure_name}</p><p className="text-xs text-ink-500 capitalize">{h.type?.replace('_', ' ') || 'Adventure'}</p></div>
                <span className={`text-xs font-bold capitalize ${diffColors[h.difficulty] || 'text-ink-400'}`}>{h.difficulty}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-ink-500"><MapPin size={13} className="text-brand-400" />{h.distance?.toFixed(1) || '0'}km</div>
                <div className="flex items-center gap-1.5 text-xs text-ink-500"><Clock size={13} className="text-sky-400" />{h.duration || 0}min</div>
                <div className="flex items-center gap-1.5 text-xs text-ink-500"><Zap size={13} className="text-accent-400" />{h.xp_earned || 0} XP</div>
              </div>
              {h.treasures_found > 0 && <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400"><Gem size={13} />{h.treasures_found} treasures found</div>}
              <p className="text-xs text-ink-600 mt-2">{new Date(h.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
