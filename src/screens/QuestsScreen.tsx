import { useEffect, useState } from 'react'
import { ScrollText, Check, Gift } from 'lucide-react'
import { getQuestProgress, claimQuestReward, DAILY_QUESTS, WEEKLY_QUESTS } from '@/lib/db'
import type { QuestProgress } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { useToasts, ToastContainer } from '@/components/Toast'

export default function QuestsScreen() {
  const [progress, setProgress] = useState<QuestProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { toasts, push, dismiss } = useToasts()

  useEffect(() => { (async () => { const p = await getQuestProgress(); setProgress(p || []); setLoading(false) })() }, [])

  const getProgress = (key: string) => progress.find(p => p.quest_id === key)
  const claim = async (key: string, xp: number, coins: number) => {
    const { error } = await claimQuestReward(key, xp, coins)
    if (error) { push('error', 'Failed', error); return }
    push('reward', 'Quest Complete!', `+${xp} XP, +${coins} coins`)
    const p = await getQuestProgress(); setProgress(p || [])
  }

  const renderQuest = (q: typeof DAILY_QUESTS[0], i: number) => {
    const prog = getProgress(q.key)
    const current = prog?.progress || 0
    const claimed = prog?.claimed || false
    const complete = current >= q.target
    const pct = Math.min(100, (current / q.target) * 100)
    return (
      <div key={q.key} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 60}ms` }}>
        <div className="flex items-start justify-between mb-2">
          <div><p className="text-sm font-bold text-ink-100">{q.title}</p><p className="text-xs text-ink-500">{q.desc}</p></div>
          {claimed ? <Check className="text-brand-400" size={18} /> : complete ? <Gift className="text-accent-400 animate-pulse" size={18} /> : null}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
          <span className="text-xs text-ink-500 font-medium">{current}/{q.target}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs"><span className="text-accent-400">+{q.xp} XP</span><span className="text-amber-400">+{q.coins} coins</span></div>
          <button onClick={() => claim(q.key, q.xp, q.coins)} disabled={!complete || claimed} className={`px-3 py-1.5 rounded-lg text-xs font-bold btn-press ${complete && !claimed ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white' : 'bg-surface-200 text-ink-600'}`}>{claimed ? 'Claimed' : complete ? 'Claim' : 'In Progress'}</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ScreenShell title="Quests" subtitle="Daily and weekly challenges">
        {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : (
          <div className="space-y-6">
            <div><h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ScrollText size={14} /> Daily Quests</h3><div className="space-y-2">{DAILY_QUESTS.map(renderQuest)}</div></div>
            <div><h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ScrollText size={14} /> Weekly Quests</h3><div className="space-y-2">{WEEKLY_QUESTS.map(renderQuest)}</div></div>
          </div>
        )}
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
