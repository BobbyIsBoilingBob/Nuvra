import { useState } from 'react'
import { Gift, Flame, Star, Coins, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { claimDailyReward } from '@/lib/db'
import { useToasts, ToastContainer } from '@/components/Toast'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'

interface Props { onNavigate: (s: string) => void }
const dailyRewards = [{ day: 1, xp: 50, coins: 20, icon: Star }, { day: 2, xp: 60, coins: 25, icon: Coins }, { day: 3, xp: 70, coins: 30, icon: Gift }, { day: 4, xp: 80, coins: 35, icon: Star }, { day: 5, xp: 90, coins: 40, icon: Coins }, { day: 6, xp: 100, coins: 50, icon: Gift }, { day: 7, xp: 200, coins: 100, icon: Flame }]
export default function RewardsScreen({ onNavigate }: Props) {
  const { profile, refreshProfile } = useAuth()
  const [streak, setStreak] = useState(profile?.walking_streak ?? 0)
  const [claimedToday, setClaimedToday] = useState(false)
  const { toasts, push, dismiss } = useToasts()
  const handleClaim = async () => { if (claimedToday) return; const reward = await claimDailyReward(); if (reward) { setStreak(s => s + 1); setClaimedToday(true); push('reward', '+' + reward.xp + ' XP, +' + reward.coins + ' coins!', 'Daily reward claimed!'); await refreshProfile() } }
  return (
    <>
      <ScreenShell title="Rewards" subtitle="Claim your daily treasures">
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-accent-50 to-brand-50/50 border border-accent-300 rounded-2xl p-4 animate-slide-up"><div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center"><Flame size={24} className="text-white" /></div><div><p className="text-sm font-bold text-ink-900">{streak} Day Streak!</p><p className="text-xs text-ink-500">Keep claiming daily to maintain your streak</p></div></div>{!claimedToday ? <button onClick={handleClaim} className="btn-primary flex items-center justify-center gap-2"><Gift size={18} /> Claim Today's Reward</button> : <div className="bg-success-50 border border-success-300 rounded-xl py-3 flex items-center justify-center gap-2 text-success-700 font-bold text-sm"><Check size={18} /> Claimed! Come back tomorrow</div>}</div>
          <div><h3 className="section-label flex items-center gap-1.5"><Gift size={12} /> 7-Day Rewards</h3><div className="grid grid-cols-4 gap-2.5">{dailyRewards.map((r, i) => { const Icon = r.icon; const isClaimed = i < (streak % 7); const isCurrent = i === (streak % 7); return <div key={r.day} className={'rounded-xl border p-3 text-center stagger ' + (isClaimed ? 'bg-success-50 border-success-300' : isCurrent && !claimedToday ? 'bg-gradient-to-br from-accent-50 to-brand-50 border-accent-400 animate-glow' : 'bg-white border-surface-200')} style={{ animationDelay: i * 30 + 'ms' }}><p className="text-xs font-bold text-ink-400 mb-1">Day {r.day}</p><Icon size={20} className={isClaimed ? 'text-success-500 mx-auto' : 'text-accent-500 mx-auto'} /><p className="text-xs text-ink-500 mt-1">+{r.xp}</p>{isClaimed && <Check size={12} className="text-success-500 mx-auto mt-1" />}</div> })}</div></div>
          <div><h3 className="section-label">Achievements Preview</h3><button onClick={() => onNavigate('profile')} className="w-full card-premium p-4 text-left btn-press"><p className="text-sm font-bold text-ink-900">View All Achievements</p><p className="text-xs text-ink-400 mt-0.5">See your unlocked and locked achievements</p></button></div>
        </div>
      </ScreenShell>
      <BottomNav active="rewards" onNavigate={onNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
