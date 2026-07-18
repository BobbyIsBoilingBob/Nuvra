import { useStore } from '../store';
import { DAILY_REWARDS } from '../data';
import { Card, Screen, Badge } from '../components/ui';
import { Coins, Gem, Crown, Calendar } from 'lucide-react';
import { getIcon } from '../components/ui';

export default function Rewards() {
  const { dailyRewardStreak, lastDailyRewardDay, setScreen } = useStore();

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Calendar size={24} color="#fbbf24" /> Rewards
      </h1>

      <Card className="p-4 mb-4 text-center">
        <div className="text-4xl mb-2">🎁</div>
        <p className="text-white font-semibold text-lg">{dailyRewardStreak} day streak</p>
        <p className="text-ink-400 text-sm">Keep walking every day to earn more!</p>
      </Card>

      <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Weekly Rewards</h3>
      <div className="grid grid-cols-2 gap-3">
        {DAILY_REWARDS.map(reward => {
          const isClaimed = lastDailyRewardDay === reward.day;
          const Icon = getIcon(reward.icon);
          return (
            <Card key={reward.day} className={`p-4 ${isClaimed ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink-400 text-xs">Day {reward.day}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-ink-700/50 flex items-center justify-center">
                  <Icon size={24} color={reward.gems > 0 ? '#a78bfa' : '#fbbf24'} />
                </div>
                <div className="flex gap-2">
                  {reward.coins > 0 && <Badge color="#fbbf24"><Coins size={10} className="inline" /> {reward.coins}</Badge>}
                  {reward.gems > 0 && <Badge color="#a78bfa"><Gem size={10} className="inline" /> {reward.gems}</Badge>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <button onClick={() => setScreen('daily-rewards')} className="text-zeviqo-400 text-sm mt-4">Claim daily rewards</button>
    </Screen>
  );
}
