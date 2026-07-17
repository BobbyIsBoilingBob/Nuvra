import { useState, useMemo } from 'react';
import { GlassCard, Icon, Pill, Button, Spinner } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ADVENTURE_TYPES, CURATED_ADVENTURES, generateAdventure, DIFFICULTY_LABELS, type AdventureType, type Difficulty } from '../data';

export function Adventures() {
  const { setScreen, setSelectedAdventure, setSelectedAdventureObj } = useStore();
  const [filterType, setFilterType] = useState<AdventureType | 'all'>('all');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');
  const [generating, setGenerating] = useState(false);

  const filtered = useMemo(() => {
    return CURATED_ADVENTURES.filter(a =>
      (filterType === 'all' || a.type === filterType) &&
      (filterDiff === 'all' || a.difficulty === filterDiff)
    );
  }, [filterType, filterDiff]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const adv = generateAdventure({
        type: filterType !== 'all' ? filterType : undefined,
        difficulty: filterDiff !== 'all' ? filterDiff : undefined
      });
      setSelectedAdventure(adv.id);
      setSelectedAdventureObj(adv);
      setGenerating(false);
      setScreen('adventure-detail');
    }, 800);
  };

  const openAdventure = (id: string) => {
    const adv = CURATED_ADVENTURES.find(a => a.id === id);
    if (adv) { setSelectedAdventure(id); setSelectedAdventureObj(adv); setScreen('adventure-detail'); }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg />
      <div className="relative z-10">
        <TopBar title="Adventures" />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zeviqo-400 to-plasma-500 flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-ink-950" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">AI Adventure Generator</div>
                <div className="text-xs text-white/50">Generate a unique adventure</div>
              </div>
              <Button size="sm" icon="Wand2" onClick={handleGenerate} disabled={generating}>
                {generating ? <Spinner size={14} /> : 'Generate'}
              </Button>
            </div>
          </GlassCard>

          <div>
            <div className="text-xs font-bold text-white/40 uppercase mb-2">Type</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterType==='all'?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>All</button>
              {ADVENTURE_TYPES.map(t => (
                <button key={t.type} onClick={() => setFilterType(t.type)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterType===t.type?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>{t.emoji} {t.label}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-white/40 uppercase mb-2">Difficulty</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterDiff('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterDiff==='all'?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>All</button>
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
                <button key={d} onClick={() => setFilterDiff(d)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${filterDiff===d?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>{DIFFICULTY_LABELS[d]}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">No adventures match your filters.</div>
            ) : filtered.map(adv => (
              <GlassCard key={adv.id} className="p-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => openAdventure(adv.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zeviqo-400/20 to-plasma-500/20 flex items-center justify-center text-3xl">{adv.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{adv.title}</div>
                    <div className="text-xs text-white/40 truncate">{adv.theme}</div>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <Pill icon="MapPin" accent="text-cyan-300 border-cyan-500/30">{adv.distance} km</Pill>
                      <Pill icon="Clock" accent="text-white/60 border-white/10">{Math.round(adv.duration/60)}m</Pill>
                      <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{adv.xp}</Pill>
                      <Pill accent="text-ember-300 border-ember-500/30 capitalize">{DIFFICULTY_LABELS[adv.difficulty]}</Pill>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-white/30" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
