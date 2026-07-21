import { useEffect, useState } from 'react'
import { Trophy, Medal, Crown } from 'lucide-react'
import { getLeaderboard } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import type { UserProfile } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function LeaderboardScreen() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => { const e = await getLeaderboard(); setEntries(e || []); setLoading(false) })() }, [])

  const rankIcons = [Crown, Medal, Trophy]
  const rankColors = ['from-amber-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-600']

  return (
    <ScreenShell title="Leaderboard" subtitle="Top adventurers">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : entries.length === 0 ? <EmptyState icon={<Trophy size={32} />} title="No entries yet" message="Be the first!" /> : (
        <div className="space-y-2">
          {entries.slice(0, 3).length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {entries.slice(0, 3).map((e, i) => {
                const Icon = rankIcons[i] || Trophy
                return (
                  <div key={e.id} className={`card-premium p-4 text-center ${i === 0 ? 'scale-105' : ''}`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${rankColors[i]} flex items-center justify-center mb-2`}><Icon className="text-white" size={20} /></div>
                    <p className="text-xs font-bold text-ink-100 truncate">{e.username}</p>
                    <p className="text-xs text-ink-500">Lvl {e.level}</p>
                  </div>
                )
              })}
            </div>
          )}
          {entries.map((e, i) => (
            <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl border ${e.id === user?.id ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface-100 border-white/[0.04]'} stagger`} style={{ animationDelay: `${i * 30}ms` }}>
              <span className="w-6 text-center text-sm font-bold text-ink-400">{i + 1}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm">{e.username.charAt(0).toUpperCase()}</div>
              <div className="flex-1"><p className="text-sm font-semibold text-ink-100">{e.username}{e.id === user?.id && <span className="text-brand-400 text-xs ml-1">(You)</span>}</p><p className="text-xs text-ink-500">{e.xp.toLocaleString()} XP</p></div>
              <span className="text-xs font-bold text-accent-400">Lvl {e.level}</span>
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
