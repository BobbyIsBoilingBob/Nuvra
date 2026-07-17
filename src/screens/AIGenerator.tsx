import { useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, Pill, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { generateAdventure, ADVENTURE_TYPES, DIFFICULTY_LABELS, type AdventureType, type Difficulty } from '../data';

export function AIGenerator() {
  const { setSelectedAdventureObj, setScreen } = useStore();
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof generateAdventure> | null>(null);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const seed = Math.floor(Math.random() * 100000);
      const adv = generateAdventure(seed, type, difficulty);
      setResult(adv);
      setGenerating(false);
    }, 800);
  }

  function handleStart() {
    if (result) { setSelectedAdventureObj(result); setScreen('adventure-preview'); }
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="AI Generator" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-zeviqo-400 to-nova-500 flex items-center justify-center"><Icon name="Sparkles" size={32} className="text-ink-950" /></div>
          <h2 className="text-lg font-display font-bold text-white">AI Adventure Generator</h2>
          <p className="text-xs text-white/40 mt-1">Customize your preferences and let AI create a unique adventure for you.</p>
        </GlassCard>

        <GlassCard className="p-4">
          <SectionTitle icon="Compass">Adventure Type</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ADVENTURE_TYPES.map(t => (
              <button key={t.type} onClick={() => setType(t.type)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${type === t.type ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>
                <Icon name={t.icon} size={14} />{t.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <SectionTitle icon="Gauge">Difficulty</SectionTitle>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['relaxed', 'easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${difficulty === d ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>{DIFFICULTY_LABELS[d]}</button>
            ))}
          </div>
        </GlassCard>

        <Button fullWidth size="lg" icon="Sparkles" disabled={generating} onClick={handleGenerate}>{generating ? 'Generating...' : 'Generate Adventure'}</Button>

        {result && (
          <GlassCard className="p-4 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{result.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{result.title}</p>
                <p className="text-[10px] text-white/40">{ADVENTURE_TYPES.find(t => t.type === result.type)?.label} · {DIFFICULTY_LABELS[result.difficulty]}</p>
              </div>
            </div>
            <p className="text-xs text-white/60 mb-3">{result.description}</p>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Pill icon="Route" accent="text-zeviqo-300 border-zeviqo-500/30">{result.distance} km</Pill>
              <Pill icon="Clock" accent="text-white/50 border-white/10">{result.duration} min</Pill>
              <Pill icon="Zap" accent="text-gold-300 border-gold-500/30">+{result.xp} XP</Pill>
            </div>
            <Button fullWidth icon="Play" onClick={handleStart}>Preview Adventure</Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
