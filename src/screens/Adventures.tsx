import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { GlassCard, Icon, Button, Pill, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { RoutePreview } from '../components/RoutePreview';
import { CURATED_ADVENTURES, ADVENTURE_TYPES, DIFFICULTY_LABELS, generateAdventure, type AdventureType, type Difficulty, type Adventure } from '../data';
import { formatDistance } from '../lib/map-utils';

export function Adventures() {
  const { setScreen, setSelectedAdventureObj, favoriteAdventures, toggleFavoriteAdventure } = useStore();
  const [filter, setFilter] = useState<AdventureType | 'all'>('all');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [generating, setGenerating] = useState(false);

  const adventures = useMemo(() => CURATED_ADVENTURES, []);

  const filtered = adventures.filter(a => {
    if (filter !== 'all' && a.type !== filter) return false;
    if (diffFilter !== 'all' && a.difficulty !== diffFilter) return false;
    if (showFavOnly && !favoriteAdventures.includes(a.id)) return false;
    return true;
  });

  const openDetail = (a: Adventure) => { setSelectedAdventureObj(a); setScreen('adventure-detail'); };

  const generateNew = () => {
    setGenerating(true);
    setTimeout(() => {
      const a = generateAdventure({ type: filter === 'all' ? undefined : filter, difficulty: diffFilter === 'all' ? undefined : diffFilter });
      setGenerating(false);
      openDetail(a);
    }, 400);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <div className="relative z-10 px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between animate-fade-in">
          <h1 className="text-xl font-display font-bold text-white">Adventures</h1>
          <Button size="sm" icon="Sparkles" onClick={generateNew} disabled={generating}>{generating ? 'Generating...' : 'Generate'}</Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar animate-fade-in">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter==='all'?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>All</button>
          {ADVENTURE_TYPES.map(t => (
            <button key={t.type} onClick={() => setFilter(t.type)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter===t.type?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>{t.emoji} {t.label}</button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setDiffFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${diffFilter==='all'?'glass-strong text-white':'glass text-white/50'}`}>Any Difficulty</button>
          {(['relaxed','easy','medium','hard','extreme'] as Difficulty[]).map(d => (
            <button key={d} onClick={() => setDiffFilter(d)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${diffFilter===d?'glass-strong text-white':'glass text-white/50'}`}>{DIFFICULTY_LABELS[d]}</button>
          ))}
          <button onClick={() => setShowFavOnly(!showFavOnly)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${showFavOnly?'bg-gold-500 text-ink-950':'glass text-white/50'}`}><Icon name="Star" size={10} />Favorites</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="Compass" title="No adventures found" desc="Try adjusting your filters or generate a new adventure." action={<Button size="sm" icon="Sparkles" onClick={generateNew}>Generate One</Button>} />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(a => (
              <GlassCard key={a.id} className="p-4 animate-slide-up" onClick={() => openDetail(a)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl">{a.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-display font-bold text-white truncate">{a.title}</h4>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavoriteAdventure(a.id); }} className="flex-shrink-0">
                        <Icon name={favoriteAdventures.includes(a.id) ? 'Star' : 'Star'} size={14} className={favoriteAdventures.includes(a.id) ? 'text-gold-400 fill-gold-400' : 'text-white/30'} />
                      </button>
                    </div>
                    <p className="text-[11px] text-white/40 truncate">{a.theme} · {a.terrain}</p>
                  </div>
                </div>
                <RoutePreview route={a.route} color={ADVENTURE_TYPES.find(t => t.type === a.type)?.color ?? '#00c4ff'} animated={false} />
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Pill icon="Route">{formatDistance(a.distance)}</Pill>
                  <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/20">{a.xp} XP</Pill>
                  <Pill icon="Coins" accent="text-gold-300 border-gold-500/20">{a.coins}</Pill>
                  <Pill accent="text-white/40">{DIFFICULTY_LABELS[a.difficulty]}</Pill>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
