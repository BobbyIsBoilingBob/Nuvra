import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { History as HistoryIcon } from 'lucide-react';

export default function History() {
  const setScreen = useStore((s) => s.setScreen);
  const { isGuest } = useAuth();
  const history = useStore((s) => s.history);

  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="History" back={false} />
        <div className="px-4 py-10 text-center">
          <HistoryIcon size={48} className="text-ink-500 mx-auto" />
          <p className="text-ink-300 mt-4">Sign in to view your adventure history.</p>
          <Button className="mt-4" onClick={() => setScreen('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Header title="History" back={false} />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {history.length === 0 && <p className="text-ink-400 text-sm">No completed adventures yet.</p>}
        {history.map((h) => (
          <Card key={h.id} className="p-4">
            <p className="text-white font-semibold">{h.adventureTitle}</p>
            <p className="text-ink-400 text-xs">{new Date(h.completedAt).toLocaleDateString()}</p>
            <div className="flex gap-4 mt-2 text-sm text-ink-300">
              <span>{(h.distance / 1000).toFixed(2)} km</span>
              <span>{h.duration} min</span>
              <span>{h.xp} XP</span>
              <span>{h.coins} coins</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
