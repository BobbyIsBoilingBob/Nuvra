import { Icon, GlassCard, Button, Pill, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { CHALLENGES, ADVENTURE_TYPE_META, TREASURE_RARITY_MAP } from '../data';

export function AdventureDetail(): React.ReactElement {
  const { selectedAdventure, setScreen } = useStore();

  if (!selectedAdventure) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AdventureBg />
        <TopBar showBack showCurrencies />
        <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 text-white/40">
            <Icon name="Compass" size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No adventure selected</h3>
          <p className="text-sm text-white/50 mb-5">Choose an adventure to view its details.</p>
          <Button variant="secondary" icon="ArrowLeft" onClick={() => setScreen('adventures')}>
            Browse Adventures
          </Button>
        </div>
      </div>
    );
  }

  const adv = selectedAdventure;
  const typeMeta = ADVENTURE_TYPE_META[adv.type];
  const challengeDefs = adv.challenges
    .map((id) => CHALLENGES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const stats = [
    { icon: 'Footprints', label: 'Distance', value: `${adv.distanceKm} km`, accent: 'text-nova-300' },
    { icon: 'Clock', label: 'Duration', value: `${adv.durationMin} min`, accent: 'text-cyan-300' },
    { icon: 'Zap', label: 'XP', value: `+${adv.xpReward}`, accent: 'text-gold-300' },
    { icon: 'Coins', label: 'Coins', value: `+${adv.coinReward}`, accent: 'text-ember-300' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#40f5cb" />

      <div className="relative z-10">
        <TopBar showBack showCurrencies />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Hero image */}
          <div className="relative h-56 rounded-2xl overflow-hidden">
            <img
              src={adv.image}
              alt={adv.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Pill icon={typeMeta.icon} accent={`text-white border-white/20 bg-ink-950/60`}>
                {typeMeta.label}
              </Pill>
              <Pill icon="Flame" accent="text-ember-300 border-ember-500/40 bg-ink-950/60">
                {adv.difficulty}
              </Pill>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{adv.emoji}</span>
                <h2 className="text-xl font-extrabold text-white">{adv.name}</h2>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/70 leading-relaxed">{adv.description}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
                <div className={`w-9 h-9 rounded-xl glass flex items-center justify-center ${s.accent}`}>
                  <Icon name={s.icon} size={16} />
                </div>
                <div className="text-sm font-bold text-white">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Challenges */}
          {challengeDefs.length > 0 && (
            <div>
              <SectionTitle icon="Swords" accent="text-ember-300">
                Challenges
              </SectionTitle>
              <div className="mt-3 flex flex-col gap-2">
                {challengeDefs.map((c) => (
                  <GlassCard key={c.id} className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={c.icon} size={18} className="text-ink-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      <p className="text-xs text-white/50 truncate">{c.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Pill accent="text-ember-300 border-ember-500/30">{c.difficulty}</Pill>
                      <span className="text-xs font-bold text-gold-300">+{c.baseReward}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Rewards preview */}
          {adv.treasures.length > 0 && (
            <div>
              <SectionTitle icon="Gem" accent="text-gold-300">
                Rewards Preview
              </SectionTitle>
              <div className="mt-3 flex flex-col gap-2">
                {adv.treasures.map((t) => {
                  const rarity = TREASURE_RARITY_MAP[t.rarity];
                  return (
                    <GlassCard key={t.id} className="p-3 flex items-center gap-3">
                      <div className="text-2xl flex-shrink-0">{rarity.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white capitalize">{t.rarity} Treasure</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gold-300 font-bold">+{t.coins} coins</span>
                          <span className="text-xs text-white/30">·</span>
                          <span className="text-xs text-nova-300 font-bold">+{t.xp} XP</span>
                        </div>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold border"
                        style={{ color: rarity.color, borderColor: `${rarity.color}40` }}
                      >
                        {rarity.label}
                      </span>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Start button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon="Play"
            onClick={() => setScreen('adventure-map')}
          >
            Start Adventure
          </Button>
        </div>
      </div>
    </div>
  );
}
