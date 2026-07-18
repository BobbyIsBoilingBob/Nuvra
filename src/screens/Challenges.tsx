import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { CHALLENGES } from '../data/gameData';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';

export default function Challenges() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="Challenges" />
        <div className="px-4 py-10 text-center">
          <p className="text-ink-300">Sign in to join challenges.</p>
          <Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header title="Challenges" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {CHALLENGES.map((c) => (
          <Card key={c.id} className="p-4">
            <p className="text-white font-semibold">{c.title}</p>
            <p className="text-ink-400 text-sm">{c.description}</p>
            <div className="mt-2 h-1.5 rounded-full bg-ink-700 overflow-hidden">
              <div className="h-full bg-brand-400" style={{ width: `${Math.min((c.progress / c.target) * 100, 100)}%` }} />
            </div>
            <p className="text-ink-400 text-xs mt-1">{c.progress}/{c.target} • {c.reward.xp} XP</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
