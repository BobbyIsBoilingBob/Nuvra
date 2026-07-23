import { useState, useCallback, memo } from 'react'
import { ScrollText, Zap, Coins, Clock, Check, Gift } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import type { ScreenName, Quest } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockQuests: Quest[] = [
  { id: 'q1', title: 'Daily Walk', description: 'Complete one adventure today', progress: 0, target: 1, xp: 100, coins: 50, type: 'daily', expires_at: new Date(Date.now() + 86400000).toISOString() },
  { id: 'q2', title: 'Weekly Explorer', description: 'Complete 5 adventures this week', progress: 2, target: 5, xp: 500, coins: 200, type: 'weekly', expires_at: new Date(Date.now() + 604800000).toISOString() },
  { id: 'q3', title: 'Trivia Master', description: 'Answer 20 trivia questions', progress: 12, target: 20, xp: 300, coins: 120, type: 'achievement' },
  { id: 'q4', title: 'Photo Collector', description: 'Complete 10 photo challenges', progress: 7, target: 10, xp: 250, coins: 100, type: 'achievement' },
  { id: 'q5', title: 'Streak Keeper', description: 'Walk 7 days in a row', progress: 5, target: 7, xp: 400, coins: 150, type: 'streak' },
  { id: 'q6', title: 'Speed Runner', description: 'Finish 3 speed challenges', progress: 1, target: 3, xp: 350, coins: 140, type: 'achievement' },
]

async function fetchQuests(): Promise<Quest[]> {
  return mockQuests
}

const questTypeColors: Record<string, string> = {
  daily: 'bg-brand-50 text-brand-600 border-brand-200',
  weekly: 'bg-accent-50 text-accent-600 border-accent-200',
  achievement: 'bg-success-50 text-success-600 border-success-200',
  streak: 'bg-warning-50 text-warning-600 border-warning-200',
}

function QuestCard({ quest, onComplete }: { quest: Quest; onComplete: (q: Quest) => void }) {
  const pct = Math.min((quest.progress / quest.target) * 100, 100)
  const isComplete = quest.progress >= quest.target
  return (
    <div className="card-premium p-4 animate-fade-in">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center flex-shrink-0">
          <ScrollText size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-ink-900">{quest.title}</p>
            <span className={'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ' + (questTypeColors[quest.type] ?? 'bg-surface-100 text-ink-500 border-surface-200')}>{quest.type}</span>
          </div>
          <p className="text-xs text-ink-400">{quest.description}</p>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-ink-700">{quest.progress} / {quest.target}</span>
          <span className="text-xs text-ink-400">{Math.round(pct)}%</span>
        </div>
        <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
          <div className={'h-full rounded-full transition-all duration-500 ' + (isComplete ? 'bg-gradient-to-r from-success-500 to-success-600' : 'bg-gradient-to-r from-brand-500 to-brand-600')} style={{ width: pct + '%' }} />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-surface-200">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold text-brand-600"><Zap size={12} /> {quest.xp} XP</span>
          <span className="flex items-center gap-1 text-xs font-bold text-accent-600"><Coins size={12} /> {quest.coins}</span>
          {quest.expires_at && <span className="flex items-center gap-1 text-xs text-ink-400"><Clock size={12} /> {new Date(quest.expires_at).toLocaleDateString()}</span>}
        </div>
        {isComplete ? (
          <button onClick={() => onComplete(quest)} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2"><Gift size={14} /> Claim</button>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-ink-400"><Check size={12} /> In progress</span>
        )}
      </div>
    </div>
  )
}

function QuestsScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const { data, loading } = useCachedData<Quest[]>('quests', fetchQuests)

  const handleComplete = useCallback((q: Quest) => {
    push('reward', 'Quest complete!', '+' + q.xp + ' XP, +' + q.coins + ' coins')
  }, [push])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  return (
    <>
      <ScreenShell title="Quests" subtitle="Complete for rewards" icon={<ScrollText size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          {loading && !data ? <SkeletonList count={4} /> : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((q, i) => <QuestCard key={q.id} quest={q} onComplete={handleComplete} />)}
            </div>
          ) : (
            <EmptyState icon={<ScrollText size={28} />} title="No quests available" message="Check back later for new quests" />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="quests" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const QuestsScreen = memo(QuestsScreenInner)
