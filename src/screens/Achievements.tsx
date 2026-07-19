import { useStore } from '../store';
import { ACHIEVEMENTS } from '../data/gameData';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Check, Lock } from 'lucide-react';

export default function Achievements() {
  const goBack = useStore((s) => s.goBack);
  const unlocked = useStore((s) => s.unlockedAchievements);

  return (
    <div>
      <Header title="Achievements" onBack={goBack} subtitle={`${unlocked.length} / ${ACHIEVEMENTS.length} unlocked`} />
      <div className="px-4 py-4 space-y-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <Card key={a.id} className={isUnlocked ? 'bg-success-50 border-success-100' : ''}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isUnlocked ? 'bg-success-100' : 'bg-ink-100 grayscale'}`}>
                  {a.icon === 'Footprints' ? '👣' : a.icon === 'Compass' ? '🧭' : a.icon === 'Mountain' ? '🏔️' : a.icon === 'Users' ? '👥' : a.icon === 'Medal' ? '🏅' : a.icon === 'Sunrise' ? '🌅' : '🏆'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{a.title}</p>
                    {isUnlocked ? <Check size={16} className="text-success-600" /> : <Lock size={14} className="text-ink-400" />}
                  </div>
                  <p className="text-sm text-ink-500">{a.description}</p>
                  {'progress' in a && a.progress !== undefined && a.target && (
                    <div className="mt-1">
                      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, (a.progress / a.target) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-ink-400 mt-0.5">{a.progress} / {a.target}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
