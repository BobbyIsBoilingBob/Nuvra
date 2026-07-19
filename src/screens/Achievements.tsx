import { useStore } from '../store';
import { useAchievements } from '../hooks/useAchievements';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Award, Lock } from 'lucide-react';

export default function Achievements() {
  const goBack = useStore((s) => s.goBack);
  const { achievements, loading, error } = useAchievements();
  if (loading) return (<div><Header title="Achievements" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  if (error) return (<div><Header title="Achievements" onBack={goBack} /><div className="px-4 py-8 text-center text-error-600">{error}</div></div>);
  const unlocked = achievements.filter((a) => a.unlocked);
  return (
    <div>
      <Header title="Achievements" onBack={goBack} subtitle={`${unlocked.length}/${achievements.length} unlocked`} />
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-2">
          {achievements.map((a) => (
            <Card key={a.id} className={`flex items-center gap-3 ${a.unlocked ? '' : 'opacity-60'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${a.unlocked ? 'bg-accent-100 text-accent-600' : 'bg-ink-100 text-ink-400'}`}>{a.unlocked ? <Award size={24} /> : <Lock size={20} />}</div>
              <div className="flex-1"><h3 className="font-semibold">{a.title}</h3><p className="text-sm text-ink-500">{a.description}</p>{a.unlocked && a.unlockedAt && <p className="text-xs text-success-600 mt-0.5">Unlocked {new Date(a.unlockedAt).toLocaleDateString()}</p>}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
