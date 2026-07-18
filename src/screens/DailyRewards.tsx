import { useStore } from '../store';
import { DAILY_REWARDS } from '../data';
import { useAuth } from '../lib/auth';
import { Card, Screen, Button, Badge, getIcon } from '../components/ui';
import { Coins, Gem, Check, Flame } from 'lucide-react';

export default function DailyRewards() {
  const { lastDailyRewardDay, lastDailyRewardDate, dailyRewardStreak, claimDailyReward, setScreen } = useStore();
  const { profile, updateProfile } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const alreadyClaimed = lastDailyRewardDate === today;

  const handleClaim = async (day: number) => {
    if (alreadyClaimed) return;
    const reward = DAILY_REWARDS.find(r => r.day === day);
    if (!reward || !profile) return;
    claimDailyReward(day);
    await updateProfile({ coins: profile.coins + reward.coins, gems: profile.gems + reward.gems });
  };

  const currentDay = alreadyClaimed ? (lastDailyRewardDay ?? 0) + 1 : dailyRewardStreak + 1;
  const claimableDay = Math.min(7, currentDay);

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Daily Rewards</h1>
      <p className="text-ink-400 mb-4">Log in every day to earn more rewards!</p>
      <Card className="p-4 mb-4 flex items-center gap-3">
        <Flame size={24} color="#f97316" />
        <div>
          <p className="text-white font-semibold">{dailyRewardStreak} day streak</p>
          <p className="text-ink-400 text-sm">{alreadyClaimed ? 'Come back tomorrow!' : "Claim today's reward!"}</p>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {DAILY_REWARDS.map(reward => {
          const isClaimed = lastDailyRewardDay === reward.day && alreadyClaimed;
          const isClaimable = reward.day === claimableDay && !alreadyClaimed;
          const isFuture = reward.day > claimableDay;
          const Icon = getIcon(reward.icon);
          return (
            <Card key={reward.day} className={`p-4 ${isClaimable ? 'border-zeviqo-500/50 animate-pulse' : ''} ${isFuture ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-2"><span className="text-ink-400 text-xs">Day {reward.day}</span>{isClaimed && <Check size={16} color="#22c55e" />}</div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-ink-700/50 flex items-center justify-center"><Icon size={24} color={reward.gems > 0 ? '#a78bfa' : '#fbbf24'} /></div>
                <div className="flex gap-2">
                  {reward.coins > 0 && <Badge color="#fbbf24"><Coins size={10} className="inline" /> {reward.coins}</Badge>}
                  {reward.gems > 0 && <Badge color="#a78bfa"><Gem size={10} className="inline" /> {reward.gems}</Badge>}
                </div>
                {isClaimable && <Button size="sm" variant="gold" onClick={() => handleClaim(reward.day)}>Claim</Button>}
              </div>
            </Card>
          );
        })}
      </div>
      <Button variant="ghost" className="w-full mt-4" onClick={() => setScreen('home')}>Back to Home</Button>
    </Screen>
  );
}
