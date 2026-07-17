import { useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { generateAdventure, ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type AdventureType, type Difficulty } from '../data';

export function AIGenerator() {
  const { setScreen, setSelectedAdventureObj } = useStore();
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [generating, setGenerating] = useState(false);
  const [seed, setSeed] = useState(1);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const newSeed = seed + Math.floor(Math.random() * 1000) + 1;
      setSeed(newSeed);
      const adventure = generateAdventure(newSeed, type, difficulty);
      setSelectedAdventureObj(adventure);
      setGenerating(false);
      setScreen('adventure-preview');
    }, 1200);
  }

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="AI Generator" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5 text-center">
          <div className="text-4xl mb-2">✨</div>
          <h2 className="text-lg font-display font-bold text-white">AI Adventure Generator</h2>
          <p className="text-xs text-white/40 mt-1">Let AI create a unique walking adventure for you</p>
        </GlassCard>

        <div>
          <h3 className="text-sm font-bold text-white mb-2">Adventure Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {ADVENTURE_TYPES.map(t => (
              <button
                key={t.type}
                onClick={() => setType(t.type)}
                className={`p-3 rounded-xl text-left transition-all ${type === t.type ? 'glass ring-2' : 'glass'}`}
                style={type === t.type ? { borderColor: t.color + '60', boxShadow: `0 0 0 1px ${t.color}40` } : undefined}
              >
                <Icon name={t.icon} size={18} style={{ color: t.color }} />
                <p className="text-xs font-bold text-white mt-1">{t.label}</p>
                <p className="text-[9px] text-white/40">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-2">Difficulty</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${difficulty === d ? 'glass ring-2' : 'glass'}`}
                style={difficulty === d ? { borderColor: DIFFICULTY_COLORS[d] + '60', boxShadow: `0 0 0 1px ${DIFFICULTY_COLORS[d]}40` } : undefined}
              >
                <span style={{ color: difficulty === d ? DIFFICULTY_COLORS[d] : undefined }}>{DIFFICULTY_LABELS[d]}</span>
              </button>
            ))}
          </div>
        </div>

        <Button fullWidth size="lg" icon="Sparkles" disabled={generating} onClick={handleGenerate}>
          {generating ? 'Generating...' : 'Generate Adventure'}
        </Button>

        {generating && (
          <GlassCard className="p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-zeviqo-400 border-t-transparent animate-spin" />
            <p className="text-sm text-white/60">Creating your adventure...</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
