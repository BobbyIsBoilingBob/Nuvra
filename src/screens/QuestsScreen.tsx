import { ScrollText, Star, Coins, Clock, CircleCheck as CheckCircle2, Circle } from 'lucide-react'
import type { Quest } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }

const mockQuests: Quest[] = [
  { id: 'q1', title: 'Daily Walk', description: 'Complete 1 adventure today', progress: 0, target: 1, xp: 100, coins: 50, type: 'daily', expires_at: new Date(Date.now() + 86400000).toISOString() },
  { id: 'q2', title: 'Weekly Explorer', description: 'Complete 5 adventures this week', progress: 2, target: 5, xp: 500, coins: 200, type: 'weekly', expires_at: new Date(Date.now() + 5 * 86400000).toISOString() },
  { id: 'q3', title: 'Photo Master', description: 'Complete 10 photo challenges', progress: 7, target: 10, xp: 300, coins: 150, type: 'achievement' },
  { id: 'q4', title: 'Social Butterfly', description: 'Add 3 friends', progress: 1, target: 3, xp: 200, coins: 100, type: 'social' },
  { id: 'q5', title: 'Streak Keeper', description: 'Walk 7 days in a row', progress: 5, target: 7, xp: 400, coins: 250, type: 'streak' },
]

export default function QuestsScreen({ onNavigate }: Props) {
  const daily = mockQuests.filter(q => q.type === 'daily')
  const weekly = mockQuests.filter(q => q.type === 'weekly')
  const other = mockQuests.filter(q => q.type !== 'daily' && q.type !== 'weekly')

  const renderQuest = (q: Quest, i: number) => {
    const pct = Math.min((q.progress / q.target) * 100, 100)
    const done = q.progress >= q.target
    return (
      <div key={q.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 40}ms` }}>
        <div className="flex items-start gap-3 mb-3">
          {done ? <CheckCircle2 size={20} className="text-success-500 flex-shrink-0 mt-0.5" /> : <Circle size={20} className="text-ink-300 flex-shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-900">{q.title}</p>
            <p className="text-xs text-ink-400 mt-0.5">{q.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1 text-xs font-semibold text-brand-600"><Star size={12} /> {q.xp}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-accent-600"><Coins size={12} /> {q.coins}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-surface-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-success-500' : 'bg-gradient-to-r from-brand-500 to-accent-500'}`} style={{ width: `${pct}%` }} /></div>
          <span className="text-xs font-bold text-ink-500">{q.progress}/{q.target}</span>
          {q.expires_at && !done && <span className="text-xs text-ink-400 flex items-center gap-1"><Clock size={10} /> {new Date(q.expires_at).toLocaleDateString('en', { weekday: 'short' })}</span>}
        </div>
      </div>
    )
  }

  return (
    <>
      <ScreenShell title="Quests" subtitle="Complete quests for rewards">
        <div className="space-y-5">
          {daily.length > 0 && <div><h3 className="section-label flex items-center gap-1.5"><ScrollText size={12} /> Daily</h3><div className="space-y-3">{daily.map(renderQuest)}</div></div>}
          {weekly.length > 0 && <div><h3 className="section-label flex items-center gap-1.5"><ScrollText size={12} /> Weekly</h3><div className="space-y-3">{weekly.map(renderQuest)}</div></div>}
          {other.length > 0 && <div><h3 className="section-label flex items-center gap-1.5"><ScrollText size={12} /> Ongoing</h3><div className="space-y-3">{other.map(renderQuest)}</div></div>}
          {mockQuests.length === 0 && <EmptyState icon={<ScrollText size={32} />} title="No quests available" message="Check back later for new quests" actionLabel="Explore" onAction={() => onNavigate('home')} />}
        </div>
      </ScreenShell>
      <BottomNav active="quests" onNavigate={onNavigate} />
    </>
  )
}
