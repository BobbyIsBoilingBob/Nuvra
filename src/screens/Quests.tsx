import { useStore } from '../store';
import { ADVENTURES } from '../data';
import { Card, Screen, EmptyState, ProgressBar, Badge } from '../components/ui';
import { Target, CircleCheck as CheckCircle2, Circle, Zap } from 'lucide-react';

export default function Quests() {
  const { questProgress } = useStore();
  const allQuests = ADVENTURES.flatMap((a) => a.quests.map((q) => ({ ...q, adventureName: a.name, adventureEmoji: a.emoji })));
  const active = allQuests.filter((q) => questProgress[q.id] && !questProgress[q.id].completed);
  const done = allQuests.filter((q) => questProgress[q.id]?.completed);

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Quests</h1>
      {active.length === 0 && done.length === 0 ? <EmptyState icon={Target} title="No quests yet" subtitle="Start an adventure to begin quests" /> : (
        <>
          {active.length > 0 && <h2 className="text-ink-400 text-sm font-semibold uppercase mb-3">Active ({active.length})</h2>}
          <div className="space-y-2 mb-4">
            {active.map((q) => (
              <Card key={q.id} className="p-3">
                <div className="flex items-center gap-3 mb-2">
                  <Circle size={18} color="#64748b" />
                  <div className="flex-1"><p className="text-white font-semibold text-sm">{q.title}</p><p className="text-ink-400 text-xs">{q.adventureEmoji} {q.adventureName}</p></div>
                  <Badge color="#fbbf24"><Zap size={10} className="inline" /> {q.xp}</Badge>
                </div>
                {q.target && <ProgressBar value={questProgress[q.id]?.progress ?? 0} max={q.target} color="#3b82f6" />}
              </Card>
            ))}
          </div>
          {done.length > 0 && <h2 className="text-ink-400 text-sm font-semibold uppercase mb-3">Completed ({done.length})</h2>}
          <div className="space-y-2">
            {done.map((q) => (
              <Card key={q.id} className="p-3 flex items-center gap-3 opacity-60">
                <CheckCircle2 size={18} color="#22c55e" />
                <div className="flex-1"><p className="text-white font-semibold text-sm">{q.title}</p><p className="text-ink-400 text-xs">{q.adventureEmoji} {q.adventureName}</p></div>
                <Badge color="#22c55e"><Zap size={10} className="inline" /> {q.xp}</Badge>
              </Card>
            ))}
          </div>
        </>
      )}
    </Screen>
  );
}
