import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { DAILY_REWARDS } from '../data';

export function DailyRewards() {
  const { lastDailyRewardDay, lastDailyRewardDate, dailyRewardStreak, claimDailyReward } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const claimedToday = lastDailyRewardDate === today;
  const currentDay = claimedToday ? (lastDailyRewardDay ?? 0) : (dailyRewardStreak % 7) + 1;

  function handleClaim(day: number) {
    if (claimedToday) return;
    claimDailyReward(day);
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fbbf24" />
      <TopBar title="Daily Rewards" showBack showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 text-center">
          <Icon name="Gift" size={32} className="text-gold-400 mx-auto mb-2" />
          <h2 className="text-lg font-display font-bold text-white">{dailyRewardStreak}-Day Streak!</h2>
          <p className="text-xs text-white/40">Claim your daily reward and keep the streak alive.</p>
        </GlassCard>
        <div className="space-y-2">
          {DAILY_REWARDS.map(r => {
            const claimed = lastDailyRewardDay !== null && lastDailyRewardDay >= r.day && claimedToday;
            const isCurrent = r.day === currentDay && !claimedToday;
            const canClaim = isCurrent;
            return (
              <GlassCard key={r.day} className={`p-3 flex items-center gap-3 ${canClaim ? 'border-gold-500/40 animate-pulse-ring' : ''}`}>
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Icon name={r.icon} size={18} className="text-gold-400" /></div>
                <div className="flex-1"><p className="text-xs font-bold text-white">Day {r.day}</p><p className="text-[10px] text-white/40">{r.coins} coins{r.gems > 0 ? ` + ${r.gems} gems` : ''}</p></div>
                {claimed ? <Pill accent="text-emerald-300 border-emerald-500/30">Claimed</Pill> : canClaim ? <Button size="sm" onClick={() => handleClaim(r.day)}>Claim</Button> : <Pill accent="text-white/30 border-white/10">Locked</Pill>}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
