import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getAdventures, ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type AdventureType } from '../data';

type FilterTab = 'all' | AdventureType | 'favorites';

const TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'Grid' },
  { key: 'explorer', label: 'Explorer', icon: 'Compass' },
  { key: 'treasure_hunt', label: 'Treasure', icon: 'Gem' },
  { key: 'relaxed_walk', label: 'Relaxed', icon: 'Leaf' },
  { key: 'challenge_run', label: 'Challenge', icon: 'Zap' },
  { key: 'favorites', label: 'Favorites', icon: 'Star' },
];

export function Adventures() {
  const { setScreen, setSelectedAdventure, favoriteAdventures, toggleFavoriteAdventure } = useStore();
  const [tab, setTab] = useState<FilterTab>('all');
  const allAdventures = getAdventures();

  const filtered = useMemo(() => {
    if (tab === 'all') return allAdventures;
    if (tab === 'favorites') return allAdventures.filter(a => favoriteAdventures.includes(a.id));
    return allAdventures.filter(a => a.type === tab);
  }, [tab, allAdventures, favoriteAdventures]);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Adventures" showCurrencies />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${tab === t.key ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}
            >
              <Icon name={t.icon} size={12} />
              {t.label}
            </button>
          ))}
        </div>

        <GlassCard className="p-4 flex items-center gap-3" onClick={() => setScreen('ai-generator')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nova-400 to-zeviqo-500 flex items-center justify-center">
            <Icon name="Sparkles" size={20} className="text-ink-950" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">AI Adventure Generator</p>
            <p className="text-[10px] text-white/40">Generate a unique adventure with AI</p>
          </div>
          <Icon name="ChevronRight" size={16} className="text-white/40" />
        </GlassCard>

        <div className="space-y-3">
          {filtered.map(adv => {
            const typeInfo = ADVENTURE_TYPES.find(t => t.type === adv.type);
            const isFav = favoriteAdventures.includes(adv.id);
            return (
              <GlassCard key={adv.id} className="p-4" onClick={() => { setSelectedAdventure(adv.id); setScreen('adventure-detail'); }}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{adv.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-white truncate">{adv.title}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteAdventure(adv.id); }}
                        className="flex-shrink-0 active:scale-90 transition-transform"
                      >
                        <Icon name="Star" size={16} className={isFav ? 'text-gold-400' : 'text-white/30'} style={isFav ? { fill: '#fbbf24' } : undefined} />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40 mb-2">{typeInfo?.label ?? adv.type}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Pill icon="Activity" accent="text-white/60 border-white/10">
                        <span style={{ color: DIFFICULTY_COLORS[adv.difficulty] }}>{DIFFICULTY_LABELS[adv.difficulty]}</span>
                      </Pill>
                      <Pill icon="Route">{adv.distance} km</Pill>
                      <Pill icon="Clock">{adv.duration} min</Pill>
                      <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{adv.xp} XP</Pill>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
          {filtered.length === 0 && (
            <GlassCard className="p-8 text-center">
              <Icon name="Compass" size={32} className="text-white/30 mx-auto mb-2" />
              <p className="text-sm text-white/40">No adventures found</p>
            </GlassCard>
          )}
        </div>

        <GlassCard className="p-4 flex items-center gap-3" onClick={() => setScreen('creator')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 to-ember-500 flex items-center justify-center">
            <Icon name="PenTool" size={20} className="text-ink-950" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Create Your Own</p>
            <p className="text-[10px] text-white/40">Design a custom adventure</p>
          </div>
          <Icon name="ChevronRight" size={16} className="text-white/40" />
        </GlassCard>
      </div>
      <BottomNav />
    </div>
  );
}
