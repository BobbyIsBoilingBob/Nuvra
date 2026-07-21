import { useEffect, useState } from 'react'
import { Gift, Flame, Coins, Check } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getDailyReward, claimDailyReward } from '@/lib/db'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

const REWARD_DAYS = [50, 60, 70, 80, 90, 100, 150]

export default function RewardsScreen({ onBack, onToast }: Props) {
  const [streak, setStreak] = useState(0)
  const [totalClaimed, setTotalClaimed] = useState(0)
  const [claimedToday, setClaimedToday] = useState(false)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  const load = async () => {
    const r = await getDailyReward()
    if (r) {
      setStreak(r.current_streak)
      setTotalClaimed(r.total_claimed)
      setClaimedToday(r.last_claim_date === new Date().toISOString().split('T')[0])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleClaim = async () => {
    setClaiming(true)
    const result = await claimDailyReward()
    setClaiming(false)
    if (result.success) {
      setClaimedToday(true)
      setStreak(result.streak)
      setTotalClaimed(t => t + 1)
      onToast('reward', 'Reward claimed!', `+${result.coins} coins · ${result.streak} day streak`)
    } else {
      onToast('error', 'Cannot claim', result.error ?? undefined)
    }
  }

  if (loading) return <ScreenShell title="Rewards" icon={<Gift size={18} className="text-brand-400" />} onBack={onBack}><LoadingSpinner /></ScreenShell>

  return (
    <ScreenShell title="Rewards" icon={<Gift size={18} className="text-brand-400" />} onBack={onBack}>
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-accent-500/20 to-brand-500/10 border border-accent-500/30 rounded-2xl p-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-500/20 border border-accent-500/30 mb-3">
            <Flame size={28} className="text-accent-400" />
          </div>
          <p className="text-3xl font-bold text-ink-100">{streak}</p>
          <p className="text-sm text-ink-400">day streak</p>
          <p className="text-xs text-ink-500 mt-2">{totalClaimed} total rewards claimed</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-200 mb-3">Weekly Rewards</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {REWARD_DAYS.map((reward, i) => {
              const dayNum = i + 1
              const isClaimed = streak > i || (streak === i && claimedToday)
              const isToday = streak === i && !claimedToday
              return (
                <div key={i} className={`rounded-lg p-2 text-center border ${isClaimed ? 'bg-success-500/20 border-success-500/40' : isToday ? 'bg-brand-500/20 border-brand-500/40' : 'bg-ink-900 border-ink-800'}`}>
                  <p className="text-xs text-ink-500 mb-1">Day {dayNum}</p>
                  <div className="flex items-center justify-center">
                    {isClaimed ? <Check size={14} className="text-success-400" /> : <Coins size={14} className="text-ink-500" />}
                  </div>
                  <p className="text-xs font-semibold text-ink-300 mt-1">{reward}</p>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={handleClaim} disabled={claiming || claimedToday}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
          {claiming ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Claiming...</> :
           claimedToday ? <><Check size={18} /> Claimed Today</> : <><Gift size={18} /> Claim Daily Reward</>}
        </button>
      </div>
    </ScreenShell>
  )
}
