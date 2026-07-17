import { useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, Pill, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { generateAdventure, ADVENTURE_TYPES, DIFFICULTY_LABELS, type AdventureType, type Difficulty } from '../data';

export function Creator() {
  const { setSelectedAdventureObj, setScreen } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  function handleCreate() {
    const seed = Math.floor(Math.random() * 100000);
    const adv = generateAdventure(seed, type, difficulty);
    if (title) adv.title = title;
    if (description) adv.description = description;
    adv.isAI = true;
    setSelectedAdventureObj(adv);
    setScreen('adventure-preview');
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fb923c" />
      <TopBar title="Create Adventure" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4">
          <SectionTitle icon="PenTool">Adventure Name</SectionTitle>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="My Custom Adventure" className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40 mt-2" />
        </GlassCard>
        <GlassCard className="p-4">
          <SectionTitle icon="BookOpen">Description</SectionTitle>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your adventure..." rows={3} className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40 mt-2 resize-none" />
        </GlassCard>
        <GlassCard className="p-4">
          <SectionTitle icon="Compass">Type</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ADVENTURE_TYPES.map(t => (
              <button key={t.type} onClick={() => setType(t.type)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${type === t.type ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}><Icon name={t.icon} size={14} />{t.label}</button>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <SectionTitle icon="Gauge">Difficulty</SectionTitle>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['relaxed', 'easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-2 rounded-xl text-xs font-bold capitalize ${difficulty === d ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>{DIFFICULTY_LABELS[d]}</button>
            ))}
          </div>
        </GlassCard>
        <Button fullWidth size="lg" icon="Rocket" onClick={handleCreate}>Create Adventure</Button>
      </div>
    </div>
  );
}
