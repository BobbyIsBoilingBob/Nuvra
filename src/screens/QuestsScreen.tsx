import { useEffect, useState } from 'react'
import { Target, Calendar, CircleCheck as CheckCircle2, Circle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getQuestProgress, claimQuestReward, DAILY_QUESTS, WEEKLY_QUESTS } from '@/lib/db'
import type { QuestProgress as QP } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { useToasts, ToastContainer } from '@/components/Toast'

export default function QuestsScreen() {
  const { refreshProfile } = useAuth()
  const [progress, setProgress] = useState<QP[]>([])
  const [loading, setLoading] = useState(true)
  const { toasts, push, dismiss } = useToasts()

  useEffect(() => {
    (async () => {
      const q = await getQuestProgress()
      setProgress(q || []); setLoading(false)
    })()
  }, [])

  const getProg = (key: string) => progress.find(p => p.quest_id === key)
  const handleClaim = async (qid: string, xp: number, coins: number) => {
    const { error } = await claimQuestReward(qid, xp, coins)
    if (error) { push('error', 'Failed', error); return }
    setProgress(prev => prev.map(x => x.quest_id === qid ? { ...x, claimed: true } : x))
    push('reward', `+${xp} XP, +${coins} coins!`)
    refreshProfile()
  }

  const renderQuest = (q: typeof DAILY_QUESTS[0], i: number) => {
    const p = getProg(q.key)
    const prog = p?.progress ?? 0
    const claimed = p?.claimed ?? false
    const pct = Math.min(100, (prog / q.target) * 100)
    const done = prog >= q.target
    return (
      <div key={q.key} className="bg-surface-100 border border-white/[0.04] rounded-xl p-3.5 stagger" style={{ animationDelay: `${i * 40}ms` }}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1"><p className="text-sm font-semibold text-ink-100">{q.title}</p><p className="text-xs text-ink-500 mt-0.5">{q.desc}</p></div>
          {done && !claimed ? <button onClick={() => handleClaim(q.key, q.xp, q.coins)} className="px-3 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg text-xs font-bold btn-press">Claim</button>
            : claimed ? <CheckCircle2 size={18} className="text-success-400" /> : <Circle size={18} className="text-ink-600" />}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-surface-300 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-gradient-to-r from-success-500 to-success-600' : 'bg-gradient-to-r from-brand-500 to-brand-400'}`} style={{ width: `${pct}%` }} /></div>
          <span className="text-xs text-ink-400 tabular-nums">{prog}/{q.target}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-ink-500">
          <span className="text-brand-400">+{q.xp} XP</span><span className="text-accent-400">+{q.coins} coins</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <ScreenShell title="Quests" subtitle="Daily & weekly missions">
        {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Calendar size={12} /> Daily Quests</h3>
              <div className="space-y-2.5">{DAILY_QUESTS.map(renderQuest)}</div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Target size={12} /> Weekly Quests</h3>
              <div className="space-y-2.5">{WEEKLY_QUESTS.map(renderQuest)}</div>
            </div>
          </div>
        )}
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
