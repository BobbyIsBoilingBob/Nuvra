import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaderboardEntry } from '../types'

type SortBy = 'xp' | 'level' | 'distance_walked' | 'completed_adventures'

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortBy>('xp')

  useEffect(() => { fetchLeaderboard() }, [sortBy])

  const fetchLeaderboard = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('id, username, avatar_emoji, avatar_color, xp, level, distance_walked, completed_adventures').order(sortBy, { ascending: false }).limit(50)
    if (!error && data) setEntries(data as LeaderboardEntry[])
    setLoading(false)
  }

  const sortOptions: { key: SortBy; label: string; icon: string }[] = [
    { key: 'xp', label: 'XP', icon: '⭐' },
    { key: 'level', label: 'Level', icon: '📈' },
    { key: 'distance_walked', label: 'Distance', icon: '📏' },
    { key: 'completed_adventures', label: 'Adventures', icon: '🗺️' },
  ]

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Leaderboard</h1>
        <p className="text-sm text-neutral-500 mb-4">Top explorers around the world</p>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {sortOptions.map(o => <button key={o.key} onClick={() => setSortBy(o.key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${sortBy === o.key ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{o.icon} {o.label}</button>)}
        </div>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="card p-4"><div className="shimmer-bg h-12 rounded-xl" /></div>)}</div>
        ) : entries.length === 0 ? (
          <div className="card p-8 text-center"><div className="text-5xl mb-3">🏆</div><p className="text-neutral-500 font-medium mb-1">No players yet</p><p className="text-sm text-neutral-400">Be the first to join the leaderboard!</p></div>
        ) : (
          <div className="space-y-2">
            {entries.map((e, i) => (
              <div key={e.id} className={`card p-3 flex items-center gap-3 animate-fade-in ${i < 3 ? 'border-2' : ''}`} style={i < 3 ? { borderColor: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#d97706' } : {}}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-accent-100 text-accent-700' : i === 1 ? 'bg-neutral-200 text-neutral-700' : i === 2 ? 'bg-accent-50 text-accent-600' : 'bg-neutral-100 text-neutral-500'}`}>{i + 1}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: e.avatar_color }}>{e.avatar_emoji}</div>
                <div className="flex-1 min-w-0"><h3 className="font-semibold text-sm text-neutral-900 truncate">{e.username}</h3><p className="text-xs text-neutral-500">{sortBy === 'xp' && `Level ${e.level}`}{sortBy === 'level' && `${e.xp.toLocaleString()} XP`}{sortBy === 'distance_walked' && `${(e.distance_walked / 1000).toFixed(2)} km`}{sortBy === 'completed_adventures' && `${e.completed_adventures} adventures`}</p></div>
                <div className="text-right"><p className="font-bold text-sm text-neutral-900">{sortBy === 'xp' && e.xp.toLocaleString()}{sortBy === 'level' && `Lv ${e.level}`}{sortBy === 'distance_walked' && `${(e.distance_walked / 1000).toFixed(1)}km`}{sortBy === 'completed_adventures' && e.completed_adventures}</p><p className="text-[10px] text-neutral-400">{sortBy === 'xp' && 'XP'}{sortBy === 'level' && 'Level'}{sortBy === 'distance_walked' && 'Distance'}{sortBy === 'completed_adventures' && 'Adventures'}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
