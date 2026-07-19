import { useStore } from '../store';
import { useChallenges } from '../hooks/useChallenges';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Target, Trophy } from 'lucide-react';

export default function Challenges() {
  const goBack = useStore((s) => s.goBack);
  const { challenges, loading } = useChallenges();

  return (
    <div>
      <Header title="Challenges" onBack={goBack} />
      <div className="px-4 py-4 space-y-3">
        {loading && <Spinner />}
        {challenges.map((c) => {
          const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
          return (
            <Card key={c.id}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Target size={20} /></div>
                <div className="flex-1">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-ink-500">{c.description}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'completed' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}>
                  {c.status}
                </span>
              </div>
              <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-ink-400 mt-1">
                <span>{c.progress} / {c.target}</span>
                <span><Trophy size={12} className="inline" /> +{c.reward.xp} XP · +{c.reward.coins}🪙</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
