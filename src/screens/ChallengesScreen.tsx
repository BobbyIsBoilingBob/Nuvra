import { useState } from 'react'
import { Target, Star, Coins, Check, Clock, Zap, Brain, Camera, Compass, Footprints } from 'lucide-react'
import type { ChallengeCategory } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }
const categoryIconMap: Record<ChallengeCategory, typeof Target> = { trivia: Brain, photo: Camera, fitness: Footprints, compass: Compass, riddle: Brain, speed: Zap, exploration: Compass, puzzle: Brain }
const mockChallenges = [
  { id: 'ch1', title: 'Daily Trivia', category: 'trivia' as ChallengeCategory, xp: 50, coins: 20, completed: false, timeLeft: '12h 30m' },
  { id: 'ch2', title: 'Photo Walk', category: 'photo' as ChallengeCategory, xp: 80, coins: 30, completed: false, timeLeft: '5h 15m' },
  { id: 'ch3', title: 'Step Master', category: 'fitness' as ChallengeCategory, xp: 60, coins: 25, completed: true, timeLeft: 'Completed' },
  { id: 'ch4', title: 'Compass Quest', category: 'compass' as ChallengeCategory, xp: 70, coins: 25, completed: false, timeLeft: '18h 45m' },
  { id: 'ch5', title: 'Speed Demon', category: 'speed' as ChallengeCategory, xp: 100, coins: 50, completed: false, timeLeft: '3h 20m' },
  { id: 'ch6', title: 'Riddle Master', category: 'riddle' as ChallengeCategory, xp: 90, coins: 40, completed: true, timeLeft: 'Completed' },
]
export default function ChallengesScreen({ onNavigate }: Props) {
  const [challenges, setChallenges] = useState(mockChallenges)
  const [filter, setFilter] = useState<'all'|'active'|'completed'>('all')
  const filtered = challenges.filter(c => filter === 'all' || (filter === 'active' && !c.completed) || (filter === 'completed' && c.completed))
  return (
    <>
      <ScreenShell title="Challenges" subtitle="Daily and weekly challenges">
        <div className="space-y-4">
          <div className="flex gap-2">{[{ id: 'all' as const, label: 'All' }, { id: 'active' as const, label: 'Active' }, { id: 'completed' as const, label: 'Completed' }].map(f => <button key={f.id} onClick={() => setFilter(f.id)} className={'chip flex-1 text-center ' + (filter === f.id ? 'chip-active' : 'chip-inactive')}>{f.label}</button>)}</div>
          {filtered.length === 0 ? <EmptyState icon={<Target size={32} />} title="No challenges here" message="Check back later for new challenges" /> : (
            <div className="space-y-3">{filtered.map((c, i) => { const Icon = categoryIconMap[c.category]; return (
              <div key={c.id} className={'card-premium p-4 stagger ' + (c.completed ? 'opacity-60' : '')} style={{ animationDelay: i * 40 + 'ms' }}>
                <div className="flex items-start gap-3">
                  <div className={'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ' + (c.completed ? 'bg-success-100' : 'bg-gradient-to-br from-brand-500 to-brand-600')}>{c.completed ? <Check size={20} className="text-success-600" /> : <Icon size={20} className="text-white" />}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-ink-900">{c.title}</p><p className="text-xs text-ink-400 capitalize mt-0.5">{c.category} challenge</p><div className="flex items-center gap-3 mt-2"><span className="flex items-center gap-1 text-xs font-semibold text-brand-600"><Star size={12} /> +{c.xp} XP</span><span className="flex items-center gap-1 text-xs font-semibold text-accent-600"><Coins size={12} /> +{c.coins}</span><span className={'flex items-center gap-1 text-xs ' + (c.completed ? 'text-success-600' : 'text-ink-400')}><Clock size={12} /> {c.timeLeft}</span></div></div>
                  {!c.completed && <button onClick={() => { setChallenges(prev => prev.map(x => x.id === c.id ? { ...x, completed: true, timeLeft: 'Completed' } : x)); onNavigate('generator') }} className="px-3 py-2 bg-brand-50 border border-brand-200 text-brand-600 rounded-xl text-xs font-bold btn-press hover:bg-brand-100 transition flex items-center gap-1"><Target size={12} /> Start</button>}
                </div>
              </div>
            )})}</div>
          )}
        </div>
      </ScreenShell>
      <BottomNav active="challenges" onNavigate={onNavigate} />
    </>
  )
}
