import { useEffect, useState } from 'react'
import { Star, Flame, Coins, Mountain, Settings as SettingsIcon, Trophy } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getAchievements, getAdventureHistory } from '@/lib/db'
import { levelFromXp, xpProgressInLevel, formatDuration } from '@/lib/geo'
import type { Achievement, AdventureHistoryItem } from '@/types/adventure'
import { achievementIcons } from '@/data/navigation'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }
export default function ProfileScreen({ onNavigate }: Props) {
  const { profile } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [history, setHistory] = useState<AdventureHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { const [a, h] = await Promise.all([getAchievements(), getAdventureHistory()]); setAchievements(a || []); setHistory(h || []); setLoading(false) })() }, [])
  if (!profile) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  const level = levelFromXp(profile.xp), { current, needed } = xpProgressInLevel(profile.xp)
  return (
    <>
      <ScreenShell title="Profile" subtitle="Your adventure stats" actions={[{ icon: <SettingsIcon size={18} />, onClick: () => onNavigate('settings'), label: 'Settings' }]}>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-5 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-3xl font-extrabold shadow-glow-brand mb-3">{level}</div>
            <h2 className="text-xl font-bold text-ink-900">{profile.username}</h2>
            <p className="text-sm text-ink-500 mt-0.5">Level {level} Adventurer</p>
            <div className="mt-4 max-w-xs mx-auto"><div className="flex justify-between text-xs text-ink-500 mb-1"><span>{current} XP</span><span>{needed} XP</span></div><div className="h-2.5 bg-surface-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: (current / needed) * 100 + '%' }} /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ icon: Star, label: 'Total XP', value: profile.xp.toLocaleString(), color: 'text-brand-500', bg: 'bg-brand-50' }, { icon: Flame, label: 'Day Streak', value: String(profile.walking_streak), color: 'text-accent-500', bg: 'bg-accent-50' }, { icon: Coins, label: 'Coins', value: profile.coins.toLocaleString(), color: 'text-accent-500', bg: 'bg-accent-50' }, { icon: Mountain, label: 'Adventures', value: String(profile.completed_adventures), color: 'text-brand-500', bg: 'bg-brand-50' }].map((s, i) => (
              <div key={i} className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card stagger" style={{ animationDelay: i * 50 + 'ms' }}><div className={'w-10 h-10 rounded-lg ' + s.bg + ' flex items-center justify-center'}><s.icon size={20} className={s.color} /></div><div><p className="text-xs text-ink-400">{s.label}</p><p className="text-lg font-bold text-ink-900">{s.value}</p></div></div>
            ))}
          </div>
          <div><h3 className="section-label flex items-center gap-1.5"><Trophy size={12} /> Achievements ({achievements.length})</h3>
            {loading ? <div className="flex justify-center py-6"><LoadingSpinner /></div> : achievements.length === 0 ? <EmptyState icon={<Trophy size={32} />} title="No achievements yet" message="Complete adventures to unlock achievements" /> : (
              <div className="grid grid-cols-4 gap-2.5">{achievements.map((a, i) => { const Icon = achievementIcons[a.icon] || Trophy; const bgClass = a.unlocked ? 'bg-gradient-to-br from-accent-50 to-brand-50 border-accent-300' : 'bg-surface-50 border-surface-200 opacity-60'; return (
                <div key={a.id} className={'aspect-square rounded-xl border flex flex-col items-center justify-center p-2 stagger ' + bgClass} style={{ animationDelay: i * 30 + 'ms' }}><Icon size={20} className={a.unlocked ? 'text-accent-500' : 'text-ink-400'} /><p className="text-[10px] text-ink-500 mt-1 text-center leading-tight line-clamp-2">{a.achievement_name}</p></div>
              )})}</div>
            )}
          </div>
          <div><h3 className="section-label flex items-center gap-1.5"><Mountain size={12} /> Recent Adventures</h3>
            {history.length === 0 ? <EmptyState icon={<Mountain size={32} />} title="No adventures yet" message="Generate your first adventure to get started" actionLabel="Generate" onAction={() => onNavigate('generator')} /> : (
              <div className="space-y-2">{history.slice(0, 5).map((h, i) => <div key={h.id} className="bg-white border border-surface-200 rounded-xl p-3 flex items-center gap-3 shadow-card stagger" style={{ animationDelay: i * 40 + 'ms' }}><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center"><Mountain size={16} className="text-brand-500" /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 truncate">{h.adventure_name}</p><p className="text-xs text-ink-400">{formatDuration(h.duration)} · {h.treasures_found} challenges</p></div><div className="text-right"><p className="text-xs font-bold text-brand-600">+{h.xp_earned}</p></div></div>)}</div>
            )}
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="profile" onNavigate={onNavigate} />
    </>
  )
}
