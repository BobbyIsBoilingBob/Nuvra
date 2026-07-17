import { useState } from 'react';
import { Icon, GlassCard, Button, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { DAILY_LOGIN_REWARDS } from '../data';

export function DailyRewards(): React.ReactElement {
  const { dailyReward, claimDailyReward } = useStore();
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<Array<{ icon: string; label: string; amount: number; color: string }>>([]);

  const currentDay = dailyReward.claimedToday ? dailyReward.currentStreak : dailyReward.currentStreak + 1;
  const claimableDay = Math.min(currentDay, 7);

  const handleClaim = () => {
    if (dailyReward.claimedToday) return;
    const reward = DAILY_LOGIN_REWARDS[claimableDay - 1];
    if (!reward) return;
    claimDailyReward(reward.coins, reward.gems, reward.xp);
    setRewardData([
      { icon: 'Coins', label: 'Coins', amount: reward.coins, color: 'text-gold-300' },
      ...(reward.gems > 0 ? [{ icon: 'Gem', label: 'Gems', amount: reward.gems, color: 'text-plasma-400' }] : []),
      { icon: 'Zap', label: 'XP', amount: reward.xp, color: 'text-nova-300' },
    ]);
    setShowReward(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#ffcc33" />
      <RewardPopup rewards={rewardData} visible={showReward} onClose={() => setShowReward(false)} />
      <div className="relative z-10">
        <TopBar showBack title="Daily Rewards" />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          <GlassCard className="p-5 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-2xl font-black text-white">{dailyReward.currentStreak} Day Streak</div>
            <p className="text-xs text-white/50 mt-1">Log in every day to keep your streak and earn bigger rewards!</p>
          </GlassCard>

          <div className="grid grid-cols-4 gap-2">
            {DAILY_LOGIN_REWARDS.map((reward, i) => {
              const dayNum = i + 1;
              const isClaimed = dayNum <= dailyReward.currentStreak && dailyReward.claimedToday;
              const isClaimable = dayNum === claimableDay && !dailyReward.claimedToday;
              const isWeekBonus = dayNum === 7;
              return (
                <GlassCard key={dayNum} className={`p-3 flex flex-col items-center gap-1.5 transition-all relative ${isClaimed?'opacity-50':''} ${isClaimable?'ring-2 ring-nova-400 animate-pulse':''} ${isWeekBonus?'col-span-4 flex-row justify-around py-4':''}`}>
                  {isClaimed && <div className="absolute top-1 right-1"><Icon name="CheckCircle" size={14} className="text-nova-300" /></div>}
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isClaimable?'text-nova-300':'text-white/40'}`}>{reward.label}</div>
                  {isWeekBonus ? (
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">🎁</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><Icon name="Coins" size={16} className="text-gold-300" /><span className="text-sm font-black text-white">+{reward.coins}</span></div>
                        <div className="flex items-center gap-1"><Icon name="Gem" size={16} className="text-plasma-400" /><span className="text-sm font-black text-white">+{reward.gems}</span></div>
                        <div className="flex items-center gap-1"><Icon name="Zap" size={16} className="text-nova-300" /><span className="text-sm font-black text-white">+{reward.xp}</span></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl">{dayNum > claimableDay ? '🔒' : '🎁'}</div>
                      <div className="flex items-center gap-1"><Icon name="Coins" size={10} className="text-gold-300" /><span className="text-[10px] font-bold text-white">{reward.coins}</span></div>
                      {reward.gems > 0 && <div className="flex items-center gap-1"><Icon name="Gem" size={10} className="text-plasma-400" /><span className="text-[10px] font-bold text-white">{reward.gems}</span></div>}
                    </>
                  )}
                </GlassCard>
              );
            })}
          </div>

          <Button variant="primary" size="lg" fullWidth icon="Gift" onClick={handleClaim} disabled={dailyReward.claimedToday}>
            {dailyReward.claimedToday ? 'Come Back Tomorrow!' : `Claim Day ${claimableDay} Reward`}
          </Button>
          {dailyReward.claimedToday && <p className="text-xs text-white/40 text-center">You've claimed today's reward. Keep your streak going!</p>}
        </div>
      </div>
    </div>
  );
}
