import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { DAILY_REWARDS } from '../data';
import { vibrate } from '../lib/settings';

export function DailyRewards() {
  const { lastDailyRewardDay, lastDailyRewardDate, dailyRewardStreak, claimDailyReward } = useStore();
  const { profile, updateProfile } = useAuth();
  const [claimed, setClaimed] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const alreadyClaimedToday = lastDailyRewardDate === today;

  const canClaimDay = (day: number): boolean => {
    if (alreadyClaimedToday) return false;
    if (lastDailyRewardDay === null) return day === 1;
    return day === ((lastDailyRewardDay % 7) + 1);
  };

  const handleClaim = async (day: number) => {
    if (!canClaimDay(day) || !profile) return;
    vibrate([20, 40, 20]);
    const reward = DAILY_REWARDS.find(r => r.day === day)!;
    await updateProfile({
      xp: profile.xp + reward.xp,
      coins: profile.coins + reward.coins,
      level: Math.floor(Math.sqrt((profile.xp + reward.xp) / 100)) + 1
    });
    claimDailyReward(day);
    setClaimed(day);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#f5b800" />
      <TopBar title="Daily Rewards" showBack />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-ember-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="Gift" size={28} className="text-ink-950" />
          </div>
          <h2 className="text-base font-display font-bold text-white">Daily Rewards</h2>
          <p className="text-xs text-white/40 mt-1">Claim a reward every day! Come back tomorrow for more.</p>
          <p className="text-xs text-gold-300 font-bold mt-2">Current streak: {dailyRewardStreak} days</p>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          {DAILY_REWARDS.map(r => {
            const canClaim = canClaimDay(r.day);
            const isClaimed = lastDailyRewardDay !== null && r.day <= (lastDailyRewardDay % 7 || 7) && lastDailyRewardDate !== today;
            return (
              <GlassCard key={r.day} className={`p-4 animate-slide-up ${canClaim ? 'border-gold-500/30 shimmer-bg' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-white/40">DAY {r.day}</span>
                  {r.day === 7 && <Icon name="Crown" size={14} className="text-gold-400" />}
                </div>
                <div className="flex flex-col gap-1.5 my-2">
                  <span className="flex items-center gap-1 text-xs text-gold-300"><Icon name="Coins" size={12} />{r.coins}</span>
                  <span className="flex items-center gap-1 text-xs text-zeviqo-300"><Icon name="Zap" size={12} />{r.xp} XP</span>
                  {r.gems > 0 && <span className="flex items-center gap-1 text-xs text-cyan-300"><Icon name="Gem" size={12} />{r.gems}</span>}
                  {r.item && <span className="text-[10px] text-plasma-300 font-bold">{r.item}</span>}
                </div>
                <Button size="sm" fullWidth variant={canClaim ? 'primary' : 'ghost'} disabled={!canClaim} onClick={() => handleClaim(r.day)}>
                  {canClaim ? 'Claim' : alreadyClaimedToday ? 'Claimed' : 'Locked'}
                </Button>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <RewardPopup
        visible={claimed !== null}
        onClose={() => setClaimed(null)}
        rewards={claimed ? [
          { icon: 'Coins', label: 'Coins', amount: DAILY_REWARDS.find(r => r.day === claimed)?.coins ?? 0, color: 'text-gold-400' },
          { icon: 'Zap', label: 'XP', amount: DAILY_REWARDS.find(r => r.day === claimed)?.xp ?? 0, color: 'text-zeviqo-400' }
        ] : []}
      />
    </div>
  );
}
