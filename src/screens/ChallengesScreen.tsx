import { useState, useCallback, memo } from 'react'
import { Target, Zap, Coins, Play, Filter } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { categoryIcons } from '@/data/navigation'
import type { ScreenName, ChallengeCategory, Challenge } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockChallenges: Challenge[] = [
  { id: 'ch1', title: 'Local Trivia Master', description: 'Answer 10 trivia questions correctly', category: 'trivia', xp: 200, coins: 80, question: 'What is the capital?', options: ['A', 'B', 'C', 'D'], answerIndex: 0 },
  { id: 'ch2', title: 'Photo Safari', description: 'Capture 5 unique landmarks', category: 'photo', xp: 300, coins: 120, photoPrompt: 'Take a photo of a landmark' },
  { id: 'ch3', title: 'Step Champion', description: 'Walk 1000 steps in one adventure', category: 'fitness', xp: 250, coins: 100, targetSteps: 1000 },
  { id: 'ch4', title: 'Compass Expert', description: 'Complete 3 compass challenges', category: 'compass', xp: 220, coins: 90, targetHeading: 0 },
  { id: 'ch5', title: 'Riddle Solver', description: 'Solve 5 riddles', category: 'riddle', xp: 350, coins: 150, riddleText: 'What am I?', riddleAnswer: 'answer' },
  { id: 'ch6', title: 'Speed Demon', description: 'Finish a speed challenge in under 60s', category: 'speed', xp: 400, coins: 200, timeLimitSec: 60 },
  { id: 'ch7', title: 'Deep Explorer', description: 'Explore 3 new areas', category: 'exploration', xp: 180, coins: 70 },
  { id: 'ch8', title: 'Puzzle Pro', description: 'Solve 10 puzzles', category: 'puzzle', xp: 280, coins: 110, question: 'Which is correct?', options: ['A', 'B', 'C'], answerIndex: 1 },
]

async function fetchChallenges(): Promise<Challenge[]> {
  return mockChallenges
}

function ChallengesScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [filter, setFilter] = useState<ChallengeCategory | 'all'>('all')
  const { data, loading } = useCachedData<Challenge[]>('challenges', fetchChallenges)

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const filtered = (data ?? []).filter(c => filter === 'all' || c.category === filter)

  const categories: (ChallengeCategory | 'all')[] = ['all', 'trivia', 'photo', 'fitness', 'compass', 'riddle', 'speed', 'exploration', 'puzzle']

  return (
    <>
      <ScreenShell title="Challenges" subtitle="Test your skills" icon={<Target size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 mb-1">
            <Filter size={14} className="text-ink-400" />
            <p className="section-label mb-0">Filter by type</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={'chip ' + (filter === c ? 'chip-active' : 'chip-inactive')}>
                {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          {/* Challenge list */}
          {loading && !data ? <SkeletonList count={4} /> : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((ch, i) => {
                const CatIcon = categoryIcons[ch.category]
                return (
                  <div key={ch.id} className="card-premium p-4 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center flex-shrink-0">
                        <CatIcon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink-900">{ch.title}</p>
                        <p className="text-xs text-ink-400">{ch.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-brand-600"><Zap size={12} /> {ch.xp} XP</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-accent-600"><Coins size={12} /> {ch.coins}</span>
                      </div>
                      <button onClick={() => push('info', 'Challenge starting', ch.title + ' will begin on your next adventure')} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2">
                        <Play size={14} /> Start
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<Target size={28} />} title="No challenges found" message="Try a different category filter" />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="challenges" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const ChallengesScreen = memo(ChallengesScreenInner)
