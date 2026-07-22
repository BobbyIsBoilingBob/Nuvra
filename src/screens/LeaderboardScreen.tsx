import { useState } from 'react'
import { Trophy, Crown, Star, TrendingUp } from 'lucide-react'
import type { LeaderboardEntry } from '@/types/adventure'
import { useAuth } from '@/lib/auth'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'

interface Props { onNavigate: (s: string) => void }

const mockLeaderboard: LeaderboardEntry[] = [
  { id: 'l1', rank: 1, username: 'SummitX', avatar_color: '#312f81', level: 15, xp: 25000, weekly_xp: 3200 },
  { id: 'l2', rank: 2, username: 'TrailBlazer', avatar_color: '#10b981', level: 12, xp: 18000, weekly_xp: 2800 },
  { id: 'l3', rank: 3, username: 'GeoExplorer', avatar_color: '#06b6d4', level: 11, xp: 16000, weekly_xp: 2400 },
  { id: 'l4', rank: 4, username: 'PathFinder', avatar_color: '#f59e0b', level: 10, xp: 14000, weekly_xp: 2100 },
  { id: 'l5', rank: 5, username: 'MoonWalker', avatar_color: '#059669', level: 9, xp: 12000, weekly_xp: 1900 },
  { id: 'l6', rank: 6, username: 'AdventureAce', avatar_color: '#ef4444', level: 8, xp: 10000, weekly_xp: 1500 },
  { id: 'l7', rank: 7, username: 'Wanderlust', avatar_color: '#8b5cf6', level: 7, xp: 8000, weekly_xp: 1200 },
  { id: 'l8', rank: 8, username: 'GreenWalker', avatar_color: '#f97316', level: 6, xp: 6000, weekly_xp: 900 },
  { id: 'l9', rank: 9, username: 'TrailSeeker', avatar_color: '#84cc16', level: 5, xp: 4500, weekly_xp: 700 },
  { id: 'l10', rank: 10, username: 'NightOwl', avatar_color: '#6366f1', level: 4, xp: 3000, weekly_xp: 500 },
]

export default function LeaderboardScreen({ onNavigate }: Props) {
  const { profile } = useAuth()
  const [period, setPeriod] = useState<'all' | 'weekly'>('all')
  const sorted = [...mockLeaderboard].sort((a, b) => period === 'weekly' ? b.weekly_xp - a.weekly_xp : b.xp - a.xp)

  return (
    <>
      <ScreenShell title="Leaderboard" subtitle="Top adventurers worldwide">
        <div className="space-y-4">
          <div className="flex gap-2">
            {[{ id: 'all' as const, label: 'All Time' }, { id: 'weekly' as const, label: 'This Week' }].map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} className={`chip flex-1 text-center ${period === p.id ? 'chip-active' : 'chip-inactive'}`}>{p.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {sorted.slice(0, 3).map((e, i) => (
              <div key={e.id} className={`rounded-2xl p-4 text-center border stagger ${i === 0 ? 'bg-gradient-to-br from-accent-50 to-accent-100/50 border-accent-300' : i === 1 ? 'bg-gradient-to-br from-surface-100 to-surface-200/50 border-surface-300' : 'bg-gradient-to-br from-brand-50 to-brand-100/50 border-brand-200'}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="relative inline-block mb-2">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: e.avatar_color }}>{e.username.charAt(0)}</div>
                  {i === 0 && <Crown size={16} className="absolute -top-2 -right-1 text-accent-500" />}
                </div>
                <p className="text-xs font-bold text-ink-900 truncate">{e.username}</p>
                <p className="text-xs text-ink-400">Lv {e.level}</p>
                <p className="text-sm font-bold text-brand-600 mt-1">{period === 'weekly' ? e.weekly_xp : e.xp}</p>
                <div className={`text-xs font-bold mt-1 ${i === 0 ? 'text-accent-600' : i === 1 ? 'text-ink-500' : 'text-brand-600'}`}>#{i + 1}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {sorted.slice(3).map((e, i) => (
              <div key={e.id} className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card stagger" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-sm font-bold text-ink-400 w-6 text-center">{e.rank}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: e.avatar_color }}>{e.username.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 truncate">{e.username}</p><p className="text-xs text-ink-400">Level {e.level}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-brand-600">{period === 'weekly' ? e.weekly_xp : e.xp}</p><p className="text-xs text-ink-400">XP</p></div>
              </div>
            ))}
          </div>

          {profile && (
            <div className="sticky bottom-20 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-3.5 flex items-center gap-3 shadow-glow-brand">
              <span className="text-sm font-bold text-white/80 w-6 text-center">?</span>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">{profile.username.charAt(0)}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{profile.username}</p><p className="text-xs text-white/70">Level {profile.level}</p></div>
              <div className="text-right"><p className="text-sm font-bold text-white">{profile.xp.toLocaleString()}</p><p className="text-xs text-white/70">XP</p></div>
            </div>
          )}
        </div>
      </ScreenShell>
      <BottomNav active="leaderboard" onNavigate={onNavigate} />
    </>
  )
}
