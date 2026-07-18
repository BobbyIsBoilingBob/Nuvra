import { useStore } from '../store';
import { Card, Screen, Button, Badge } from '../components/ui';
import { Map, Clock, Zap, Coins, Gem, Play, ChevronRight } from 'lucide-react';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';

export default function AdventurePreview() {
  const { selectedAdventureObj, setScreen } = useStore();
  const adventure = selectedAdventureObj;

  if (!adventure) {
    return (
      <Screen>
        <p className="text-ink-400">No adventure selected.</p>
        <Button onClick={() => setScreen('ai-generator')} className="mt-4">Back to Generator</Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <button onClick={() => setScreen('ai-generator')} className="text-ink-400 text-sm mb-4 flex items-center gap-1">
        <ChevronRight size={16} className="rotate-180" /> Back
      </button>

      <div className="text-5xl mb-3">{adventure.emoji}</div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">{adventure.title}</h1>
      <p className="text-ink-400 mb-4">{adventure.description}</p>

      <div className="flex items-center gap-2 mb-4">
        <Badge color={DIFFICULTY_COLORS[adventure.difficulty]}>{DIFFICULTY_LABELS[adventure.difficulty]}</Badge>
        {adventure.isAI && <Badge color="#a78bfa">AI Generated</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-3 flex items-center gap-2"><Map size={20} color="#00c4ff" /><div><p className="text-white font-bold">{adventure.distance} km</p><p className="text-ink-400 text-xs">Distance</p></div></Card>
        <Card className="p-3 flex items-center gap-2"><Clock size={20} color="#22c55e" /><div><p className="text-white font-bold">{adventure.duration} min</p><p className="text-ink-400 text-xs">Duration</p></div></Card>
        <Card className="p-3 flex items-center gap-2"><Zap size={20} color="#00c4ff" /><div><p className="text-white font-bold">{adventure.xp} XP</p><p className="text-ink-400 text-xs">Experience</p></div></Card>
        <Card className="p-3 flex items-center gap-2"><Coins size={20} color="#fbbf24" /><div><p className="text-white font-bold">{adventure.coins}</p><p className="text-ink-400 text-xs">Coins</p></div></Card>
      </div>

      <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => setScreen('adventure-map')}>
        <Play size={20} /> Start Adventure
      </Button>
    </Screen>
  );
}
