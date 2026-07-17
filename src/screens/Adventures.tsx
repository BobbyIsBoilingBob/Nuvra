import { useState, useMemo } from 'react';
import { Icon, GlassCard, Pill, Button, Spinner } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ADVENTURES, ADVENTURE_THEMES, ADVENTURE_TYPES, generateAdventure, type DifficultyPref, type Adventure } from '../data';

const DIFFICULTIES: (DifficultyPref | 'All')[] = ['All','Relaxed','Easy','Medium','Hard','Extreme'];

export function Adventures(): React.ReactElement {
  const { setScreen, setSelectedAdventure, setSelectedAdventureObj, profile, stats, walkingStreak, generatedAdventures, addGeneratedAdventure, recentAdventureTypes } = useStore();
  const [filter, setFilter] = useState<DifficultyPref | 'All'>('All');
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const allAdventures = useMemo(() => [...generatedAdventures, ...ADVENTURES], [generatedAdventures]);

  const filtered = useMemo(() => {
    return allAdventures.filter(a => {
      if (filter !== 'All' && a.difficulty !== filter) return false;
      if (themeFilter && a.theme !== themeFilter) return false;
      if (typeFilter && a.type !== typeFilter) return false;
      return true;
    });
  }, [allAdventures, filter, themeFilter, typeFilter]);

  const handleSelect = (adventure: Adventure) => {
    setSelectedAdventure(adventure.id);
    setSelectedAdventureObj(adventure);
    setScreen('adventure-detail');
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const adventure = generateAdventure({
        playerLevel: Math.floor(Math.sqrt(profile.xp / 100)) + 1,
        walkingStreak,
        totalAdventures: stats.totalAdventures,
        recentTypes: recentAdventureTypes,
        playerCount: 1,
        preferredDifficulty: profile.preferences.difficulty,
        preferredLength: profile.preferences.length,
        preferredStyle: profile.preferences.style,
      });
      addGeneratedAdventure(adventure);
      setGenerating(false);
      handleSelect(adventure);
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#3dd4ff" />
      <div className="relative z-10">
        <TopBar title="Adventures" showCurrencies />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          <GlassCard className="p-4 cursor-pointer hover:bg-white/[0.1] transition-all" onClick={generating ? undefined : handleGenerate}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-ember-500 flex items-center justify-center">
                {generating ? <Spinner size={20} className="border-ink-950/30 border-t-ink-950" /> : <Icon name="Sparkles" size={24} className="text-ink-950" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-white">{generating ? 'Generating...' : 'AI Adventure Generator'}</div>
                <div className="text-xs text-white/50">{generating ? 'Creating a unique adventure for you' : 'Generate a custom adventure tailored to your level'}</div>
              </div>
              {!generating && <Icon name="ChevronRight" size={20} className="text-white/30" />}
            </div>
          </GlassCard>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setTypeFilter(null)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!typeFilter?'bg-gradient-to-r from-zeviqo-400 to-cyan-400 text-ink-950':'glass text-white/60'}`}>All Types</button>
            {ADVENTURE_TYPES.map(t => (
              <button key={t.id} onClick={() => setTypeFilter(t.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${typeFilter===t.id?'bg-gradient-to-r from-zeviqo-400 to-cyan-400 text-ink-950':'glass text-white/60'}`}>{t.emoji} {t.label}</button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setThemeFilter(null)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!themeFilter?'bg-gradient-to-r from-plasma-400 to-zeviqo-500 text-ink-950':'glass text-white/60'}`}>All Themes</button>
            {ADVENTURE_THEMES.map(t => (
              <button key={t.id} onClick={() => setThemeFilter(t.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${themeFilter===t.id?'bg-gradient-to-r from-plasma-400 to-zeviqo-500 text-ink-950':'glass text-white/60'}`}>{t.emoji} {t.name}</button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setFilter(d)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter===d?'bg-gradient-to-r from-ember-400 to-gold-500 text-ink-950':'glass text-white/60'}`}>{d}</button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map(a => (
              <GlassCard key={a.id} className="p-4 cursor-pointer hover:bg-white/[0.1] transition-all active:scale-[0.98]" onClick={() => handleSelect(a)}>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plasma-400 to-zeviqo-500 flex items-center justify-center text-3xl flex-shrink-0">{a.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{a.name}</span>
                      {a.isGenerated && <Pill icon="Sparkles" accent="text-gold-300 border-gold-500/30">AI</Pill>}
                    </div>
                    <div className="text-xs text-white/50 line-clamp-2 mt-0.5">{a.description}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Pill icon="MapPin" accent="text-cyan-300 border-cyan-500/30">{a.distanceKm} km</Pill>
                      <Pill icon="Clock" accent="text-white/60 border-white/10">{a.durationMin} min</Pill>
                      <Pill icon="Flame" accent="text-ember-300 border-ember-500/30">{a.caloriesEstimate} cal</Pill>
                      <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{a.xpReward} XP</Pill>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Icon name="SearchX" size={32} className="text-white/20 mb-3" />
              <p className="text-sm text-white/40">No adventures match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
