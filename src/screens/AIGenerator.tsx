import { useState } from 'react';
import { generateAdventure, ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type AdventureType, type Difficulty } from '../data';
import { useStore } from '../store';
import { Card, Screen, Button, Badge } from '../components/ui';
import { Sparkles, Zap, Map, Clock, Coins, Gem, Play } from 'lucide-react';

export default function AIGenerator() {
  const { setSelectedAdventureObj, setScreen } = useStore();
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [seed, setSeed] = useState(1);
  const [generated, setGenerated] = useState<ReturnType<typeof generateAdventure> | null>(null);

  const handleGenerate = () => setGenerated(generateAdventure(seed, type, difficulty));
  const handlePlay = () => { if (generated) { setSelectedAdventureObj(generated); setScreen('adventure-preview'); } };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-2 flex items-center gap-2"><Sparkles size={24} color="#a78bfa" /> AI Adventure Generator</h1>
      <p className="text-ink-400 mb-4 text-sm">Create a custom adventure tailored to your preferences</p>
      <Card className="p-4 mb-4">
        <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Adventure Type</h3>
        <div className="grid grid-cols-2 gap-2">{ADVENTURE_TYPES.map(t => (
          <button key={t.type} onClick={() => setType(t.type)} className={`p-3 rounded-xl text-sm font-medium transition-all ${type === t.type ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>{t.label}</button>
        ))}</div>
      </Card>
      <Card className="p-4 mb-4">
        <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Difficulty</h3>
        <div className="flex flex-wrap gap-2">{(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
          <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${difficulty === d ? 'text-ink-950' : 'bg-ink-700/50 text-ink-400'}`} style={difficulty === d ? { background: DIFFICULTY_COLORS[d] } : {}}>{DIFFICULTY_LABELS[d]}</button>
        ))}</div>
      </Card>
      <Card className="p-4 mb-4">
        <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Random Seed</h3>
        <div className="flex items-center gap-3">
          <input type="range" min={1} max={100} value={seed} onChange={e => setSeed(Number(e.target.value))} className="flex-1" />
          <span className="text-white font-mono">{seed}</span>
        </div>
      </Card>
      <Button onClick={handleGenerate} className="w-full mb-4 flex items-center justify-center gap-2"><Sparkles size={18} /> Generate Adventure</Button>
      {generated && (
        <Card className="p-4 mb-4 border-zeviqo-500/30">
          <div className="flex items-start gap-3 mb-3"><div className="text-3xl">{generated.emoji}</div><div className="flex-1"><h3 className="font-semibold text-white">{generated.title}</h3><p className="text-ink-400 text-sm">{generated.description}</p></div></div>
          <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
            <span className="flex items-center gap-1"><Map size={12} /> {generated.distance} km</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {generated.duration} min</span>
            <span className="flex items-center gap-1"><Zap size={12} color="#00c4ff" /> {generated.xp} XP</span>
            <span className="flex items-center gap-1"><Coins size={12} color="#fbbf24" /> {generated.coins}</span>
            {generated.gems > 0 && <span className="flex items-center gap-1"><Gem size={12} color="#a78bfa" /> {generated.gems}</span>}
          </div>
          <Badge color={DIFFICULTY_COLORS[generated.difficulty]}>{DIFFICULTY_LABELS[generated.difficulty]}</Badge>
          <Button onClick={handlePlay} className="w-full mt-3 flex items-center justify-center gap-2"><Play size={16} /> Preview Adventure</Button>
        </Card>
      )}
      <Button variant="ghost" className="w-full" onClick={() => setScreen('adventures')}>Back to Adventures</Button>
    </Screen>
  );
}
