import { useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, generateAdventure, type AdventureType, type Difficulty } from '../data';

export function Creator() {
  const { setScreen, setSelectedAdventureObj } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    if (name.trim().length < 3) { setError('Name must be at least 3 characters.'); return; }
    if (description.trim().length < 10) { setError('Description must be at least 10 characters.'); return; }
    setError(null);
    const seed = Math.floor(Math.random() * 10000) + 1;
    const base = generateAdventure(seed, type, difficulty);
    const custom = {
      ...base,
      id: `custom-${Date.now()}`,
      title: name.trim(),
      description: description.trim(),
    };
    setSelectedAdventureObj(custom);
    setScreen('adventure-preview');
  }

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg accent="#fbbf24" />
      <TopBar title="Create Adventure" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5 text-center">
          <div className="text-4xl mb-2">🎨</div>
          <h2 className="text-lg font-display font-bold text-white">Custom Adventure</h2>
          <p className="text-xs text-white/40 mt-1">Design your own walking adventure</p>
        </GlassCard>

        {error && (
          <GlassCard className="p-3 flex items-center gap-2 border-rose-500/20">
            <Icon name="AlertCircle" size={14} className="text-rose-400" />
            <p className="text-xs text-rose-300">{error}</p>
          </GlassCard>
        )}

        <GlassCard className="p-4 space-y-3">
          <div>
            <label className="text-xs text-white/50 font-semibold mb-1 block">Adventure Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Custom Trail"
              maxLength={40}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 font-semibold mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your adventure..."
              maxLength={200}
              rows={3}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40 resize-none"
            />
          </div>
        </GlassCard>

        <div>
          <h3 className="text-sm font-bold text-white mb-2">Type</h3>
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

        <Button fullWidth size="lg" icon="Rocket" onClick={handleCreate}>
          Create & Preview
        </Button>
      </div>
    </div>
  );
}
