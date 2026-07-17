import { useState, useMemo } from 'react';
import { Icon, GlassCard, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ADVENTURES, ADVENTURE_THEMES, type DifficultyPref } from '../data';

const DIFFICULTIES: (DifficultyPref | 'All')[] = ['All', 'Relaxed', 'Easy', 'Medium', 'Hard', 'Extreme'];

export function Adventures(): React.ReactElement {
  const { setScreen, setSelectedAdventure } = useStore();
  const [filter, setFilter] = useState<DifficultyPref | 'All'>('All');
  const [themeFilter, setThemeFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ADVENTURES.filter((a) => {
      if (filter !== 'All' && a.difficulty !== filter) return false;
      if (themeFilter && a.theme !== themeFilter) return false;
      return true;
    });
  }, [filter, themeFilter]);

  const handleSelect = (id: string) => {
    setSelectedAdventure(id);
    setScreen('adventure-detail');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#33ffd6" />
      <div className="relative z-10">
        <TopBar title="Adventures" showCurrencies />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Theme filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setThemeFilter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!themeFilter ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950' : 'glass text-white/60'}`}
            >
              All
            </button>
            {ADVENTURE_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${themeFilter === t.id ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950' : 'glass text-white/60'}`}
              >
                {t.emoji} {t.name}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === d ? 'bg-gradient-to-r from-plasma-400 to-nova-500 text-ink-950' : 'glass text-white/60'}`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Adventure list */}
          <div className="flex flex-col gap-3">
            {filtered.map((a) => (
              <GlassCard key={a.id} className="p-4 cursor-pointer hover:bg-white/[0.1] transition-all active:scale-[0.98]" onClick={() => handleSelect(a.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-3xl flex-shrink-0">
                    {a.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white">{a.name}</div>
                    <div className="text-xs text-white/50 line-clamp-2 mt-0.5">{a.description}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Pill icon="MapPin" accent="text-cyan-300 border-cyan-500/30">{a.distanceKm} km</Pill>
                      <Pill icon="Clock" accent="text-white/60 border-white/10">{a.durationMin} min</Pill>
                      <Pill icon="Zap" accent="text-nova-300 border-nova-500/30">+{a.xpReward} XP</Pill>
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

          {/* AI Generator */}
          <GlassCard className="p-4 cursor-pointer hover:bg-white/[0.1] transition-all" onClick={() => setScreen('ai-generator')}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-ember-500 flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-ink-950" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-white">AI Adventure Generator</div>
                <div className="text-xs text-white/50">Create a custom adventure tailored to you</div>
              </div>
              <Icon name="ChevronRight" size={20} className="text-white/30" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
