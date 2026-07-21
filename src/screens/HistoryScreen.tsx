import { useEffect, useState } from 'react'
import { History, Route, Clock, Star, Coins, Gem, MapPin } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getAdventureHistory } from '@/lib/db'
import { formatDistance, formatDuration } from '@/lib/geo'
import { difficultyIcons } from '@/data/icons'
import type { Difficulty, AdventureHistoryItem } from '@/types/adventure'

interface Props {
  onBack: () => void
}

export default function HistoryScreen({ onBack }: Props) {
  const [items, setItems] = useState<AdventureHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdventureHistory().then(h => { setItems(h); setLoading(false) })
  }, [])

  return (
    <ScreenShell title="History" icon={<History size={18} />} onBack={onBack}>
      {loading ? <LoadingSpinner label="Loading history..." /> : items.length === 0 ? (
        <EmptyState icon={<History size={40} />} title="No adventures yet" message="Your completed adventures will appear here" />
      ) : (
        <div className="space-y-3">
          {items.map(h => {
            const DiffIcon = difficultyIcons[h.difficulty as Difficulty] || Star
            return (
              <div key={h.id} className="bg-ink-900 border border-ink-800 rounded-xl p-3.5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                    <DiffIcon size={18} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-100 truncate">{h.adventure_name}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {h.difficulty}</span>
                      <span className="flex items-center gap-1"><Route size={10} /> {formatDistance(h.distance)}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(h.duration)}</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-0.5 text-brand-400"><Star size={10} /> {h.xp_earned} XP</span>
                      <span className="flex items-center gap-0.5 text-accent-400"><Coins size={10} /> {h.coins_earned}</span>
                      <span className="flex items-center gap-0.5 text-cyan-400"><Gem size={10} /> {h.gems_earned}</span>
                    </div>
                    <p className="text-xs text-ink-600 mt-1">{new Date(h.completed_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ScreenShell>
  )
}
