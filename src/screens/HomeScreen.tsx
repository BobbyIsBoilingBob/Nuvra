import { useEffect, useState } from 'react'
import { Bell, Flame, Star, ChevronRight, Trophy, Target, Gift, Backpack, ShoppingBag, ScrollText, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { NAV_ITEMS } from '@/data/navigation'
import { levelFromXp, xpProgressInLevel } from '@/lib/geo'
import { getNotifications, getDailyReward } from '@/lib/db'
import type { NotificationItem, DailyReward, ScreenName } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Props { onNavigate: (screen: string) => void }
export default function HomeScreen({ onNavigate }: Props) {
  const { profile } = useAuth()
  const [notifs, setNotifs] = useState<NotificationItem[]>([])
  const [reward, setReward] = useState<DailyReward | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { const [n, r] = await Promise.all([getNotifications(), getDailyReward()]); setNotifs(n || []); setReward(r); setLoading(false) })() }, [])
  if (!profile) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  const level = levelFromXp(profile.xp), { current, needed } = xpProgressInLevel(profile.xp), unread = notifs.filter(n => !n.read).length, canClaim = !reward || reward.last_claim_date !== new Date().toISOString().split('T')[0]
  return (
    <>
      <ScreenShell title="Zeviqo" subtitle="Adventure System">
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-brand-50 to-accent-50/50 border border-brand-200 rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-xs text-ink-500 font-medium">Welcome back,</p><h2 className="text-xl font-bold text-ink-900">{profile.username}</h2></div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-surface-200 shadow-card"><Star size={14} className="text-brand-500" /><span className="text-sm font-bold text-ink-900">{profile.xp.toLocaleString()}</span></div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-surface-200 shadow-card"><Flame size={14} className="text-accent-500" /><span className="text-sm font-bold text-ink-900">{profile.walking_streak}</span></div>
                {unread > 0 && <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-xl bg-white border border-surface-200 shadow-card flex items-center justify-center btn-press"><Bell size={16} className="text-ink-600" /><span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span></button>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-extrabold text-lg shadow-glow-brand">{level}</div>
              <div className="flex-1"><div className="flex justify-between text-xs text-ink-500 mb-1"><span>Level {level}</span><span>{current} / {needed} XP</span></div><div className="h-2.5 bg-surface-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: (current / needed) * 100 + '%' }} /></div></div>
            </div>
          </div>
          {canClaim && <button onClick={() => onNavigate('rewards')} className="w-full bg-gradient-to-r from-accent-50 to-accent-100/50 border border-accent-300 rounded-2xl p-4 flex items-center gap-3 btn-press animate-glow"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center"><Flame size={20} className="text-white" /></div><div className="flex-1 text-left"><p className="text-sm font-bold text-accent-700">Daily Reward Ready!</p><p className="text-xs text-ink-500">Tap to claim your daily reward</p></div><ChevronRight size={18} className="text-accent-600" /></button>}
          <div><h3 className="section-label">Explore</h3><div className="grid grid-cols-2 gap-3">
            {NAV_ITEMS.map((item, i) => { const Icon = item.icon; return (
              <button key={item.id} onClick={() => onNavigate(item.id)} className="card-premium p-4 text-left stagger" style={{ animationDelay: i * 40 + 'ms' }}>
                <div className={'w-11 h-11 rounded-xl bg-gradient-to-br ' + item.gradient + ' flex items-center justify-center mb-3 shadow-card'}><Icon size={22} className="text-white" /></div>
                <p className="text-sm font-bold text-ink-900">{item.label}</p>
              </button>
            )})}
          </div></div>
          {loading && <div className="flex justify-center py-4"><LoadingSpinner /></div>}
          {notifs.length > 0 && <div><h3 className="section-label flex items-center gap-1.5"><Bell size={12} /> Recent</h3><div className="space-y-2">{notifs.slice(0, 3).map(n => <button key={n.id} onClick={() => onNavigate('notifications')} className="w-full bg-white border border-surface-200 rounded-xl p-3 flex items-start gap-3 text-left shadow-card btn-press">{!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}<div className="flex-1 min-w-0"><p className="text-sm font-medium text-ink-800 truncate">{n.title}</p><p className="text-xs text-ink-400 mt-0.5 line-clamp-1">{n.message}</p></div></button>)}</div></div>}
        </div>
      </ScreenShell>
      <BottomNav active="home" onNavigate={onNavigate} />
    </>
  )
}
