import { useEffect, useState } from 'react'
import { Gift, Flame, Check } from 'lucide-react'
import { getDailyReward, claimDailyReward } from '@/lib/db'
import type { DailyReward } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useToasts, ToastContainer } from '@/components/Toast'

const DAY_REWARDS = [50, 60, 70, 80, 100, 120, 150]

export default function RewardsScreen() {
  const [reward, setReward] = useState<DailyReward | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const load = async () => { const r = await getDailyReward(); setReward(r); setLoading(false) }
  useEffect(() => { load() }, [])

  const today = new Date().toISOString().split('T')[0]
  const claimedToday = reward?.last_claim_date === today
  const streak = reward?.current_streak || 0

  const handleClaim = async () => {
    setClaiming(true)
    const res = await claimDailyReward()
    setClaiming(false)
    if (res.success) { push('reward', 'Reward Claimed!', `+${res.coins} coins, ${res.streak} day streak`); load() }
    else if (res.error) push('error', 'Cannot claim', res.error)
  }

  return (
    <>
      <ScreenShell title="Rewards" subtitle="Daily bonuses">
        {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : (
          <div className="space-y-5">
            <div className="card-premium p-6 text-center bg-gradient-to-br from-brand-500/10 to-accent-500/10">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-3"><Gift className="text-white" size={28} /></div>
              <p className="text-sm text-ink-400 mb-1">Today's Reward</p>
              <p className="text-2xl font-bold gradient-text mb-4">{DAY_REWARDS[(streak % 7)] || 50} coins</p>
              <button onClick={handleClaim} disabled={claiming || claimedToday} className={`px-6 py-3 rounded-xl text-sm font-bold btn-press ${claimedToday ? 'bg-surface-200 text-ink-600' : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white'}`}>
                {claimedToday ? <span className="flex items-center gap-1.5"><Check size={16} /> Claimed</span> : 'Claim Reward'}
              </button>
            </div>

            <div className="card-premium p-4">
              <div className="flex items-center gap-2 mb-3"><Flame size={16} className="text-accent-400" /><p className="text-sm font-bold text-ink-100">Streak: {streak} days</p></div>
              <div className="grid grid-cols-7 gap-1.5">
                {DAY_REWARDS.map((amt, i) => {
                  const dayClaimed = i < streak
                  const isToday = i === streak && !claimedToday
                  return (
                    <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center ${dayClaimed ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white' : isToday ? 'bg-accent-500/20 border border-accent-500/50' : 'bg-surface-200 text-ink-600'}`}>
                      <span className="text-xs font-bold">{amt}</span>
                      <span className="text-[10px] opacity-80">D{i + 1}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
