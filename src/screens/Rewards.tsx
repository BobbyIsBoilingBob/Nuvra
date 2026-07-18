import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Trophy } from 'lucide-react';

const LEADERBOARD = [
  { rank: 1, username: 'TrailKing', xp: 12400 },
  { rank: 2, username: 'WanderWendy', xp: 9800 },
  { rank: 3, username: 'Pathfinder', xp: 7600 },
  { rank: 4, username: 'StrollerSam', xp: 5400 },
  { rank: 5, username: 'HikerHannah', xp: 4200 },
];

export default function Rewards() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  return (
    <div className="pb-24">
      <Header title="Rewards & Leaderboard" back={false} />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {isGuest && (
          <Card className="p-4 text-center">
            <Trophy size={36} className="text-accent-400 mx-auto" />
            <p className="text-ink-300 mt-2 text-sm">Sign in to earn and track rewards.</p>
            <Button size="sm" className="mt-3" onClick={() => navigate('auth')}>Sign In</Button>
          </Card>
        )}
        <Card className="p-4">
          <h3 className="font-display font-bold text-white mb-3">Leaderboard</h3>
          <div className="space-y-2">
            {LEADERBOARD.map((p) => (
              <div key={p.rank} className="flex items-center gap-3">
                <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${p.rank === 1 ? 'bg-accent-500/20 text-accent-400' : 'bg-ink-700 text-ink-300'}`}>{p.rank}</span>
                <span className="text-white font-medium flex-1">{p.username}</span>
                <span className="text-brand-300 text-sm">{p.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4" onClick={() => navigate('dailyRewards')}><Trophy size={20} className="text-accent-400" /><p className="text-white font-semibold mt-2 text-sm">Daily Rewards</p></Card>
          <Card className="p-4" onClick={() => navigate('achievements')}><Trophy size={20} className="text-accent-400" /><p className="text-white font-semibold mt-2 text-sm">Achievements</p></Card>
        </div>
      </div>
    </div>
  );
}
