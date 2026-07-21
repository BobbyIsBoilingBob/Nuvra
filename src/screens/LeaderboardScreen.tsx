import { useEffect, useState } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getLeaderboard } from '@/lib/db'
import type { UserProfile } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function LeaderboardScreen() {
  const { user } = useAuth()
  const [board, setBoard] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const b = await getLeaderboard()
      setBoard(b || []); setLoading(false)
    })()
  }, [])

  const rankIcon = (i: number) => i === 0 ? <Trophy size={20} className="text-accent-400" /> : i === 1 ? <Medal size={20} className="text-ink-300" /> : i === 2 ? <Award size={20} className="text-amber-700" /> : <span className="text-sm font-bold text-ink-500">{i + 1}</span>

  return (
    <ScreenShell title="Leaderboard" subtitle="Top adventurers">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : board.length === 0 ? (
        <EmptyState icon={<Trophy size={32} />} title="No rankings yet" message="Complete adventures to appear here" />
      ) : (
        <>
          {board.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-6 mt-2">
              {[1, 0, 2].map((idx) => {
                const u = board[idx]; if (!u) return null
                const heights = ['h-20', 'h-28', 'h-16']
                const colors = ['from-ink-400 to-ink-500', 'from-accent-500 to-accent-600', 'from-amber-700 to-amber-800']
                const hIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2
                return (
                  <div key={u.id} className="flex flex-col items-center stagger" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold mb-1">{u.username.charAt(0).toUpperCase()}</div>
                    <p className="text-xs font-semibold text-ink-200 mb-1 max-w-[80px] truncate">{u.username}</p>
                    <div className={`w-20 ${heights[hIdx]} bg-gradient-to-t ${colors[hIdx]} rounded-t-xl flex items-center justify-center text-white font-extrabold text-lg`}>{idx + 1}</div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="space-y-2">
            {board.map((u, i) => (
              <div key={u.id} className={`rounded-xl p-3 flex items-center gap-3 stagger ${u.id === user?.id ? 'bg-gradient-to-r from-brand-500/15 to-accent-500/10 border border-brand-500/30' : 'bg-surface-100 border border-white/[0.04]'}`} style={{ animationDelay: `${i * 30}ms` }}>
                <div className="w-8 flex justify-center">{rankIcon(i)}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">{u.username.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-100 truncate">{u.username}{u.id === user?.id && <span className="text-xs text-brand-400 ml-1">(You)</span>}</p><p className="text-xs text-ink-500">Level {u.level}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-brand-400">{u.xp.toLocaleString()}</p><p className="text-xs text-ink-500">XP</p></div>
              </div>
            ))}
          </div>
        </>
      )}
    </ScreenShell>
  )
}
