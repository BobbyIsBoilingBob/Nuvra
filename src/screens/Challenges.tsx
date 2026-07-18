import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useChallenges } from '../hooks/useChallenges';
import { Trophy } from 'lucide-react';

export default function Challenges() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const { challenges, loading, error } = useChallenges();

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Challenges" />
        <div className="px-4 py-10 text-center"><p className="text-ink-300">Sign in to join challenges.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }

  return (
    <div className="pb-24"><Header title="Challenges" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {loading && <Spinner label="Loading challenges…" />}
        {error && <p className="text-error-400 text-sm">{error}</p>}
        {!loading && challenges.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">No active challenges right now. Complete adventures to trigger new ones!</p>
        )}
        {challenges.map((c) => {
          const pct = Math.min((c.progress / c.target) * 100, 100);
          const completed = c.status === 'completed' || c.progress >= c.target;
          return (
            <Card key={c.id} className={`p-4 ${completed ? 'border-success-500/40' : ''}`}>
              <div className="flex items-start gap-3">
                <Trophy size={20} className={completed ? 'text-success-400' : 'text-accent-400'} />
                <div className="flex-1">
                  <p className="text-white font-semibold">{c.title}</p>
                  <p className="text-ink-400 text-sm">{c.description}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-ink-700 overflow-hidden">
                    <div className={`h-full transition-all ${completed ? 'bg-success-500' : 'bg-brand-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-ink-400 text-xs mt-1">
                    {Math.round(c.progress)}/{Math.round(c.target)} • {c.reward.xp} XP • {c.reward.coins} coins
                    {completed && <span className="text-success-400 ml-2">Completed!</span>}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
