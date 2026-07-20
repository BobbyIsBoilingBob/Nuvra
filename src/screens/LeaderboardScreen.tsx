import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getLeaderboard } from '@/lib/db'
import { levelFromXp } from '@/lib/geo'
import { useAuth } from '@/lib/auth'
import type { UserProfile } from '@/types/adventure'

interface Props { onBack: () => void }

export default function LeaderboardScreen({ onBack }: Props) {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard(50).then(data => {
      setLeaders(data)
      setLoading(false)
    })
  }, [])

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return String(rank)
  }

  return (
    <ScreenShell title="Leaderboard" icon="🏆" onBack={onBack}>
      {loading ? <LoadingSpinner label="Loading leaderboard..." /> :
       leaders.length === 0 ? (
         <div className="text-center py-12">
           <div className="text-5xl mb-3 opacity-50">🏆</div>
           <p className="text-sm text-ink-500">No players yet. Be the first to adventure!</p>
         </div>
       ) : (
         <div className="space-y-2">
           {leaders.map((l, i) => {
             const isYou = l.id === user?.id
             return (
               <div key={l.id} className={`flex items-center gap-3 rounded-xl p-3 border transition ${
                 isYou ? 'bg-brand-500/10 border-brand-500/30' : 'bg-ink-900 border-ink-800'
               }`}>
                 <span className="text-lg font-bold w-8 text-center">{rankIcon(i + 1)}</span>
                 <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm">{l.avatar_emoji}</div>
                 <div className="flex-1">
                   <p className={`text-sm font-semibold ${isYou ? 'text-brand-400' : 'text-ink-200'}`}>{l.username}{isYou ? ' (You)' : ''}</p>
                   <p className="text-xs text-ink-500">Level {levelFromXp(l.xp)}</p>
                 </div>
                 <p className="text-sm text-ink-400">{l.xp.toLocaleString()} XP</p>
               </div>
             )
           })}
         </div>
       )
      }
    </ScreenShell>
  )
}
