import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useLeaderboard } from '../lib/useLeaderboard';
import { Trophy } from 'lucide-react';

export default function Rewards() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest, user } = useAuth();
  const { entries, loading, error } = useLeaderboard();

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
          <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-accent-400" /> Leaderboard
          </h3>
          {/* Fix #1: real users from Supabase profiles table, no fake data. */}
          {loading && <Spinner label="Loading leaderboard…" />}
          {error && <p className="text-error-400 text-sm">{error}</p>}
          {!loading && !error && entries.length === 0 && (
            <p className="text-ink-400 text-sm">No players yet. Be the first!</p>
          )}
          {!loading && !error && entries.length > 0 && (
            <div className="space-y-2">
              {entries.map((p, i) => {
                const isMe = user?.id === p.id;
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-2 py-1.5 rounded-lg ${isMe ? 'bg-brand-500/10 border border-brand-500/30' : ''}`}>
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-accent-500/20 text-accent-400' : i < 3 ? 'bg-brand-500/20 text-brand-300' : 'bg-ink-700 text-ink-300'}`}>
                      {i + 1}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-ink-700 flex items-center justify-center flex-shrink-0 text-lg">
                      {p.avatar ?? '🧭'}
                    </div>
                    <span className={`font-medium flex-1 truncate ${isMe ? 'text-brand-300' : 'text-white'}`}>
                      {p.username}{isMe ? ' (you)' : ''}
                    </span>
                    <span className="text-ink-300 text-sm">Lv {p.level}</span>
                    <span className="text-brand-300 text-sm font-semibold">{p.xp.toLocaleString()} XP</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4" onClick={() => navigate('dailyRewards')}><Trophy size={20} className="text-accent-400" /><p className="text-white font-semibold mt-2 text-sm">Daily Rewards</p></Card>
          <Card className="p-4" onClick={() => navigate('achievements')}><Trophy size={20} className="text-accent-400" /><p className="text-white font-semibold mt-2 text-sm">Achievements</p></Card>
        </div>
      </div>
    </div>
  );
}
