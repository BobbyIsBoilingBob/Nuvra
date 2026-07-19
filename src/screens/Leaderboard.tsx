import { useStore } from '../store';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  const goBack = useStore((s) => s.goBack);
  const { entries, loading } = useLeaderboard();

  return (
    <div>
      <Header title="Leaderboard" onBack={goBack} subtitle="Top walkers this season" />
      <div className="px-4 py-4 space-y-3">
        {loading && <Spinner />}
        {!loading && entries.length === 0 && <p className="text-center text-ink-500 py-8">No walkers yet. Be the first!</p>}
        {entries.map((e, i) => (
          <Card key={e.id} className={`flex items-center gap-3 ${i < 3 ? 'bg-accent-50 border-accent-100' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-accent-200 text-accent-800' : i < 3 ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-500'}`}>
              {i + 1}
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: e.avatar_color }}>{e.avatar_emoji}</div>
            <div className="flex-1">
              <p className="font-semibold">{e.username}</p>
              <p className="text-xs text-ink-500">Lv {e.level} · {Math.round(e.distance_walked)}m · {e.completed_adventures} adventures</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-600">{e.xp}</p>
              <p className="text-xs text-ink-400">XP</p>
            </div>
            {i === 0 && <Trophy size={20} className="text-accent-500" />}
          </Card>
        ))}
      </div>
    </div>
  );
}
