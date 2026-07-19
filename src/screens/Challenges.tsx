import { useStore } from '../store';
import { useChallenges } from '../hooks/useChallenges';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Activity, Compass, Camera, Navigation, Zap, Trophy } from 'lucide-react';

export default function Challenges() {
  const goBack = useStore((s) => s.goBack);
  const { challenges, loading, error } = useChallenges();
  if (loading) return (<div><Header title="Challenges" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  if (error) return (<div><Header title="Challenges" onBack={goBack} /><div className="px-4 py-8 text-center text-error-600">{error}</div></div>);
  return (
    <div>
      <Header title="Challenges" onBack={goBack} subtitle={`${challenges.length} active`} />
      <div className="px-4 py-4">
        <div className="space-y-2">
          {challenges.map((c) => (
            <Card key={c.id} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.status === 'completed' ? '#d1fae5' : '#dbeafe', color: c.status === 'completed' ? '#059669' : '#1c7af5' }}>{c.status === 'completed' ? <Trophy size={20} /> : <Activity size={20} />}</div>
              <div className="flex-1"><h3 className="font-semibold">{c.title}</h3><p className="text-sm text-ink-500">{c.description}</p><div className="flex items-center gap-2 mt-1.5"><div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }} /></div><span className="text-xs text-ink-500">{c.progress}/{c.target}</span></div><div className="flex gap-1 mt-1.5"><span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">🪙 {c.reward.coins}</span><span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">⭐ {c.reward.xp} XP</span></div></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
