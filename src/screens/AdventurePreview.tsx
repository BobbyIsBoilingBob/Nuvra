import { useStore } from '../store';
import { ADVENTURES } from '../data';
import { Card, Screen, Button, EmptyState, ProgressBar, Badge } from '../components/ui';
import { ArrowLeft, MapPin, Zap, CircleCheck as CheckCircle2, Circle } from 'lucide-react';

export default function AdventurePreview() {
  const { activeAdventureId, setScreen, questProgress } = useStore();
  const adventure = ADVENTURES.find((a) => a.id === activeAdventureId);
  if (!adventure) return <Screen><EmptyState icon={MapPin} title="No adventure selected" /><Button onClick={() => setScreen('adventures')} className="mt-4">Browse Adventures</Button></Screen>;
  const completedCount = adventure.quests.filter((q) => questProgress[q.id]?.completed).length;
  return (
    <Screen>
      <button onClick={() => setScreen('adventureDetail')} className="flex items-center gap-1 text-ink-400 text-sm mb-4"><ArrowLeft size={16} /> Back</button>
      <Card className="p-4 mb-4" style={{ borderColor: `${adventure.color}33` }}>
        <div className="text-5xl mb-2">{adventure.emoji}</div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">{adventure.name}</h1>
        <p className="text-ink-400 text-sm mb-3">{adventure.description}</p>
        <div className="flex gap-2 mb-3">
          <Badge color={adventure.color}>{adventure.difficulty}</Badge>
          <Badge color="#fbbf24"><Zap size={10} className="inline" /> {adventure.totalXp} XP</Badge>
        </div>
        <ProgressBar value={completedCount} max={adventure.quests.length} />
      </Card>
      <h2 className="text-ink-400 text-sm font-semibold uppercase mb-3">Quests Preview</h2>
      <div className="space-y-2 mb-4">
        {adventure.quests.map((q, i) => {
          const done = questProgress[q.id]?.completed;
          return (
            <Card key={q.id} className="p-3 flex items-center gap-3">
              {done ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} color="#64748b" />}
              <div className="flex-1"><p className="text-white font-semibold text-sm">{i + 1}. {q.title}</p><p className="text-ink-400 text-xs">{q.description}</p></div>
              <Badge color="#fbbf24"><Zap size={10} className="inline" /> {q.xp}</Badge>
            </Card>
          );
        })}
      </div>
      <Button onClick={() => setScreen('adventureMap')} className="w-full mb-2">Begin Adventure</Button>
      <Button variant="ghost" onClick={() => setScreen('adventures')} className="w-full">Choose Another</Button>
    </Screen>
  );
}
