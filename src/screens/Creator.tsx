import { useState } from 'react';
import { generateAdventure, DIFFICULTY_LABELS, type AdventureType, type Difficulty } from '../data';
import { useStore } from '../store';
import { Card, Screen, Button } from '../components/ui';
import { Sparkles, Wand as Wand2 } from 'lucide-react';

export default function Creator() {
  const { setSelectedAdventureObj, setScreen } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const handleCreate = () => {
    const seed = Math.floor(Math.random() * 1000) + 1;
    const adv = generateAdventure(seed, type, difficulty);
    if (title) adv.title = title;
    if (description) adv.description = description;
    setSelectedAdventureObj(adv);
    setScreen('adventure-preview');
  };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-2"><Wand2 size={24} color="#a78bfa" /> Adventure Creator</h1>
      <Card className="p-4 mb-4 space-y-4">
        <div>
          <label className="text-sm text-ink-400 mb-1 block">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="My custom adventure" className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" />
        </div>
        <div>
          <label className="text-sm text-ink-400 mb-1 block">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your adventure..." className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50 min-h-[80px]" />
        </div>
        <div>
          <label className="text-sm text-ink-400 mb-1 block">Type</label>
          <div className="flex flex-wrap gap-2">{(['explorer', 'treasure_hunt', 'relaxed_walk', 'challenge_run'] as AdventureType[]).map(t => (
            <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${type === t ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>{t.replace('_', ' ')}</button>
          ))}</div>
        </div>
        <div>
          <label className="text-sm text-ink-400 mb-1 block">Difficulty</label>
          <div className="flex flex-wrap gap-2">{(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
            <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${difficulty === d ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>{DIFFICULTY_LABELS[d]}</button>
          ))}</div>
        </div>
      </Card>
      <Button onClick={handleCreate} className="w-full flex items-center justify-center gap-2"><Sparkles size={18} /> Create Adventure</Button>
      <Button variant="ghost" className="w-full mt-2" onClick={() => setScreen('home')}>Back</Button>
    </Screen>
  );
}
