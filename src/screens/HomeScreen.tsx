import { useCallback, memo } from 'react'
import { Bell, Gift, Flame, Zap, MapPin, Trophy, Target, ScrollText, Users, Bot, Sparkles, ChevronRight } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonCard } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { useAuth } from '@/lib/auth'
import { useLevelInfo, formatDuration } from '@/lib/geo'
import { getNotifications, getDailyReward, claimDailyReward } from '@/lib/db'
import { NAV_ITEMS } from '@/data/navigation'
import type { ScreenName, NotificationItem, DailyReward } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

function HomeScreenInner({ onNavigate }: Props) {
  const { profile } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const { data: notifications, loading: notifLoading } = useCachedData<NotificationItem[]>('notifications', getNotifications)
  const { data: dailyReward, loading: rewardLoading, refresh: refreshReward } = useCachedData<DailyReward | null>('daily-reward', getDailyReward)

  const levelInfo = useLevelInfo(profile?.xp ?? 0)
  const unreadCount = notifications?.filter(n => !n.read).length ?? 0
  const canClaim = dailyReward ? dailyReward.last_claim_date !== new Date().toISOString().split('T')[0] : false

  const handleClaim = useCallback(async () => {
    const result = await claimDailyReward()
    if (result) {
      push('reward', 'Daily Reward Claimed!', '+' + result.xp + ' XP, +' + result.coins + ' coins')
      refreshReward()
    }
  }, [push, refreshReward])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  return (
    <>
      <ScreenShell title="Zeviqo" subtitle={profile?.username ? 'Welcome, ' + profile.username : 'Your adventure awaits'} actions={[{ icon: <Bell size={18} />, onClick: () => onNavigate('notifications'), label: 'Notifications' }]}>
        <div className="space-y-5">
          {/* Level card */}
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-5 text-white shadow-card-hover animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs opacity-80 font-medium">Level {levelInfo.level}</p>
                <p className="text-2xl font-extrabold">{profile?.xp ?? 0} XP</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap size={24} className="text-white" />
              </div>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: levelInfo.pct + '%' }} />
            </div>
            <p className="text-xs opacity-80 mt-2">{levelInfo.current} / {levelInfo.needed} XP to next level</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-surface-200 rounded-xl p-3 text-center shadow-card">
              <Flame size={20} className="mx-auto text-warning-500 mb-1" />
              <p className="text-lg font-extrabold text-ink-900">{profile?.walking_streak ?? 0}</p>
              <p className="text-[10px] text-ink-400 font-medium">Day Streak</p>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3 text-center shadow-card">
              <Trophy size={20} className="mx-auto text-accent-500 mb-1" />
              <p className="text-lg font-extrabold text-ink-900">{profile?.completed_adventures ?? 0}</p>
              <p className="text-[10px] text-ink-400 font-medium">Adventures</p>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3 text-center shadow-card">
              <Gift size={20} className="mx-auto text-brand-500 mb-1" />
              <p className="text-lg font-extrabold text-ink-900">{profile?.coins ?? 0}</p>
              <p className="text-[10px] text-ink-400 font-medium">Coins</p>
            </div>
          </div>

          {/* Daily reward */}
          {rewardLoading && !dailyReward ? <SkeletonCard /> : (
            <div className={'rounded-2xl p-4 border-2 transition animate-fade-in ' + (canClaim ? 'bg-accent-50 border-accent-400' : 'bg-white border-surface-200')}>
              <div className="flex items-center gap-3">
                <div className={'w-12 h-12 rounded-xl flex items-center justify-center ' + (canClaim ? 'bg-accent-500' : 'bg-surface-200')}>
                  <Gift size={24} className={canClaim ? 'text-white' : 'text-ink-400'} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink-900">Daily Reward</p>
                  <p className="text-xs text-ink-400">{canClaim ? 'Available to claim!' : 'Claimed today. Come back tomorrow!'}</p>
                </div>
                {canClaim && <button onClick={handleClaim} className="btn-primary text-sm">Claim</button>}
              </div>
              {dailyReward && <p className="text-xs text-ink-500 mt-2 font-semibold">Streak: {dailyReward.streak} days</p>}
            </div>
          )}

          {/* Quick actions */}
          <div>
            <p className="section-label">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onNavigate('generator')} className="card-premium p-4 text-left hover:border-brand-400 transition btn-press">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-2"><Bot size={20} className="text-white" /></div>
                <p className="text-sm font-bold text-ink-900">AI Generator</p>
                <p className="text-xs text-ink-400">Create adventure</p>
              </button>
              <button onClick={() => onNavigate('challenges')} className="card-premium p-4 text-left hover:border-brand-400 transition btn-press">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center mb-2"><Target size={20} className="text-white" /></div>
                <p className="text-sm font-bold text-ink-900">Challenges</p>
                <p className="text-xs text-ink-400">Test your skills</p>
              </button>
              <button onClick={() => onNavigate('quests')} className="card-premium p-4 text-left hover:border-brand-400 transition btn-press">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center mb-2"><ScrollText size={20} className="text-white" /></div>
                <p className="text-sm font-bold text-ink-900">Quests</p>
                <p className="text-xs text-ink-400">Complete tasks</p>
              </button>
              <button onClick={() => onNavigate('community')} className="card-premium p-4 text-left hover:border-brand-400 transition btn-press">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-2"><Users size={20} className="text-white" /></div>
                <p className="text-sm font-bold text-ink-900">Community</p>
                <p className="text-xs text-ink-400">Shared adventures</p>
              </button>
            </div>
          </div>

          {/* Notifications preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-label mb-0">Recent Notifications</p>
              {unreadCount > 0 && <span className="text-[10px] font-bold text-white bg-error-500 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
            </div>
            {notifLoading && !notifications ? <SkeletonCard /> : notifications && notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n, i) => (
                  <button key={n.id} onClick={() => onNavigate('notifications')} className="w-full card-premium p-3 flex items-center gap-3 text-left hover:border-brand-400 transition btn-press" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (n.read ? 'bg-surface-100' : 'bg-brand-50')}>
                      <Bell size={16} className={n.read ? 'text-ink-400' : 'text-brand-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{n.title}</p>
                      <p className="text-xs text-ink-400 truncate">{n.message}</p>
                    </div>
                    <ChevronRight size={16} className="text-ink-400" />
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Bell size={28} />} title="No notifications" message="You're all caught up!" />
            )}
          </div>

          {/* Explore menu */}
          <div>
            <p className="section-label">Explore</p>
            <div className="space-y-2">
              {NAV_ITEMS.map((item, i) => {
                const Icon = item.icon
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)} className="w-full card-premium p-3 flex items-center gap-3 text-left hover:border-brand-400 transition btn-press animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className={'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center ' + item.gradient}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{item.label}</p>
                    </div>
                    <ChevronRight size={18} className="text-ink-400" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="home" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const HomeScreen = memo(HomeScreenInner)
