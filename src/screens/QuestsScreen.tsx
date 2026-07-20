import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { DAILY_QUESTS, WEEKLY_QUESTS, getQuestProgress, claimQuestReward } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import type { QuestProgress } from '@/types/adventure'

interface Props { onBack: () => void }

export default function QuestsScreen({ onBack }: Props) {
  const { refreshProfile } = useAuth()
  const [progress, setProgress] = useState<QuestProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    getQuestProgress().then(data => {
      setProgress(data)
      setLoading(false)
    })
  }, [])

  const getQuestProg = (questId: string) => progress.find(p => p.quest_id === questId)
  const isDaily = (key: string) => key.startsWith('daily')

  const handleClaim = async (questId: string, xp: number, coins: number) => {
    setClaiming(questId)
    const { error } = await claimQuestReward(questId, xp, coins)
    setClaiming(null)
    if (!error) {
      refreshProfile()
      getQuestProgress().then(setProgress)
    }
  }

  const renderQuest = (quest: typeof DAILY_QUESTS[0], isWeekly: boolean) => {
    const prog = getQuestProg(quest.key)
    const current = prog?.progress ?? 0
    const claimed = prog?.claimed ?? false
    const isComplete = current >= quest.target

    return (
      <div key={quest.key} className="bg-ink-900 rounded-xl p-4 border border-ink-800">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-semibold text-ink-200">{quest.title}</h3>
          <span className="text-xs text-brand-400">+{quest.xp} XP · +{quest.coins}🪙</span>
        </div>
        <p className="text-xs text-ink-400 mb-3">{quest.desc}</p>
        <div className="flex justify-between text-xs text-ink-500 mb-1">
          <span>Progress</span>
          <span>{Math.min(current, quest.target)}/{quest.target}</span>
        </div>
        <div className="h-2 bg-ink-800 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-success-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, (current / quest.target) * 100)}%` }} />
        </div>
        {isComplete && !claimed && (
          <button
            onClick={() => handleClaim(quest.key, quest.xp, quest.coins)}
            disabled={claiming === quest.key}
            className="w-full py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg text-xs font-semibold transition active:scale-95 disabled:opacity-50"
          >
            {claiming === quest.key ? 'Claiming...' : 'Claim Reward'}
          </button>
        )}
        {claimed && (
          <p className="text-center text-xs text-success-400 font-medium">✓ Claimed</p>
        )}
      </div>
    )
  }

  return (
    <ScreenShell title="Quests" icon="📜" onBack={onBack}>
      {loading ? <LoadingSpinner label="Loading quests..." /> : (
        <>
          <h3 className="text-sm font-semibold text-ink-300 mb-2">Daily Quests</h3>
          <div className="space-y-3 mb-6">
            {DAILY_QUESTS.map(q => renderQuest(q, false))}
          </div>
          <h3 className="text-sm font-semibold text-ink-300 mb-2">Weekly Quests</h3>
          <div className="space-y-3">
            {WEEKLY_QUESTS.map(q => renderQuest(q, true))}
          </div>
        </>
      )}
    </ScreenShell>
  )
}
