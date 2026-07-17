import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, Pill, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { RoutePreview } from '../components/RoutePreview';
import { ADVENTURE_TYPES, DIFFICULTY_LABELS, type Adventure } from '../data';
import { formatDistance, formatDuration } from '../lib/map-utils';

export function AdventureDetail() {
  const { selectedAdventureObj, setScreen, favoriteAdventures, toggleFavoriteAdventure } = useStore();
  const adventure: Adventure | null = selectedAdventureObj;

  if (!adventure) {
    return (
      <div className="relative min-h-screen">
        <AdventureBg />
        <TopBar title="Adventure" showBack showCurrencies={false} />
        <div className="px-6 py-20 text-center">
          <p className="text-sm text-white/40">Adventure not found.</p>
          <Button size="md" className="mt-4" onClick={() => setScreen('adventures')}>Browse Adventures</Button>
        </div>
      </div>
    );
  }

  const typeInfo = ADVENTURE_TYPES.find(t => t.type === adventure.type);
  const isFav = favoriteAdventures.includes(adventure.id);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent={typeInfo?.color} />
      <TopBar title="Adventure Details" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 animate-slide-up">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl glass flex items-center justify-center text-3xl">{adventure.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-white">{adventure.title}</h2>
                <button onClick={() => toggleFavoriteAdventure(adventure.id)}>
                  <Icon name="Star" size={16} className={isFav ? 'text-gold-400 fill-gold-400' : 'text-white/30'} />
                </button>
              </div>
              <p className="text-xs text-white/40 mt-0.5">{adventure.theme} · {adventure.terrain}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Pill accent="text-zeviqo-300 border-zeviqo-500/20">{typeInfo?.label}</Pill>
                <Pill accent="text-white/40">{DIFFICULTY_LABELS[adventure.difficulty]}</Pill>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{adventure.description}</p>
        </GlassCard>

        <div className="animate-slide-up">
          <RoutePreview route={adventure.route} color={typeInfo?.color ?? '#00c4ff'} animated />
        </div>

        <div className="grid grid-cols-4 gap-2 animate-slide-up">
          {[
            { icon: 'Route', label: 'Distance', value: formatDistance(adventure.distance), color: 'text-zeviqo-400' },
            { icon: 'Clock', label: 'Duration', value: formatDuration(adventure.duration), color: 'text-white/60' },
            { icon: 'Flame', label: 'Calories', value: `${adventure.calories}`, color: 'text-ember-400' },
            { icon: 'Zap', label: 'XP', value: `${adventure.xp}`, color: 'text-zeviqo-400' }
          ].map(s => (
            <GlassCard key={s.label} className="p-2.5 flex flex-col items-center text-center">
              <Icon name={s.icon} size={16} className={s.color} />
              <span className="text-[11px] font-bold text-white mt-1">{s.value}</span>
              <span className="text-[9px] text-white/40">{s.label}</span>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-4 animate-slide-up">
          <h3 className="text-sm font-display font-bold text-white mb-3">Objectives</h3>
          <div className="space-y-2">
            {adventure.objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full glass flex items-center justify-center text-[10px] font-bold text-zeviqo-400">{i+1}</div>
                <span className="text-xs text-white/60">{obj}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex items-center gap-2 animate-slide-up">
          <Pill icon="Coins" accent="text-gold-300 border-gold-500/20">{adventure.coins} coins</Pill>
          {adventure.gems > 0 && <Pill icon="Gem" accent="text-cyan-300 border-cyan-500/20">{adventure.gems} gems</Pill>}
        </div>

        <Button fullWidth size="lg" icon="Play" className="animate-slide-up" onClick={() => setScreen('adventure-map')}>Start Adventure</Button>
      </div>
    </div>
  );
}
