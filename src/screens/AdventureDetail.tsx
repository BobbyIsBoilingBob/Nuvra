import { useStore } from '../store';
import { getAdventureById } from '../data';
import { Card, Button, Screen, Badge } from '../components/ui';
import { Map, Clock, Zap, Coins, Gem, Target, Trophy, ChevronRight, Check } from 'lucide-react';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';

export default function AdventureDetail() {
  const { selectedAdventureId, selectedAdventureObj, setScreen } = useStore();
  const adventure = selectedAdventureObj ?? getAdventureById(selectedAdventureId ?? '');

  if (!adventure) {
    return (
      <Screen>
        <p className="text-ink-400">Adventure not found.</p>
        <Button onClick={() => setScreen('adventures')} className="mt-4">Back to Adventures</Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <button onClick={() => setScreen('adventures')} className="text-ink-400 text-sm mb-4 flex items-center gap-1">
        <ChevronRight size={16} className="rotate-180" /> Back
      </button>

      <div className="text-5xl mb-3">{adventure.emoji}</div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">{adventure.title}</h1>
      <p className="text-ink-400 mb-4">{adventure.description}</p>

      <div className="flex items-center gap-2 mb-4">
        <Badge color={DIFFICULTY_COLORS[adventure.difficulty]}>{DIFFICULTY_LABELS[adventure.difficulty]}</Badge>
        {adventure.tags.map(t => <Badge key={t} color="#5a6a9a">{t}</Badge>)}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-3 flex items-center gap-2"><Map size={20} color="#00c4ff" /><div><p className="text-white font-bold">{adventure.distance} km</p><p className="text-ink-400 text-xs">Distance</p></div></Card>
        <Card className="p-3 flex items-center gap-2"><Clock size={20} color="#22c55e" /><div><p className="text-white font-bold">{adventure.duration} min</p><p className="text-ink-400 text-xs">Duration</p></div></Card>
        <Card className="p-3 flex items-center gap-2"><Zap size={20} color="#00c4ff" /><div><p className="text-white font-bold">{adventure.xp} XP</p><p className="text-ink-400 text-xs">Experience</p></div></Card>
        <Card className="p-3 flex items-center gap-2"><Coins size={20} color="#fbbf24" /><div><p className="text-white font-bold">{adventure.coins}</p><p className="text-ink-400 text-xs">Coins</p></div></Card>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} color="#00c4ff" />
          <h3 className="font-semibold text-white">Objectives</h3>
        </div>
        <ul className="space-y-2">
          {adventure.objectives.map((obj, i) => (
            <li key={i} className="flex items-center gap-2 text-ink-300 text-sm">
              <Check size={16} color="#22c55e" /> {obj}
            </li>
          ))}
        </ul>
      </Card>

      {adventure.challenges.length > 0 && (
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} color="#fbbf24" />
            <h3 className="font-semibold text-white">Challenges</h3>
          </div>
          <p className="text-ink-400 text-sm">{adventure.challenges.length} bonus challenges available</p>
        </Card>
      )}

      <Button size="lg" className="w-full" onClick={() => setScreen('adventure-map')}>
        Start Adventure
      </Button>
    </Screen>
  );
}
