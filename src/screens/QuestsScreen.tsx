import { useEffect, useState } from 'react'
import { ScrollText, Star, Coins, Check, Lock } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DAILY_QUESTS, WEEKLY_QUESTS, getQuestProgress, claimQuestReward } from '@/lib/db'
import type { QuestProgress } from '@/types/adventure'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function QuestsScreen({ onBack, onToast }: Props) {
  const [progress, setProgress] = useState<QuestProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuestProgress().then(p => { setProgress(p); setLoading(false) })
  }, [])

  const getProgress = (key: string) => progress.find(p => p.quest_id === key)
  const claim = async (quest: typeof DAILY_QUESTS[number]) => {
    const { error } = await claimQuestReward(quest.key, quest.xp, quest.coins)
    onToast(error ? 'error' : 'reward', error ? 'Failed' : 'Quest claimed!', error ?? `+${quest.xp} XP · +${quest.coins} coins`)
    if (!error) { const p = await getQuestProgress(); setProgress(p) }
  }

  const renderQuest = (q: typeof DAILY_QUESTS[number]) => {
    const prog = getProgress(q.key)
    const current = prog?.progress ?? 0
    const claimed = prog?.claimed ?? false
    const complete = current >= q.target
    return (
      <div key={q.key} className="bg-ink-900 border border-ink-800 rounded-xl p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-semibold text-ink-100">{q.title}</p>
            <p className="text-xs text-ink-500 mt-0.5">{q.desc}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-0.5 text-brand-400"><Star size={12} /> {q.xp}</span>
            <span className="flex items-center gap-0.5 text-accent-400"><Coins size={12} /> {q.coins}</span>
          </div>
        </div>
        <div className="h-2 bg-ink-800 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, (current / q.target) * 100)}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-500">{current} / {q.target}</span>
          {claimed ? (
            <span className="text-xs text-success-400 flex items-center gap-1"><Check size={12} /> Claimed</span>
          ) : complete ? (
            <button onClick={() => claim(q)} className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition active:scale-95">Claim</button>
          ) : (
            <span className="text-xs text-ink-600 flex items-center gap-1"><Lock size={12} /> In progress</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <ScreenShell title="Quests" icon={<ScrollText size={18} className="text-brand-400" />} onBack={onBack}>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-ink-200 mb-3">Daily Quests</h3>
            <div className="space-y-2">{DAILY_QUESTS.map(renderQuest)}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-200 mb-3">Weekly Quests</h3>
            <div className="space-y-2">{WEEKLY_QUESTS.map(renderQuest)}</div>
          </div>
        </div>
      )}
    </ScreenShell>
  )
}
