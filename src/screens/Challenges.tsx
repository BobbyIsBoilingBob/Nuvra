import { useStore } from '../store';
import { CHALLENGES } from '../data';
import { useAuth } from '../lib/auth';
import { Card, Screen, EmptyState, ProgressBar, Badge } from '../components/ui';
import { Target, CircleCheck as CheckCircle2, Zap } from 'lucide-react';

export default function Challenges() {
  const { challengeProgress } = useStore();
  const { profile } = useAuth();
  const getProgress = (id: string, type: string) => {
    if (type === 'distance') return profile?.distance_walked ?? 0;
    if (type === 'adventures') return profile?.completed_adventures ?? 0;
    if (type === 'streak') return profile?.walking_streak ?? 0;
    return challengeProgress[id] ?? 0;
  };
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Challenges</h1>
      <div className="space-y-3">
        {CHALLENGES.map((c) => {
          const prog = getProgress(c.id, c.type);
          const done = prog >= c.target;
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                {done ? <CheckCircle2 size={20} color="#22c55e" /> : <Target size={20} color="#fbbf24" />}
                <div className="flex-1"><p className="text-white font-semibold text-sm">{c.title}</p><p className="text-ink-400 text-xs">{c.description}</p></div>
                <Badge color="#fbbf24"><Zap size={10} className="inline" /> {c.xp}</Badge>
              </div>
              <ProgressBar value={prog} max={c.target} color={done ? '#22c55e' : '#fbbf24'} />
              <p className="text-ink-400 text-xs mt-1">{Math.min(prog, c.target)} / {c.target}</p>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}
