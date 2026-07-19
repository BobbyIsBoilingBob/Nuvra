import { useStore } from '../store';
import { useRewards } from '../hooks/useRewards';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Gift } from 'lucide-react';

export default function Rewards() {
  const goBack = useStore((s) => s.goBack);
  const { rewards, loading, error } = useRewards();
  if (loading) return (<div><Header title="Rewards" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  return (
    <div>
      <Header title="Rewards" onBack={goBack} subtitle="Your earned rewards" />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        {rewards.length === 0 && !loading ? (
          <div className="text-center py-12 text-ink-400"><Gift className="mx-auto mb-2" /><p>No rewards yet. Complete adventures to earn rewards!</p></div>
        ) : (
          <div className="space-y-2">
            {rewards.map((r) => (
              <Card key={r.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center text-2xl">{r.icon ?? '🎁'}</div>
                <div className="flex-1"><h3 className="font-semibold">{r.title}</h3><p className="text-sm text-ink-500">{r.description}</p>{r.earnedAt && <p className="text-xs text-success-600 mt-0.5">Earned {new Date(r.earnedAt).toLocaleDateString()}</p>}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
