import { useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';
import { routeToLatLngs, DEFAULT_CENTER, formatDistance, formatDuration } from '../lib/map-utils';
import { MapView, type MapMarkerData, type MapRouteData } from '../components/MapView';

export function AdventurePreview() {
  const { selectedAdventureObj, setScreen, setSelectedAdventureObj } = useStore();
  const adventure = selectedAdventureObj;

  const routeLatLngs = useMemo(() => {
    if (!adventure) return [];
    return routeToLatLngs(adventure.route, DEFAULT_CENTER);
  }, [adventure]);

  const mapMarkers: MapMarkerData[] = useMemo(() => {
    if (routeLatLngs.length === 0) return [];
    return [
      { id: 'start', position: routeLatLngs[0], type: 'start', label: 'Start' },
      { id: 'finish', position: routeLatLngs[routeLatLngs.length - 1], type: 'finish', label: 'Finish' },
    ];
  }, [routeLatLngs]);

  const mapRoutes: MapRouteData[] = useMemo(() => {
    if (routeLatLngs.length < 2) return [];
    return [{ id: 'route', positions: routeLatLngs, color: '#8b5cf6', weight: 4, animated: true }];
  }, [routeLatLngs]);

  if (!adventure) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AdventureBg accent="#8b5cf6" />
        <div className="relative z-10 text-center">
          <p className="text-sm text-white/40">No generated adventure found</p>
          <Button onClick={() => setScreen('ai-generator')} className="mt-4">Generate One</Button>
        </div>
      </div>
    );
  }

  const typeInfo = ADVENTURE_TYPES.find(t => t.type === adventure.type);

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Preview" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-4xl">{adventure.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Pill icon="Sparkles" accent="text-nova-300 border-nova-500/30">AI Generated</Pill>
              </div>
              <h1 className="text-lg font-display font-bold text-white">{adventure.title}</h1>
            </div>
          </div>
          <p className="text-sm text-white/60 mb-3">{adventure.description}</p>
          <div className="flex flex-wrap gap-1.5">
            <Pill icon={typeInfo?.icon ?? 'Compass'} accent="text-white/60 border-white/10">
              <span style={{ color: typeInfo?.color }}>{typeInfo?.label}</span>
            </Pill>
            <Pill accent="text-white/60 border-white/10">
              <span style={{ color: DIFFICULTY_COLORS[adventure.difficulty] }}>{DIFFICULTY_LABELS[adventure.difficulty]}</span>
            </Pill>
            <Pill icon="Route">{formatDistance(adventure.distance)}</Pill>
            <Pill icon="Clock">{formatDuration(adventure.duration * 60)}</Pill>
            <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{adventure.xp} XP</Pill>
          </div>
        </GlassCard>

        <div>
          <SectionTitle icon="Map">Route</SectionTitle>
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

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth icon="RotateCcw" onClick={() => setScreen('ai-generator')}>Regenerate</Button>
          <Button fullWidth size="lg" icon="Play" onClick={() => { setSelectedAdventureObj(adventure); setScreen('adventure-map'); }}>
            Start Adventure
          </Button>
        </div>
      </div>
    </div>
  );
}
