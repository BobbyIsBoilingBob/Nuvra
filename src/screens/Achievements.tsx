import { useAuth } from '../lib/auth';
import { ACHIEVEMENTS } from '../cosmetics';
import { Card, Screen, EmptyState, Badge } from '../components/ui';
import { Award, CircleCheck as CheckCircle2, Circle } from 'lucide-react';

export default function Achievements() {
  const { profile } = useAuth();
  if (!profile) return null;
  const unlocked = (id: string) => {
    if (id === 'a1') return profile.completed_adventures >= 1;
    if (id === 'a2') return profile.completed_adventures >= 10;
    if (id === 'a3') return profile.distance_walked >= 42000;
    if (id === 'a4') return false;
    if (id === 'a5') return profile.treasure_collected >= 50;
    return false;
  };
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Achievements</h1>
      <div className="space-y-3">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked(a.id);
          return (
            <Card key={a.id} className="p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${done ? 'bg-zeviqo-500/20' : 'bg-ink-700/50 grayscale opacity-50'}`}>{a.emoji}</div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{a.name}</p>
                <p className="text-ink-400 text-xs">{a.description}</p>
              </div>
              {done ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} color="#475569" />}
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}
