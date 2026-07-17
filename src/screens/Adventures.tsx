import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { BottomNav } from '../components/BottomNav';
import { getAdventures, ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type AdventureType, type Difficulty } from '../data';

export function Adventures() {
  const { setScreen, setSelectedAdventure, favoriteAdventures } = useStore();
  const [filter, setFilter] = useState<AdventureType | 'all' | 'favorites'>('all');
  const all = getAdventures();
  const filtered = useMemo(() => {
    if (filter === 'all') return all;
    if (filter === 'favorites') return all.filter(a => favoriteAdventures.includes(a.id));
    return all.filter(a => a.type === filter);
  }, [all, filter, favoriteAdventures]);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Adventures" showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} icon="Grid" label="All" />
          {ADVENTURE_TYPES.map(t => (
            <FilterChip key={t.type} active={filter === t.type} onClick={() => setFilter(t.type)} icon={t.icon} label={t.label} />
          ))}
          <FilterChip active={filter === 'favorites'} onClick={() => setFilter('favorites')} icon="Star" label="Favorites" />
        </div>

        {/* Adventure list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Compass" size={32} className="text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/40">No adventures found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(adv => {
              const typeInfo = ADVENTURE_TYPES.find(t => t.type === adv.type);
              const isFav = favoriteAdventures.includes(adv.id);
              return (
                <GlassCard key={adv.id} className="overflow-hidden animate-slide-up" onClick={() => { setSelectedAdventure(adv.id); setScreen('adventure-detail'); }}>
                  <div className="flex">
                    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center text-3xl" style={{ background: `${typeInfo?.color}22` }}>{adv.emoji}</div>
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{adv.title}</p>
                          <p className="text-[10px] text-white/40">{typeInfo?.label} · {DIFFICULTY_LABELS[adv.difficulty]}</p>
                        </div>
                        {isFav && <Icon name="Star" size={14} className="text-gold-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-white/50 mt-1 line-clamp-2">{adv.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Pill icon="Route" accent="text-zeviqo-300 border-zeviqo-500/30">{adv.distance} km</Pill>
                        <Pill icon="Clock" accent="text-white/50 border-white/10">{adv.duration} min</Pill>
                        <Pill icon="Zap" accent="text-gold-300 border-gold-500/30">+{adv.xp} XP</Pill>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* AI Generator CTA */}
        <GlassCard className="p-4 flex items-center gap-3 border-zeviqo-500/20" onClick={() => setScreen('ai-generator')}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zeviqo-400 to-nova-500 flex items-center justify-center">
            <Icon name="Sparkles" size={24} className="text-ink-950" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">AI Adventure Generator</p>
            <p className="text-[10px] text-white/40">Create custom adventures with AI</p>
          </div>
          <Icon name="ChevronRight" size={16} className="text-white/40" />
        </GlassCard>

        <Button fullWidth variant="secondary" icon="PenTool" onClick={() => setScreen('creator')}>Create Your Own Adventure</Button>
      </div>
      <BottomNav />
    </div>
  );
}

function FilterChip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button onClick={onClick} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${active ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>
      <Icon name={icon} size={12} />{label}
    </button>
  );
}
