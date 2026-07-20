import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getDailyReward, claimDailyReward } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import type { DailyReward } from '@/types/adventure'

interface Props { onBack: () => void }

export default function RewardsScreen({ onBack }: Props) {
  const { profile, refreshProfile } = useAuth()
  const [reward, setReward] = useState<DailyReward | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getDailyReward().then(r => {
      setReward(r)
      setLoading(false)
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const alreadyClaimed = reward?.last_claim_date === today

  const handleClaim = async () => {
    setClaiming(true)
    const result = await claimDailyReward()
    setClaiming(false)
    if (result.success) {
      setMessage(`Claimed ${result.coins} coins! Streak: ${result.streak} days 🔥`)
      refreshProfile()
      getDailyReward().then(setReward)
    } else {
      setMessage(result.error || 'Failed to claim')
    }
  }

  const streak = reward?.current_streak ?? 0
  const dayRewards = [50, 60, 70, 80, 90, 100, 150]

  return (
    <ScreenShell title="Rewards" icon="🎁" onBack={onBack}>
      <div className="bg-gradient-to-br from-accent-500/20 to-accent-700/10 rounded-2xl p-5 border border-accent-500/20 mb-4 text-center">
        <div className="text-5xl mb-3">🎁</div>
        <h2 className="text-lg font-bold text-ink-100 mb-1">Daily Reward</h2>
        <p className="text-sm text-ink-400 mb-4">Come back every day to increase your streak!</p>
        <p className="text-3xl font-bold text-accent-400 mb-1">🔥 {streak} days</p>
        <p className="text-xs text-ink-500">Current streak</p>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayRewards.map((r, i) => {
          const dayNum = i + 1
          const isClaimed = streak >= dayNum
          const isToday = streak + 1 === dayNum && !alreadyClaimed
          return (
            <div key={i} className={`rounded-xl p-2 text-center border ${
              isClaimed ? 'bg-success-500/10 border-success-500/30' :
              isToday ? 'bg-brand-500/20 border-brand-500/50' :
              'bg-ink-900 border-ink-800'
            }`}>
              <p className="text-xs text-ink-500 mb-1">Day {dayNum}</p>
              <p className="text-sm font-bold text-ink-200">{r}</p>
              <p className="text-xs text-ink-500">🪙</p>
            </div>
          )
        })}
      </div>

      {loading ? <LoadingSpinner /> :
        alreadyClaimed ? (
          <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
            <p className="text-sm text-ink-400">✓ Claimed today! Come back tomorrow.</p>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : 'Claim Today\'s Reward'}
          </button>
        )
      }

      {message && (
        <div className="mt-3 bg-success-500/10 border border-success-500/30 rounded-xl p-3 text-center animate-pop">
          <p className="text-sm text-success-400 font-semibold">{message}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Your Balance</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
            <p className="text-2xl font-bold text-accent-400">🪙 {profile?.coins ?? 0}</p>
            <p className="text-xs text-ink-500 mt-1">Coins</p>
          </div>
          <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
            <p className="text-2xl font-bold text-purple-400">💎 {profile?.gems ?? 0}</p>
            <p className="text-xs text-ink-500 mt-1">Gems</p>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
