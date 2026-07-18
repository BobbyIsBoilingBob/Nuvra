import { useAuth } from '../lib/auth';
import { DAILY_REWARDS } from '../data';
import { Card, Screen, Button, Badge } from '../components/ui';
import { Gift, Coins, Gem, Check } from 'lucide-react';
import { useState } from 'react';

export default function DailyRewards() {
  const { profile, updateProfile } = useAuth();
  const [claiming, setClaiming] = useState<number | null>(null);
  const lastClaimedDay = profile?.last_reward_day ?? 0;
  const today = Math.floor(Date.now() / 86400000);
  const canClaim = today > lastClaimedDay;
  const currentStreak = profile?.daily_streak ?? 0;
  const handleClaim = async (day: number) => {
    if (!canClaim || claiming !== null) return;
    setClaiming(day);
    const reward = DAILY_REWARDS.find((r) => r.day === day) ?? DAILY_REWARDS[0];
    const newStreak = day === 1 ? 1 : currentStreak + 1;
    await updateProfile({ coins: (profile?.coins ?? 0) + reward.coins, gems: (profile?.gems ?? 0) + reward.gems, last_reward_day: today, daily_streak: newStreak });
    setClaiming(null);
  };
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Daily Rewards</h1>
      <p className="text-ink-400 text-sm mb-4">Current streak: {currentStreak} days</p>
      <div className="grid grid-cols-2 gap-3">
        {DAILY_REWARDS.map((r) => {
          const claimed = r.day <= lastClaimedDay;
          const isToday = r.day === lastClaimedDay + 1;
          return (
            <Card key={r.day} className={`p-4 ${isToday && canClaim ? 'border-zeviqo-500/50' : ''}`}>
              <div className="flex items-center justify-between mb-2"><span className="text-ink-400 text-xs">Day {r.day}</span>{claimed && <Check size={16} color="#22c55e" />}</div>
              <div className="flex items-center gap-2 mb-3">
                <Badge color="#fbbf24"><Coins size={12} className="inline" /> {r.coins}</Badge>
                {r.gems > 0 && <Badge color="#a78bfa"><Gem size={12} className="inline" /> {r.gems}</Badge>}
              </div>
              <Button size="sm" variant={isToday && canClaim ? 'primary' : 'secondary'} className="w-full" disabled={claimed || !canClaim || !isToday} onClick={() => handleClaim(r.day)}>{claimed ? 'Claimed' : isToday && canClaim ? 'Claim' : 'Locked'}</Button>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}
