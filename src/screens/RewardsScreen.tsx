import { useState, useCallback, memo } from 'react'
import { Gift, Flame, Coins, Zap, Check, Star } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonCard } from '@/components/Skeleton'
import { useCachedData, invalidateCache } from '@/lib/cache'
import { getDailyReward, claimDailyReward } from '@/lib/db'
import type { ScreenName, DailyReward } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const dayRewards = [
  { day: 1, xp: 50, coins: 20, icon: Coins },
  { day: 2, xp: 75, coins: 30, icon: Coins },
  { day: 3, xp: 100, coins: 50, icon: Zap },
  { day: 4, xp: 125, coins: 60, icon: Zap },
  { day: 5, xp: 150, coins: 80, icon: Star },
  { day: 6, xp: 200, coins: 100, icon: Star },
  { day: 7, xp: 300, coins: 150, icon: Gift },
]

function RewardsScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [claiming, setClaiming] = useState(false)
  const { data, loading, refresh } = useCachedData<DailyReward | null>('daily-reward', getDailyReward)

  const today = new Date().toISOString().split('T')[0]
  const canClaim = data ? data.last_claim_date !== today : true
  const currentStreakDay = data ? (canClaim ? data.streak + 1 : data.streak) : 1

  const handleClaim = useCallback(async () => {
    if (!canClaim) return
    setClaiming(true)
    const result = await claimDailyReward()
    setClaiming(false)
    if (result) {
      push('reward', 'Daily Reward Claimed!', '+' + result.xp + ' XP, +' + result.coins + ' coins')
      invalidateCache('daily-reward')
      refresh()
    }
  }, [canClaim, push, refresh])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  return (
    <>
      <ScreenShell title="Rewards" subtitle="Daily check-in" icon={<Gift size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-5">
          {/* Streak banner */}
          {loading && !data ? <SkeletonCard /> : (
            <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-5 text-white shadow-card-hover animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Flame size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{data?.streak ?? 0} Days</p>
                  <p className="text-xs opacity-80">Current streak</p>
                </div>
              </div>
              {canClaim ? (
                <button onClick={handleClaim} disabled={claiming} className="w-full bg-white text-accent-600 rounded-xl py-3 text-sm font-bold btn-press hover:bg-surface-50 transition disabled:opacity-50">
                  {claiming ? 'Claiming...' : 'Claim Today\'s Reward'}
                </button>
              ) : (
                <div className="w-full bg-white/20 rounded-xl py-3 text-sm font-bold text-center">
                  <Check size={16} className="inline mr-1" /> Claimed today - Come back tomorrow!
                </div>
              )}
            </div>
          )}

          {/* 7-day calendar */}
          <div>
            <p className="section-label">7-Day Rewards</p>
            <div className="grid grid-cols-4 gap-2">
              {dayRewards.map((dr, i) => {
                const DayIcon = dr.icon
                const isClaimed = data ? data.streak >= dr.day : false
                const isToday = currentStreakDay === dr.day
                const isClaimable = isToday && canClaim
                return (
                  <div key={dr.day} className={'rounded-xl p-3 border-2 text-center transition animate-fade-in ' + (isClaimed ? 'bg-success-50 border-success-300' : isClaimable ? 'bg-accent-50 border-accent-400 animate-pulse' : 'bg-white border-surface-200')} style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <p className="text-[10px] font-bold text-ink-400 mb-1">Day {dr.day}</p>
                    <div className={'w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1.5 ' + (isClaimed ? 'bg-success-500' : isClaimable ? 'bg-accent-500' : 'bg-surface-200')}>
                      {isClaimed ? <Check size={16} className="text-white" /> : <DayIcon size={16} className={isClaimable ? 'text-white' : 'text-ink-400'} />}
                    </div>
                    <p className="text-[10px] font-bold text-ink-700">+{dr.xp} XP</p>
                    <p className="text-[10px] text-ink-400">+{dr.coins}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div className="card-premium p-4">
            <p className="text-xs text-ink-500">Keep your streak alive by claiming rewards every day. Miss a day and your streak resets! Come back daily for bigger rewards.</p>
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="rewards" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const RewardsScreen = memo(RewardsScreenInner)
