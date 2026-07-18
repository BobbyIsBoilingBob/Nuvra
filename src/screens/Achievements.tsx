import { useStore } from '../store';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../cosmetics';
import { useAuth } from '../lib/auth';
import { Card, Screen, Badge } from '../components/ui';
import { getIcon } from '../components/ui';
import { CircleCheck as CheckCircle2, Circle, Lock } from 'lucide-react';

export default function Achievements() {
  const { questProgress, setScreen } = useStore();
  const { profile } = useAuth();

  const getMetricValue = (metric: string): number => {
    if (metric === 'level') return profile?.level ?? 0;
    if (metric === 'distance') return profile?.distance_walked ?? 0;
    if (metric === 'adventures') return profile?.completed_adventures ?? 0;
    if (metric === 'treasures') return profile?.treasure_collected ?? 0;
    if (metric === 'streak') return profile?.walking_streak ?? 0;
    return questProgress[metric] ?? 0;
  };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Achievements</h1>
      {ACHIEVEMENT_CATEGORIES.map(cat => {
        const items = ACHIEVEMENTS.filter(a => a.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h2 className="text-ink-400 text-sm font-semibold uppercase mb-3">{cat}</h2>
            <div className="space-y-3">
              {items.map(a => {
                const value = getMetricValue(a.metric);
                const unlocked = value >= a.requirement;
                const Icon = getIcon(a.icon);
                const tierColors: Record<string, string> = { bronze: '#fb923c', silver: '#94a3b8', gold: '#fbbf24', legendary: '#a78bfa' };
                return (
                  <Card key={a.id} className={`p-4 ${unlocked ? 'border-zeviqo-500/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${unlocked ? 'bg-zeviqo-500/10' : 'bg-ink-700/30'}`}>
                        <Icon size={24} color={unlocked ? tierColors[a.tier] : '#5a6a9a'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{a.title}</h3>
                          <Badge color={tierColors[a.tier]}>{a.tier}</Badge>
                        </div>
                        <p className="text-ink-400 text-sm">{a.description}</p>
                        <p className="text-ink-500 text-xs mt-1">{Math.min(value, a.requirement)} / {a.requirement}</p>
                      </div>
                      {unlocked ? <CheckCircle2 size={24} color="#22c55e" /> : <Lock size={20} color="#5a6a9a" />}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      <button onClick={() => setScreen('home')} className="text-zeviqo-400 text-sm mt-4">Back to Home</button>
    </Screen>
  );
}
