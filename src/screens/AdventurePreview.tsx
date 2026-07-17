import { useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ADVENTURE_TYPES, DIFFICULTY_LABELS, CHALLENGES } from '../data';
import { routeToLatLngs, DEFAULT_CENTER } from '../lib/map-utils';
import { MapView, type MapMarkerData, type MapRouteData } from '../components/MapView';

export function AdventurePreview() {
  const { selectedAdventureObj, setScreen, setSelectedAdventure } = useStore();
  const adv = selectedAdventureObj;
  const typeInfo = ADVENTURE_TYPES.find(t => t.type === adv?.type);

  const routeLatLngs = useMemo(() => adv ? routeToLatLngs(adv.route, DEFAULT_CENTER, 800) : [], [adv]);
  const markers: MapMarkerData[] = useMemo(() => {
    if (routeLatLngs.length === 0) return [];
    return [
      { id: 'start', position: routeLatLngs[0], type: 'start', color: '#22c55e' },
      { id: 'finish', position: routeLatLngs[routeLatLngs.length - 1], type: 'finish', color: '#fbbf24' },
    ];
  }, [routeLatLngs]);
  const routes: MapRouteData[] = useMemo(() => routeLatLngs.length >= 2 ? [{ id: 'preview', positions: routeLatLngs, color: typeInfo?.color ?? '#00c4ff', weight: 4, animated: true }] : [], [routeLatLngs, typeInfo?.color]);

  if (!adv) {
    return (
      <div className="relative min-h-screen"><AdventureBg /><TopBar title="Preview" showBack showCurrencies={false} />
      <div className="px-6 py-20 text-center"><p className="text-sm text-white/40">No adventure to preview.</p>
      <Button className="mt-4" onClick={() => setScreen('ai-generator')}>Generate One</Button></div></div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent={typeInfo?.color} />
      <TopBar title="Adventure Preview" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{adv.emoji}</div>
            <div className="flex-1"><p className="text-sm font-bold text-white">{adv.title}</p><p className="text-[10px] text-white/40">{typeInfo?.label} · {DIFFICULTY_LABELS[adv.difficulty]}</p></div>
          </div>
          <p className="text-xs text-white/60">{adv.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Pill icon="Route" accent="text-zeviqo-300 border-zeviqo-500/30">{adv.distance} km</Pill>
            <Pill icon="Clock" accent="text-white/50 border-white/10">{adv.duration} min</Pill>
            <Pill icon="Zap" accent="text-gold-300 border-gold-500/30">+{adv.xp} XP</Pill>
            <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{adv.coins}</Pill>
          </div>
        </GlassCard>
        <div className="h-48 rounded-2xl overflow-hidden glass"><MapView center={DEFAULT_CENTER} zoom={15} markers={markers} routes={routes} className="h-full" /></div>
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-2">Objectives</h3>
          <div className="space-y-2">{adv.objectives.map((o, i) => <div key={i} className="flex items-center gap-2"><div className="w-5 h-5 rounded-full glass flex items-center justify-center text-[9px] text-white/40">{i + 1}</div><span className="text-xs text-white/60">{o}</span></div>)}</div>
        </GlassCard>
        <Button fullWidth size="lg" icon="Play" onClick={() => { setSelectedAdventure(adv.id); setScreen('adventure-detail'); }}>Start This Adventure</Button>
      </div>
    </div>
  );
}
