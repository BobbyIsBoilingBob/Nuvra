import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getAdventureHistory } from '@/lib/db'
import { formatDistance, formatDuration } from '@/lib/geo'
import { useAuth } from '@/lib/auth'
import type { AdventureHistoryItem } from '@/types/adventure'

interface Props { onBack: () => void }

export default function HistoryScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const [history, setHistory] = useState<AdventureHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdventureHistory().then(data => {
      setHistory(data)
      setLoading(false)
    })
  }, [])

  const diffColors: Record<string, string> = {
    easy: 'text-success-400', medium: 'text-accent-400', hard: 'text-error-400', extreme: 'text-purple-400',
  }

  return (
    <ScreenShell title="History" icon="📊" onBack={onBack}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-brand-400">{profile?.completed_adventures ?? 0}</p>
          <p className="text-xs text-ink-500 mt-1">Total Adventures</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-accent-400">{profile?.completed_challenges ?? 0}</p>
          <p className="text-xs text-ink-500 mt-1">Challenges Done</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-ink-100">{formatDistance(profile?.distance_walked ?? 0)}</p>
          <p className="text-xs text-ink-500 mt-1">Distance Walked</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-ink-100">{profile?.walking_streak ?? 0}🔥</p>
          <p className="text-xs text-ink-500 mt-1">Walking Streak</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-ink-300 mb-2">Recent Adventures</h3>
      {loading ? <LoadingSpinner label="Loading history..." /> :
       history.length === 0 ? <EmptyState icon="📊" title="No Adventures Yet" message="Complete your first adventure to see it here!" /> :
       <div className="space-y-2">
         {history.map(h => (
           <div key={h.id} className="bg-ink-900 rounded-xl p-3 border border-ink-800">
             <div className="flex items-center gap-2 mb-1">
               <span className="text-lg">{h.emoji}</span>
               <p className="text-sm font-semibold text-ink-200 flex-1">{h.adventure_name}</p>
               <span className={`text-xs ${diffColors[h.difficulty] ?? 'text-ink-400'}`}>{h.difficulty}</span>
             </div>
             <div className="flex gap-3 text-xs text-ink-500">
               <span>📏 {formatDistance(h.distance)}</span>
               <span>⏱ {formatDuration(h.duration)}</span>
               <span>⭐ {h.xp_earned} XP</span>
               <span>🪙 {h.coins_earned}</span>
             </div>
             <p className="text-xs text-ink-600 mt-1">{new Date(h.completed_at).toLocaleDateString()}</p>
           </div>
         ))}
       </div>
      }
    </ScreenShell>
  )
}
