import { useEffect, useState } from 'react'
import { Flame, Gift, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getDailyReward, claimDailyReward } from '@/lib/db'
import type { DailyReward } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useToasts, ToastContainer } from '@/components/Toast'

const DAY_REWARDS = [
  { day: 1, coins: 50, xp: 10 }, { day: 2, coins: 75, xp: 15 }, { day: 3, coins: 100, xp: 20 },
  { day: 4, coins: 150, xp: 25 }, { day: 5, coins: 200, xp: 30 }, { day: 6, coins: 300, xp: 40 },
  { day: 7, coins: 500, xp: 100 },
]

export default function RewardsScreen() {
  const { profile, refreshProfile } = useAuth()
  const [status, setStatus] = useState<DailyReward | null>(null)
  const [loading, setLoading] = useState(true)
  const { toasts, push, dismiss } = useToasts()

  useEffect(() => {
    (async () => {
      const s = await getDailyReward()
      setStatus(s); setLoading(false)
    })()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const claimedToday = status?.last_claim_date === today
  const currentDay = status ? Math.min(7, status.current_streak + (claimedToday ? 0 : 1)) : 1

  const handleClaim = async () => {
    if (claimedToday) return
    const result = await claimDailyReward()
    if (result.success) {
      setStatus(prev => prev ? { ...prev, last_claim_date: today, current_streak: result.streak } : prev)
      push('reward', `+${result.coins} coins!`, `Day ${result.streak} streak`)
      refreshProfile()
    } else {
      push('error', 'Failed', result.error || 'Already claimed')
    }
  }

  if (loading) return <ScreenShell title="Rewards" subtitle="Daily rewards"><div className="flex justify-center py-20"><LoadingSpinner /></div></ScreenShell>

  return (
    <>
      <ScreenShell title="Rewards" subtitle="Daily login bonuses">
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-accent-500/15 to-brand-500/10 border border-accent-500/20 rounded-2xl p-5 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-glow-accent mb-3"><Flame size={32} className="text-white" /></div>
            <p className="text-sm text-ink-400">Current Streak</p>
            <p className="text-3xl font-extrabold text-ink-100">{profile?.walking_streak ?? 0} <span className="text-lg text-ink-400">days</span></p>
            <button onClick={handleClaim} disabled={claimedToday} className={`mt-4 px-6 py-3 rounded-xl font-bold text-sm btn-press ${claimedToday ? 'bg-surface-200 text-ink-500' : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-glow-accent'}`}>
              {claimedToday ? <span className="flex items-center gap-1.5"><Check size={16} /> Claimed Today</span> : 'Claim Today\'s Reward'}
            </button>
          </div>

          <div>
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Gift size={12} /> Weekly Rewards</h3>
            <div className="grid grid-cols-4 gap-2.5">
              {DAY_REWARDS.map((r, i) => {
                const claimed = status ? status.current_streak > r.day || (status.current_streak === r.day && claimedToday) : false
                const isToday = currentDay === r.day
                return (
                  <div key={r.day} className={`rounded-xl border p-3 text-center stagger ${r.day === 7 ? 'col-span-4' : ''} ${isToday ? 'bg-gradient-to-br from-brand-500/20 to-accent-500/10 border-brand-500/40' : claimed ? 'bg-surface-100 border-success-500/20' : 'bg-surface-100 border-white/[0.04]'}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <p className="text-xs text-ink-500 mb-1">Day {r.day}</p>
                    {claimed ? <Check size={20} className="text-success-400 mx-auto" /> : <Gift size={20} className={isToday ? 'text-brand-400 mx-auto' : 'text-ink-600 mx-auto'} />}
                    <p className="text-xs font-bold text-accent-400 mt-1">{r.coins}</p>
                    <p className="text-[10px] text-ink-500">+{r.xp} XP</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
