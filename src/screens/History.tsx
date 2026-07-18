import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Card, Screen, EmptyState, Badge, Button } from '../components/ui';
import { Map, Clock, Zap, Coins, Gem, Flame, Footprints, Heart } from 'lucide-react';
import { formatDistance, formatDuration } from '../lib/map-utils';

export default function History() {
  const { history, toggleHistoryFavorite, setScreen } = useStore();
  const { user } = useAuth();

  if (history.length === 0) return (
    <Screen>
      <EmptyState icon={Map} title="No history yet" subtitle="Complete adventures to see them here" />
      <Button onClick={() => setScreen('adventures')} className="w-full mt-4">Browse Adventures</Button>
    </Screen>
  );

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Adventure History</h1>
      <div className="space-y-3">{history.map(h => (
        <Card key={h.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{h.emoji ?? '🗺️'}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{h.adventure_name}</h3>
              <p className="text-ink-400 text-xs">{new Date(h.completed_at).toLocaleDateString()}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                <span className="flex items-center gap-1"><Footprints size={12} /> {formatDistance(h.distance)}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(h.duration)}</span>
                <span className="flex items-center gap-1"><Zap size={12} color="#00c4ff" /> {h.xp_earned}</span>
                <span className="flex items-center gap-1"><Coins size={12} color="#fbbf24" /> {h.coins_earned}</span>
                {h.gems_earned > 0 && <span className="flex items-center gap-1"><Gem size={12} color="#a78bfa" /> {h.gems_earned}</span>}
                {h.max_combo > 0 && <span className="flex items-center gap-1"><Flame size={12} color="#f97316" /> {h.max_combo}x</span>}
              </div>
              {h.difficulty && <div className="mt-2"><Badge color="#5a6a9a">{h.difficulty}</Badge></div>}
            </div>
            <button onClick={() => user && toggleHistoryFavorite(h.id, user.id)} className="text-ink-500 hover:text-gold-400">
              <Heart size={18} fill={h.is_favorite ? '#fbbf24' : 'none'} color={h.is_favorite ? '#fbbf24' : 'currentColor'} />
            </button>
          </div>
        </Card>
      ))}</div>
    </Screen>
  );
}
