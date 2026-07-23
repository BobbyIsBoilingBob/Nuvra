import { Calendar, Star, Coins, Clock } from 'lucide-react'
import type { SeasonalEvent } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }
const mockEvents: SeasonalEvent[] = [
  { id: 'e1', name: 'Summer Adventure Festival', description: 'Complete 10 adventures during the summer festival', icon: 'sun', progress: 4, target: 10, reward_xp: 1000, reward_coins: 500, ends_at: new Date(Date.now() + 14 * 86400000).toISOString() },
  { id: 'e2', name: 'Weekly Photo Contest', description: 'Submit 5 photos from your adventures', icon: 'camera', progress: 2, target: 5, reward_xp: 500, reward_coins: 200, ends_at: new Date(Date.now() + 3 * 86400000).toISOString() },
  { id: 'e3', name: 'Explorer Challenge', description: 'Visit 15 unique locations', icon: 'compass', progress: 8, target: 15, reward_xp: 800, reward_coins: 400, ends_at: new Date(Date.now() + 21 * 86400000).toISOString() },
]
export default function SeasonalScreen({ onNavigate }: Props) {
  return (
    <>
      <ScreenShell title="Seasonal Events" subtitle="Limited-time adventures">
        {mockEvents.length === 0 ? <EmptyState icon={<Calendar size={32} />} title="No active events" message="Check back during holidays and special occasions" /> : (
          <div className="space-y-4">{mockEvents.map((e, i) => { const pct = Math.min((e.progress / e.target) * 100, 100); const daysLeft = Math.ceil((new Date(e.ends_at).getTime() - Date.now()) / 86400000); return (
            <div key={e.id} className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-4 stagger" style={{ animationDelay: i * 50 + 'ms' }}>
              <div className="flex items-start gap-3 mb-3"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0"><Calendar size={22} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-ink-900">{e.name}</p><p className="text-xs text-ink-500 mt-0.5">{e.description}</p></div><span className="flex items-center gap-1 text-xs text-ink-400 flex-shrink-0"><Clock size={12} /> {daysLeft}d</span></div>
              <div className="mb-3"><div className="flex justify-between text-xs text-ink-500 mb-1"><span>Progress</span><span>{e.progress}/{e.target}</span></div><div className="h-2.5 bg-surface-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: pct + '%' }} /></div></div>
              <div className="flex items-center gap-3"><span className="flex items-center gap-1 text-xs font-semibold text-brand-600"><Star size={12} /> {e.reward_xp} XP</span><span className="flex items-center gap-1 text-xs font-semibold text-accent-600"><Coins size={12} /> {e.reward_coins} coins</span></div>
            </div>
          )})}</div>
        )}
      </ScreenShell>
      <BottomNav active="seasonal" onNavigate={onNavigate} />
    </>
  )
}
