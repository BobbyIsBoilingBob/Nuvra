import { useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getAdventureById, ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, CHALLENGES } from '../data';
import { routeToLatLngs, DEFAULT_CENTER, formatDistance, formatDuration } from '../lib/map-utils';
import { MapView, type MapMarkerData, type MapRouteData } from '../components/MapView';

export function AdventureDetail() {
  const { selectedAdventureId, setScreen, setSelectedAdventureObj, favoriteAdventures, toggleFavoriteAdventure } = useStore();
  const adventure = getAdventureById(selectedAdventureId ?? '');

  const routeLatLngs = useMemo(() => {
    if (!adventure) return [];
    return routeToLatLngs(adventure.route, DEFAULT_CENTER);
  }, [adventure]);

  const mapMarkers: MapMarkerData[] = useMemo(() => {
    if (!adventure || routeLatLngs.length === 0) return [];
    return [
      { id: 'start', position: routeLatLngs[0], type: 'start', label: 'Start' },
      { id: 'finish', position: routeLatLngs[routeLatLngs.length - 1], type: 'finish', label: 'Finish' },
    ];
  }, [adventure, routeLatLngs]);

  const mapRoutes: MapRouteData[] = useMemo(() => {
    if (routeLatLngs.length < 2) return [];
    return [{ id: 'route', positions: routeLatLngs, color: '#00c4ff', weight: 4, animated: true }];
  }, [routeLatLngs]);

  if (!adventure) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AdventureBg />
        <div className="relative z-10 text-center">
          <p className="text-sm text-white/40">Adventure not found</p>
          <Button onClick={() => setScreen('adventures')} className="mt-4">Back to Adventures</Button>
        </div>
      </div>
    );
  }

  const typeInfo = ADVENTURE_TYPES.find(t => t.type === adventure.type);
  const isFav = favoriteAdventures.includes(adventure.id);
  const challengeList = adventure.challenges
    .map(id => CHALLENGES.find(c => c.id === id))
    .filter(Boolean);

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg accent={typeInfo?.color} />
      <TopBar title="Adventure Details" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="text-5xl">{adventure.emoji}</div>
            <button
              onClick={() => toggleFavoriteAdventure(adventure.id)}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform"
            >
              <Icon name="Star" size={18} className={isFav ? 'text-gold-400' : 'text-white/30'} style={isFav ? { fill: '#fbbf24' } : undefined} />
            </button>
          </div>
          <h1 className="text-xl font-display font-bold text-white mb-1">{adventure.title}</h1>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Pill icon={typeInfo?.icon ?? 'Compass'} accent="text-white/60 border-white/10">
              <span style={{ color: typeInfo?.color }}>{typeInfo?.label}</span>
            </Pill>
            <Pill accent="text-white/60 border-white/10">
              <span style={{ color: DIFFICULTY_COLORS[adventure.difficulty] }}>{DIFFICULTY_LABELS[adventure.difficulty]}</span>
            </Pill>
          </div>
          <p className="text-sm text-white/60">{adventure.description}</p>
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="glass rounded-xl p-2 text-center">
              <Icon name="Route" size={14} className="text-zeviqo-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-white">{formatDistance(adventure.distance)}</p>
            </div>
            <div className="glass rounded-xl p-2 text-center">
              <Icon name="Clock" size={14} className="text-white/50 mx-auto mb-1" />
              <p className="text-xs font-bold text-white">{formatDuration(adventure.duration * 60)}</p>
            </div>
            <div className="glass rounded-xl p-2 text-center">
              <Icon name="Zap" size={14} className="text-zeviqo-300 mx-auto mb-1" />
              <p className="text-xs font-bold text-white">+{adventure.xp}</p>
            </div>
            <div className="glass rounded-xl p-2 text-center">
              <Icon name="Coins" size={14} className="text-gold-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-white">+{adventure.coins}</p>
            </div>
          </div>
        </GlassCard>

        <div>
          <SectionTitle icon="Map">Route Preview</SectionTitle>
          <GlassCard className="p-0 overflow-hidden h-48">
            <MapView center={DEFAULT_CENTER} zoom={14} markers={mapMarkers} routes={mapRoutes} />
          </GlassCard>
        </div>

        <div>
          <SectionTitle icon="Target">Objectives</SectionTitle>
          <GlassCard className="p-3 space-y-2">
            {adventure.objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full glass flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-zeviqo-300">{i + 1}</span>
                </div>
                <p className="text-xs text-white/70">{obj}</p>
              </div>
            ))}
          </GlassCard>
        </div>

        {challengeList.length > 0 && (
          <div>
            <SectionTitle icon="Swords">Challenges</SectionTitle>
            <div className="space-y-2">
              {challengeList.map(ch => ch && (
                <GlassCard key={ch.id} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0">
                    <Icon name={ch.icon} size={16} className="text-ember-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{ch.title}</p>
                    <p className="text-[10px] text-white/40">{ch.description}</p>
                  </div>
                  <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{ch.xpReward}</Pill>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        <Button
          fullWidth
          size="lg"
          icon="Play"
          onClick={() => { setSelectedAdventureObj(adventure); setScreen('adventure-map'); }}
        >
          Start Adventure
        </Button>
      </div>
    </div>
  );
}
