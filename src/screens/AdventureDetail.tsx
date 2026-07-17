import { useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getAdventureById, ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, CHALLENGES } from '../data';
import { routeToLatLngs, DEFAULT_CENTER, formatDistance, formatDuration } from '../lib/map-utils';
import { MapView, type MapMarkerData, type MapRouteData } from '../components/MapView';

export function AdventureDetail() {
  const { selectedAdventureId, setScreen, favoriteAdventures, toggleFavoriteAdventure } = useStore();
  const adventure = getAdventureById(selectedAdventureId ?? '');
  const typeInfo = ADVENTURE_TYPES.find(t => t.type === adventure?.type);
  const isFav = adventure ? favoriteAdventures.includes(adventure.id) : false;

  const routeLatLngs = useMemo(() => adventure ? routeToLatLngs(adventure.route, DEFAULT_CENTER, 800) : [], [adventure]);
  const mapMarkers: MapMarkerData[] = useMemo(() => {
    if (routeLatLngs.length === 0) return [];
    return [
      { id: 'start', position: routeLatLngs[0], type: 'start', label: 'Start', color: '#22c55e' },
      { id: 'finish', position: routeLatLngs[routeLatLngs.length - 1], type: 'finish', label: 'Finish', color: '#fbbf24' },
    ];
  }, [routeLatLngs]);
  const mapRoutes: MapRouteData[] = useMemo(() => {
    if (routeLatLngs.length < 2) return [];
    return [{ id: 'adv-route', positions: routeLatLngs, color: typeInfo?.color ?? '#00c4ff', weight: 4, animated: true }];
  }, [routeLatLngs, typeInfo?.color]);

  if (!adventure) {
    return (
      <div className="relative min-h-screen">
        <AdventureBg />
        <TopBar title="Adventure" showBack />
        <div className="px-6 py-20 text-center"><p className="text-sm text-white/40">Adventure not found.</p>
        <Button className="mt-4" onClick={() => setScreen('adventures')}>Browse Adventures</Button></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent={typeInfo?.color} />
      <TopBar title={adventure.title} showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        {/* Hero */}
        <GlassCard className="p-4 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${typeInfo?.color}22` }}>{adventure.emoji}</div>
            <div className="flex-1">
              <h2 className="text-base font-display font-bold text-white">{adventure.title}</h2>
              <p className="text-[10px] text-white/40">{typeInfo?.label} · {DIFFICULTY_LABELS[adventure.difficulty]}</p>
            </div>
            <button onClick={() => toggleFavoriteAdventure(adventure.id)} className="w-9 h-9 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform">
              <Icon name="Star" size={16} className={isFav ? 'text-gold-400 fill-gold-400' : 'text-white/40'} />
            </button>
          </div>
          <p className="text-xs text-white/60">{adventure.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Pill icon="Route" accent="text-zeviqo-300 border-zeviqo-500/30">{formatDistance(adventure.distance)}</Pill>
            <Pill icon="Clock" accent="text-white/50 border-white/10">{formatDuration(adventure.duration * 60)}</Pill>
            <Pill icon="Zap" accent="text-gold-300 border-gold-500/30">+{adventure.xp} XP</Pill>
            <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{adventure.coins}</Pill>
            {adventure.gems > 0 && <Pill icon="Gem" accent="text-zeviqo-300 border-zeviqo-500/30">+{adventure.gems}</Pill>}
          </div>
        </GlassCard>

        {/* Map preview */}
        <div className="animate-slide-up h-48 rounded-2xl overflow-hidden glass">
          <MapView center={DEFAULT_CENTER} zoom={15} markers={mapMarkers} routes={mapRoutes} className="h-full" />
        </div>

        {/* Objectives */}
        <GlassCard className="p-4 animate-slide-up">
          <h3 className="text-sm font-bold text-white mb-3">Objectives</h3>
          <div className="space-y-2">
            {adventure.objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full glass flex items-center justify-center"><span className="text-[10px] font-bold text-white/40">{i + 1}</span></div>
                <span className="text-xs text-white/60">{obj}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Challenges */}
        {adventure.challenges.length > 0 && (
          <GlassCard className="p-4 animate-slide-up">
            <h3 className="text-sm font-bold text-white mb-3">Challenges</h3>
            <div className="space-y-2">
              {adventure.challenges.map(chId => {
                const ch = CHALLENGES.find(c => c.id === chId);
                if (!ch) return null;
                return (
                  <div key={ch.id} className="flex items-center gap-3 glass rounded-xl p-3">
                    <div className="w-8 h-8 rounded-lg bg-ember-500/20 flex items-center justify-center"><Icon name={ch.icon} size={14} className="text-ember-400" /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{ch.title}</p>
                      <p className="text-[10px] text-white/40">{ch.description}</p>
                    </div>
                    <Pill icon="Zap" accent="text-gold-300 border-gold-500/30">+{ch.xpReward}</Pill>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* Start button */}
        <Button fullWidth size="lg" icon="Play" onClick={() => setScreen('adventure-map')}>Start Adventure</Button>
      </div>
    </div>
  );
}
