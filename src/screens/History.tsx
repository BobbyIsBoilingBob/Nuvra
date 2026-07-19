import { useStore } from '../store';
import { Header } from '../components/Header';
import { Card } from '../components/Card';

export default function History() {
  const goBack = useStore((s) => s.goBack);
  const history = useStore((s) => s.history);

  return (
    <div>
      <Header title="Adventure History" onBack={goBack} subtitle={`${history.length} completed`} />
      <div className="px-4 py-4 space-y-3">
        {history.length === 0 ? (
          <p className="text-center text-ink-500 py-8">No adventures completed yet. Go explore!</p>
        ) : (
          history.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{h.adventureTitle}</p>
                  <p className="text-xs text-ink-500">{new Date(h.completedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-brand-600 font-medium">+{h.xp} XP</p>
                  <p className="text-accent-600">+{h.coins}🪙</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-ink-400 mt-2">
                <span>📍 {(h.distance / 1000).toFixed(2)} km</span>
                <span>⏱️ {h.duration} min</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
