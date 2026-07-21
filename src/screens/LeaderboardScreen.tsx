import { useEffect, useState } from 'react'
import { Trophy, Crown, Medal, Star } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import type { UserProfile } from '@/types/adventure'
import { getLeaderboard } from '@/lib/db'
import { useAuth } from '@/lib/auth'

interface Props {
  onBack: () => void
}

export default function LeaderboardScreen({ onBack }: Props) {
  const [players, setPlayers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    getLeaderboard().then(p => { setPlayers(p); setLoading(false) })
  }, [])

  const rankIcons = [Crown, Medal, Trophy]

  return (
    <ScreenShell title="Leaderboard" icon={<Trophy size={18} className="text-yellow-400" />} onBack={onBack}>
      {loading ? <LoadingSpinner label="Loading rankings..." /> : players.length === 0 ? (
        <EmptyState icon={<Trophy size={40} />} title="No rankings yet" message="Be the first to top the leaderboard!" />
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => {
            const isMe = profile?.id === p.id
            const RankIcon = i < 3 ? rankIcons[i] : null
            return (
              <div key={p.id} className={`flex items-center gap-3 rounded-xl p-3 border ${isMe ? 'bg-brand-500/20 border-brand-500/40' : 'bg-ink-900 border-ink-800'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-ink-800 text-ink-400'}`}>
                  {RankIcon ? <RankIcon size={16} /> : i + 1}
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.avatar_color || '#3fc59b' }}>
                  <Star size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-100">{p.username}{isMe && ' (You)'}</p>
                  <p className="text-xs text-ink-500">Level {p.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-400">{p.xp}</p>
                  <p className="text-xs text-ink-500">XP</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ScreenShell>
  )
}
