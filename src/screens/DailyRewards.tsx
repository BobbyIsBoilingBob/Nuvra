import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { DAILY_REWARDS } from '../data/gameData';
import { Gift } from 'lucide-react';

export default function DailyRewards() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="Daily Rewards" />
        <div className="px-4 py-10 text-center">
          <Gift size={48} className="text-ink-500 mx-auto" />
          <p className="text-ink-300 mt-4">Sign in to claim daily rewards.</p>
          <Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header title="Daily Rewards" />
      <div className="px-4 py-4 max-w-lg mx-auto grid grid-cols-4 gap-3">
        {DAILY_REWARDS.map((d) => (
          <Card key={d.day} className={`p-3 text-center ${d.claimed ? 'opacity-50' : ''}`}>
            <p className="text-ink-400 text-xs">Day {d.day}</p>
            <Gift size={24} className="text-accent-400 mx-auto my-2" />
            <p className="text-white text-xs font-medium">
              {d.reward.coins ? `${d.reward.coins}c` : ''} {d.reward.xp ? `${d.reward.xp}xp` : ''}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
