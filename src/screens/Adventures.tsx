import { useState } from 'react';
import { Icon, GlassCard, Pill, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import {
  ADVENTURES,
  DAILY_ADVENTURE_SEED,
  WEEKLY_ADVENTURE_SEED,
  type AdventureType,
  type Adventure,
  ADVENTURE_TYPE_META,
} from '../data';

type FilterTab = 'all' | AdventureType;

export function Adventures(): React.ReactElement {
  const { setScreen, setSelectedAdventure } = useStore();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filterTabs: { id: FilterTab; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'Compass' },
    ...(Object.entries(ADVENTURE_TYPE_META) as [AdventureType, { label: string; icon: string; accent: string }][]).map(
      ([id, meta]) => ({ id: id as FilterTab, label: meta.label, icon: meta.icon }),
    ),
  ];

  const filteredAdventures = ADVENTURES.filter((a) => {
    const isDailyOrWeekly = a.id === 'daily-seed' || a.id === 'weekly-seed';
    if (isDailyOrWeekly) return false;
    if (filter === 'all') return true;
    return a.type === filter;
  });

  function openAdventure(a: Adventure): void {
    setSelectedAdventure(a);
    setScreen('adventure-detail');
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="space" accent="#40f5cb" />

      <div className="relative z-10">
        <TopBar title="Adventures" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {filterTabs.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                      : 'glass text-white/60 hover:text-white'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Daily Adventure Card */}
          <div>
            <SectionTitle icon="Sun" accent="text-gold-300">
              Daily Adventure
            </SectionTitle>
            <GlassCard className="p-0 overflow-hidden mt-3" onClick={() => openAdventure(DAILY_ADVENTURE_SEED)}>
              <div className="relative h-36 overflow-hidden">
                <img
                  src={DAILY_ADVENTURE_SEED.image}
                  alt={DAILY_ADVENTURE_SEED.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Pill icon="Sun" accent="text-gold-300 border-gold-500/40 bg-ink-950/60">
                    Daily · 2x Rewards
                  </Pill>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-extrabold text-white">{DAILY_ADVENTURE_SEED.name}</h3>
                  <p className="text-xs text-white/60 mt-0.5 line-clamp-1">{DAILY_ADVENTURE_SEED.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-white/60">{DAILY_ADVENTURE_SEED.distanceKm} km</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs text-white/60">{DAILY_ADVENTURE_SEED.durationMin} min</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs font-bold text-nova-300">+{DAILY_ADVENTURE_SEED.xpReward} XP</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Weekly Adventure Card */}
          <div>
            <SectionTitle icon="CalendarStar" accent="text-plasma-300">
              Weekly Adventure
            </SectionTitle>
            <GlassCard className="p-0 overflow-hidden mt-3" onClick={() => openAdventure(WEEKLY_ADVENTURE_SEED)}>
              <div className="relative h-36 overflow-hidden">
                <img
                  src={WEEKLY_ADVENTURE_SEED.image}
                  alt={WEEKLY_ADVENTURE_SEED.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Pill icon="CalendarStar" accent="text-plasma-300 border-plasma-500/40 bg-ink-950/60">
                    Weekly · 3x Rewards
                  </Pill>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-extrabold text-white">{WEEKLY_ADVENTURE_SEED.name}</h3>
                  <p className="text-xs text-white/60 mt-0.5 line-clamp-1">{WEEKLY_ADVENTURE_SEED.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-white/60">{WEEKLY_ADVENTURE_SEED.distanceKm} km</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs text-white/60">{WEEKLY_ADVENTURE_SEED.durationMin} min</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs font-bold text-nova-300">+{WEEKLY_ADVENTURE_SEED.xpReward} XP</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* All Adventures List */}
          <div>
            <SectionTitle icon="Compass" accent="text-nova-300">
              All Adventures
            </SectionTitle>
            <div className="mt-3 flex flex-col gap-3">
              {filteredAdventures.map((adv) => {
                const meta = ADVENTURE_TYPE_META[adv.type];
                return (
                  <GlassCard key={adv.id} className="p-3 flex items-center gap-3" onClick={() => openAdventure(adv)}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={adv.image}
                        alt={adv.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">{adv.emoji}</span>
                        <h3 className="text-sm font-extrabold text-white truncate">{adv.name}</h3>
                      </div>
                      <p className="text-xs text-white/50 truncate">{adv.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Pill icon={meta.icon} accent="text-nova-300 border-nova-500/30">
                          {meta.label}
                        </Pill>
                        <span className="text-xs text-white/50">{adv.distanceKm} km</span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs font-bold text-nova-300">+{adv.xpReward} XP</span>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={18} className="text-white/40 flex-shrink-0" />
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* AI Generator CTA */}
          <GlassCard
            className="p-5 flex items-center gap-4 bg-gradient-to-r from-plasma-500/20 to-nova-500/20 border border-plasma-500/30"
            onClick={() => setScreen('ai-generator')}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center flex-shrink-0 shadow-glow-plasma">
              <Icon name="Sparkles" size={28} className="text-ink-950" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-white">Generate with AI</h3>
              <p className="text-xs text-white/60 mt-0.5">
                Create a custom adventure tailored to your preferences and location.
              </p>
            </div>
            <Icon name="ArrowRight" size={20} className="text-plasma-300" />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
