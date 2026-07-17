import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { RoutePreview } from '../components/RoutePreview';
import { useStore } from '../store';
import { CURATED_ADVENTURES, DIFFICULTY_LABELS } from '../data';
import { formatDistance, formatDuration } from '../lib/map-utils';

export function AdventureDetail() {
  const { selectedAdventure, selectedAdventureObj, setScreen } = useStore();
  const adventure = selectedAdventureObj ?? CURATED_ADVENTURES.find(a => a.id === selectedAdventure);

  if (!adventure) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden pb-24">
        <AdventureBg />
        <div className="relative z-10"><TopBar title="Adventure" showBack />
          <div className="px-4 py-8 text-center text-white/40">Adventure not found.</div>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: 'MapPin', label: 'Distance', value: formatDistance(adventure.distance), color: 'text-cyan-300' },
    { icon: 'Clock', label: 'Duration', value: formatDuration(adventure.duration), color: 'text-white' },
    { icon: 'Flame', label: 'Calories', value: `${adventure.calories}`, color: 'text-ember-300' },
    { icon: 'Zap', label: 'XP', value: `+${adventure.xp}`, color: 'text-zeviqo-300' },
    { icon: 'Coins', label: 'Coins', value: `+${adventure.coins}`, color: 'text-gold-300' },
    { icon: 'Gem', label: 'Gems', value: `+${adventure.gems}`, color: 'text-plasma-300' },
    { icon: 'Mountain', label: 'Terrain', value: adventure.terrain, color: 'text-white' },
    { icon: 'Gauge', label: 'Difficulty', value: DIFFICULTY_LABELS[adventure.difficulty], color: 'text-ember-300' }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent={adventure.type === 'treasure_hunt' ? '#f5b800' : '#00c4ff'} />
      <div className="relative z-10">
        <TopBar title="Adventure Details" showBack />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zeviqo-400/20 to-plasma-500/20 flex items-center justify-center text-4xl">{adventure.emoji}</div>
            <div className="flex-1">
              <h2 className="text-lg font-display font-bold text-white">{adventure.title}</h2>
              <p className="text-xs text-white/40">{adventure.theme}</p>
              <div className="flex gap-1.5 mt-1.5">
                <Pill accent="text-ember-300 border-ember-500/30 capitalize">{DIFFICULTY_LABELS[adventure.difficulty]}</Pill>
                <Pill accent="text-white/60 border-white/10 capitalize">{adventure.type.replace('_', ' ')}</Pill>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/60">{adventure.description}</p>
          <RoutePreview route={adventure.route} color="#00c4ff" />
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase mb-2">Route Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              {stats.map(s => (
                <GlassCard key={s.label} className="p-3 flex items-center gap-2">
                  <Icon name={s.icon} size={16} className={s.color} />
                  <div>
                    <div className="text-[9px] font-bold uppercase text-white/40">{s.label}</div>
                    <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase mb-2">Objectives</h3>
            <div className="flex flex-col gap-2">
              {adventure.objectives.map((obj, i) => (
                <GlassCard key={i} className="p-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zeviqo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-zeviqo-300">{i + 1}</span>
                  </div>
                  <span className="text-sm text-white/70">{obj}</span>
                </GlassCard>
              ))}
            </div>
          </div>
          <Button size="lg" fullWidth icon="Play" onClick={() => setScreen('adventure-map')} className="mb-4">Start Adventure</Button>
        </div>
      </div>
    </div>
  );
}
