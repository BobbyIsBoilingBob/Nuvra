import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { DAILY_REWARDS } from '../data';

export function DailyRewards() {
  const { lastDailyRewardDay, lastDailyRewardDate, dailyRewardStreak, claimDailyReward } = useStore();
  const { profile, updateProfile } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const alreadyClaimedToday = lastDailyRewardDate === today;
  const currentDay = alreadyClaimedToday ? (lastDailyRewardDay ?? 0) : Math.min(dailyRewardStreak + 1, 7);

  async function handleClaim(day: number) {
    const reward = DAILY_REWARDS.find(r => r.day === day);
    if (!reward || !profile || alreadyClaimedToday) return;
    claimDailyReward(day);
    await updateProfile({
      coins: (profile.coins ?? 0) + reward.coins,
      gems: (profile.gems ?? 0) + reward.gems,
    });
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fbbf24" />
      <TopBar title="Daily Rewards" showCurrencies />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5 text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-lg font-display font-bold text-white">{dailyRewardStreak}-Day Streak</h2>
          <p className="text-xs text-white/40 mt-1">
            {alreadyClaimedToday ? 'Come back tomorrow for more rewards!' : 'Claim today\'s reward and keep your streak alive!'}
          </p>
        </GlassCard>

        <div className="space-y-2">
          {DAILY_REWARDS.map(reward => {
            const isClaimed = (lastDailyRewardDay ?? 0) >= reward.day && alreadyClaimedToday && reward.day <= currentDay;
            const isCurrent = reward.day === currentDay && !alreadyClaimedToday;
            const isLocked = reward.day > currentDay;
            return (
              <GlassCard key={reward.day} className={`p-4 flex items-center gap-3 ${isCurrent ? 'ring-2 ring-zeviqo-400/40' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isClaimed ? 'bg-zeviqo-500/20' : 'glass'}`}>
                  {isClaimed ? (
                    <Icon name="CheckCircle" size={24} className="text-zeviqo-400" />
                  ) : (
                    <span className="text-lg font-bold text-white/60">{reward.day}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Day {reward.day}</p>
                  <div className="flex gap-1.5 mt-1">
                    <Pill icon="Coins" accent="text-gold-400 border-gold-500/30">+{reward.coins}</Pill>
                    {reward.gems > 0 && <Pill icon="Gem" accent="text-zeviqo-300 border-zeviqo-500/30">+{reward.gems}</Pill>}
                  </div>
                </div>
                {isClaimed && <Pill accent="text-zeviqo-300 border-zeviqo-500/30">Claimed</Pill>}
                {isCurrent && (
                  <Button size="sm" variant="gold" icon="Gift" onClick={() => handleClaim(reward.day)}>Claim</Button>
                )}
                {isLocked && <Icon name="Lock" size={16} className="text-white/30" />}
              </GlassCard>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
