import { useState, useCallback, memo } from 'react'
import { Trophy, Crown, Medal, Zap } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { useAuth } from '@/lib/auth'
import { useLevelInfo } from '@/lib/geo'
import type { ScreenName, LeaderboardEntry } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockLeaderboard: LeaderboardEntry[] = [
  { id: 'l1', rank: 1, username: 'PeakSeeker', avatar_color: '#8b5cf6', level: 12, xp: 9800, weekly_xp: 1200 },
  { id: 'l2', rank: 2, username: 'TrailBlazer', avatar_color: '#10b981', level: 10, xp: 7600, weekly_xp: 950 },
  { id: 'l3', rank: 3, username: 'NightOwl', avatar_color: '#3b82f6', level: 9, xp: 6200, weekly_xp: 800 },
  { id: 'l4', rank: 4, username: 'CityRoamer', avatar_color: '#f59e0b', level: 8, xp: 5400, weekly_xp: 700 },
  { id: 'l5', rank: 5, username: 'FoodieFan', avatar_color: '#ec4899', level: 7, xp: 4200, weekly_xp: 600 },
  { id: 'l6', rank: 6, username: 'RiddleMaster', avatar_color: '#ef4444', level: 6, xp: 3200, weekly_xp: 450 },
  { id: 'l7', rank: 7, username: 'WanderLust', avatar_color: '#14b8a6', level: 5, xp: 2400, weekly_xp: 350 },
  { id: 'l8', rank: 8, username: 'ExplorerX', avatar_color: '#f97316', level: 4, xp: 1800, weekly_xp: 280 },
  { id: 'l9', rank: 9, username: 'TrekkerY', avatar_color: '#6366f1', level: 3, xp: 1200, weekly_xp: 200 },
  { id: 'l10', rank: 10, username: 'ScoutZ', avatar_color: '#84cc16', level: 2, xp: 600, weekly_xp: 150 },
]

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return mockLeaderboard
}

function LeaderRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const levelInfo = useLevelInfo(entry.xp)
  const rankIcon = entry.rank <= 3 ? (entry.rank === 1 ? Crown : Medal) : null
  const RankIcon = rankIcon
  return (
    <div className={'rounded-xl p-3 flex items-center gap-3 border-2 transition animate-fade-in ' + (isMe ? 'bg-brand-50 border-brand-400 shadow-card' : 'bg-white border-surface-200 shadow-card')}>
      <div className="flex items-center justify-center w-8 flex-shrink-0">
        {RankIcon ? <RankIcon size={20} className={entry.rank === 1 ? 'text-accent-500' : 'text-ink-500'} /> : <span className="text-sm font-extrabold text-ink-400">{entry.rank}</span>}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: entry.avatar_color }}>
        {entry.username.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900 truncate">{entry.username}{isMe && <span className="text-xs text-brand-600 ml-1.5">(You)</span>}</p>
        <p className="text-xs text-ink-400">Level {levelInfo.level} - {entry.xp.toLocaleString()} XP</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-brand-600">+{entry.weekly_xp}</p>
        <p className="text-[10px] text-ink-400">this week</p>
      </div>
    </div>
  )
}

function LeaderboardScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [tab, setTab] = useState<'global' | 'weekly' | 'friends'>('global')
  const { profile } = useAuth()
  const { data, loading } = useCachedData<LeaderboardEntry[]>('leaderboard', fetchLeaderboard)

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const myEntry = (data ?? []).find(e => e.username === profile?.username)

  return (
    <>
      <ScreenShell title="Leaderboard" subtitle="Top explorers" icon={<Trophy size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {(['global', 'weekly', 'friends'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={'chip flex-1 ' + (tab === t ? 'chip-active' : 'chip-inactive')}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>

          {/* My rank highlight */}
          {myEntry && (
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-4 text-white shadow-card-hover animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-extrabold">#{myEntry.rank}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Your Rank</p>
                  <p className="text-xs opacity-80">{myEntry.xp.toLocaleString()} XP - Level {myEntry.level}</p>
                </div>
                <Zap size={20} className="opacity-80" />
              </div>
            </div>
          )}

          {/* Leaderboard list */}
          {loading && !data ? <SkeletonList count={6} /> : data && data.length > 0 ? (
            <div className="space-y-2">
              {data.map((entry, i) => <LeaderRow key={entry.id} entry={entry} isMe={entry.username === profile?.username} />)}
            </div>
          ) : (
            <EmptyState icon={<Trophy size={28} />} title="No rankings yet" message="Complete adventures to appear on the leaderboard" />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="leaderboard" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const LeaderboardScreen = memo(LeaderboardScreenInner)
