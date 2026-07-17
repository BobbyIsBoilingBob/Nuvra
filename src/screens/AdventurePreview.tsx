import { useState, useMemo, useCallback } from 'react';
import { Icon, GlassCard, Button, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { MapView, type MapMarkerData, type MapRouteData } from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { useStore } from '../store';
import { CHALLENGES, ADVENTURE_TYPE_META, TREASURE_RARITY_MAP, type Adventure as AdvModel } from '../adventure-model';
import {
  routeToLatLngs,
  checkpointsToLatLngs,
  treasuresToLatLngs,
  routeLengthMeters,
  estimateWalkMinutes,
  DEFAULT_CENTER,
  type LatLng,
} from '../lib/map-utils';

const ROUTE_SPAN_M = 800;

export function AdventurePreview(): React.ReactElement {
  const { selectedAdventureObj, setScreen, addAdventure } = useStore();
  const geo = useGeolocation(false);
  const [saved, setSaved] = useState(false);

  const center: LatLng = geo.position ?? DEFAULT_CENTER;

  const routeLatLngs = useMemo(() => {
    if (!selectedAdventureObj) return [];
    return routeToLatLngs((selectedAdventureObj as unknown as AdvModel).routePath, center, ROUTE_SPAN_M);
  }, [selectedAdventureObj, center]);

  const checkpointLatLngs = useMemo(() => {
    if (!selectedAdventureObj) return [];
    return checkpointsToLatLngs((selectedAdventureObj as unknown as AdvModel).checkpoints, center, ROUTE_SPAN_M);
  }, [selectedAdventureObj, center]);

  const treasureLatLngs = useMemo(() => {
    if (!selectedAdventureObj) return [];
    return treasuresToLatLngs((selectedAdventureObj as unknown as AdvModel).treasures, center, ROUTE_SPAN_M);
  }, [selectedAdventureObj, center]);

  const totalDistanceKm = useMemo(() => routeLengthMeters(routeLatLngs) / 1000, [routeLatLngs]);
  const walkMinutes = useMemo(() => estimateWalkMinutes(totalDistanceKm * 1000), [totalDistanceKm]);

  const markers: MapMarkerData[] = useMemo(() => {
    if (!selectedAdventureObj) return [];
    const result: MapMarkerData[] = [];

    for (const c of checkpointLatLngs) {
      result.push({
        id: c.id,
        position: c.latlng,
        type: c.kind === 'start' ? 'start' : c.kind === 'finish' ? 'finish' : 'challenge',
        label: c.label,
        emoji: c.kind === 'challenge' ? '⚔️' : undefined,
        color: c.kind === 'challenge' ? '#fb923c' : '#40f5cb',
        pulsing: c.kind !== 'start' && c.kind !== 'finish',
      });
    }

    for (const t of treasureLatLngs) {
      const rarity = TREASURE_RARITY_MAP[t.rarity as keyof typeof TREASURE_RARITY_MAP];
      result.push({
        id: t.id,
        position: t.latlng,
        type: 'treasure',
        label: `${rarity.label} Treasure`,
        emoji: rarity.emoji,
        color: rarity.color,
      });
    }

    return result;
  }, [selectedAdventureObj, checkpointLatLngs, treasureLatLngs]);

  const routes: MapRouteData[] = useMemo(() => {
    if (routeLatLngs.length < 2) return [];
    return [{
      id: 'preview-route',
      positions: routeLatLngs,
      color: '#40f5cb',
      weight: 4,
      animated: true,
    }];
  }, [routeLatLngs]);

  const handleStart = useCallback(() => {
    setScreen('adventure-map');
  }, [setScreen]);

  const handleSave = useCallback(() => {
    if (selectedAdventureObj && !saved) {
      addAdventure(selectedAdventureObj);
      setSaved(true);
    }
  }, [selectedAdventureObj, addAdventure, saved]);

  if (!selectedAdventureObj) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AdventureBg />
        <TopBar showBack showCurrencies />
        <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 text-white/40">
            <Icon name="Map" size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No adventure selected</h3>
          <Button variant="secondary" icon="ArrowLeft" onClick={() => setScreen('adventures')}>
            Browse Adventures
          </Button>
        </div>
      </div>
    );
  }

  const adv = selectedAdventureObj as unknown as AdvModel;
  const typeMeta = ADVENTURE_TYPE_META[adv.type];
  const challengeDefs = adv.challenges
    .map((id) => CHALLENGES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const totalCoins = adv.coinReward + adv.treasures.reduce((s, t) => s + t.coins, 0);

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24 bg-ink-950">
      <div className="absolute inset-0 z-0">
        <MapView
          center={center}
          zoom={15}
          markers={markers}
          routes={routes}
          className="opacity-95"
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-ink-950/80 via-transparent to-ink-950" />

      <div className="relative z-20">
        <TopBar showBack showCurrencies title={adv.name} />
      </div>

      <div className="relative z-20 px-4 max-w-md mx-auto mt-2">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{adv.emoji}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white">{adv.name}</h2>
              <p className="text-xs text-white/50">{typeMeta.label} · {adv.difficulty}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <Icon name="Footprints" size={14} className="text-nova-300" />
              <span className="text-sm font-bold text-white">{totalDistanceKm.toFixed(2)}</span>
              <span className="text-[9px] text-white/40 uppercase">km</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Icon name="Clock" size={14} className="text-cyan-300" />
              <span className="text-sm font-bold text-white">{walkMinutes}</span>
              <span className="text-[9px] text-white/40 uppercase">min</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Icon name="Zap" size={14} className="text-gold-300" />
              <span className="text-sm font-bold text-white">+{adv.xpReward}</span>
              <span className="text-[9px] text-white/40 uppercase">XP</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Icon name="Coins" size={14} className="text-ember-300" />
              <span className="text-sm font-bold text-white">+{totalCoins}</span>
              <span className="text-[9px] text-white/40 uppercase">coins</span>
            </div>
          </div>
        </GlassCard>

        {challengeDefs.length > 0 && (
          <div className="mt-4">
            <SectionTitle icon="Swords" accent="text-ember-300">Challenges</SectionTitle>
            <div className="mt-2 flex flex-col gap-2">
              {challengeDefs.map((c) => (
                <GlassCard key={c.id} className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={c.icon} size={16} className="text-ink-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-white/50 truncate">{c.description}</p>
                  </div>
                  <span className="text-xs font-bold text-gold-300 flex-shrink-0">+{c.baseReward}</span>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {adv.treasures.length > 0 && (
          <div className="mt-4">
            <SectionTitle icon="Gem" accent="text-gold-300">Treasures</SectionTitle>
            <div className="mt-2 flex flex-col gap-2">
              {adv.treasures.map((t) => {
                const rarity = TREASURE_RARITY_MAP[t.rarity as keyof typeof TREASURE_RARITY_MAP];
                return (
                  <GlassCard key={t.id} className="p-3 flex items-center gap-3">
                    <div className="text-2xl flex-shrink-0">{rarity.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white capitalize">{t.rarity} Treasure</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gold-300 font-bold">+{t.coins} coins</span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs text-nova-300 font-bold">+{t.xp} XP</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold border flex-shrink-0" style={{ color: rarity.color, borderColor: `${rarity.color}40` }}>
                      {rarity.label}
                    </span>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <SectionTitle icon="Info" accent="text-nova-300">About</SectionTitle>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{adv.description}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-3">
            <Button
              variant={saved ? 'ghost' : 'secondary'}
              icon={saved ? 'Check' : 'Bookmark'}
              onClick={handleSave}
              className="flex-shrink-0"
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon="Play"
              onClick={handleStart}
            >
              Start Adventure
            </Button>
          </div>
          <Button variant="ghost" fullWidth icon="Users" onClick={() => setScreen('party')}>
            Invite Friends
          </Button>
        </div>
      </div>
    </div>
  );
}
