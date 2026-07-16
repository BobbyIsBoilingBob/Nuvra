import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Icon, GlassCard, Button, ProgressBar } from '../components/ui';
import { TopBar } from '../components/BottomNav';
import { MapView, type MapStyle, type MapMarkerData, type MapRouteData } from '../components/MapView';
import { MapSearch } from '../components/MapSearch';
import { useGeolocation } from '../hooks/useGeolocation';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useStore } from '../store';
import { TREASURE_RARITY_MAP, MYSTERY_EVENTS, getComboTier, getLevelInfo } from '../data';
import { SEASONAL_EVENTS } from '../cosmetics';
import {
  gridToLatLng,
  routeToLatLngs,
  checkpointsToLatLngs,
  treasuresToLatLngs,
  coinsToLatLngs,
  haversineMeters,
  bearing,
  routeLengthMeters,
  estimateWalkMinutes,
  smoothPosition,
  type LatLng,
  DEFAULT_CENTER,
} from '../lib/map-utils';

const PROXIMITY_M = 30; // 30m proximity for collection
const ROUTE_SPAN_M = 800; // route spans ~800m across

interface MapCoinState { id: string; x: number; y: number; collected: boolean }
interface MapTreasureState { id: string; x: number; y: number; coins: number; xp: number; opened: boolean; rarity: keyof typeof TREASURE_RARITY_MAP }
interface MapCheckpointState { id: string; label: string; kind: 'start' | 'challenge' | 'treasure' | 'finish'; x: number; y: number; reward: number; done: boolean }

interface SelectedMarker {
  id: string;
  label: string;
  type: string;
  emoji?: string;
  reward?: number;
  coins?: number;
  xp?: number;
  rarity?: string;
  done?: boolean;
}

export function AdventureMap(): React.ReactElement {
  const {
    selectedAdventure, setScreen, combo, setCombo, resetCombo,
    accessibility, addCoins, addXP, setActiveMystery, profile,
  } = useStore();

  const geo = useGeolocation(true);
  const deviceOrient = useDeviceOrientation(true);
  const mp = useMultiplayer(
    profile.playerId,
    profile.username,
    profile.avatar.emoji,
    getLevelInfo(profile.xp).level,
  );

  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [progress, setProgress] = useState(0);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [collectedTreasures, setCollectedTreasures] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [finished, setFinished] = useState(false);
  const [coins, setCoins] = useState<MapCoinState[]>([]);
  const [treasures, setTreasures] = useState<MapTreasureState[]>([]);
  const [checkpoints, setCheckpoints] = useState<MapCheckpointState[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);
  const [challengePopup, setChallengePopup] = useState<string | null>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [followPlayer, setFollowPlayer] = useState(true);
  const [mapCenter, setMapCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [playerHeading, setPlayerHeading] = useState<number | null>(null);

  const progressRef = useRef(0);
  const playerPosRef = useRef<LatLng | null>(null);
  const lastSimPosRef = useRef<LatLng | null>(null);
  const initializedRef = useRef(false);

  // Determine center: use GPS if available, else default
  const center: LatLng = geo.position ?? DEFAULT_CENTER;

  // Initialize from selected adventure
  useEffect(() => {
    if (!selectedAdventure) return;
    setCoins(selectedAdventure.coins.map((c) => ({ ...c })));
    setTreasures(selectedAdventure.treasures.map((t) => ({ ...t })));
    setCheckpoints(selectedAdventure.checkpoints.map((c) => ({ ...c })));
    setTimeLeft(selectedAdventure.durationMin * 60);
    setProgress(0);
    progressRef.current = 0;
    setFinished(false);
    setCollectedCoins(0);
    setCollectedTreasures(0);
    setCompletedChallenges(0);
    initializedRef.current = false;
  }, [selectedAdventure]);

  // Update map center when GPS position changes
  useEffect(() => {
    if (geo.position) {
      setMapCenter(geo.position);
      playerPosRef.current = geo.position;
    }
  }, [geo.position]);

  // Convert grid entities to real lat/lng
  const routeLatLngs = useMemo(() => {
    if (!selectedAdventure) return [];
    return routeToLatLngs(selectedAdventure.routePath, center, ROUTE_SPAN_M);
  }, [selectedAdventure, center]);

  const checkpointLatLngs = useMemo(() => {
    if (!selectedAdventure) return [];
    return checkpointsToLatLngs(selectedAdventure.checkpoints, center, ROUTE_SPAN_M);
  }, [selectedAdventure, center]);

  const treasureLatLngs = useMemo(() => {
    if (!selectedAdventure) return [];
    return treasuresToLatLngs(selectedAdventure.treasures, center, ROUTE_SPAN_M);
  }, [selectedAdventure, center]);

  const coinLatLngs = useMemo(() => {
    if (!selectedAdventure) return [];
    return coinsToLatLngs(coins, center, ROUTE_SPAN_M);
  }, [selectedAdventure, coins, center]);

  // --- Walking simulation: move player along route ---
  useEffect(() => {
    if (!selectedAdventure || finished) return;
    const route = routeLatLngs;
    if (route.length < 2) return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const next = Math.min(100, prev + 100 / (route.length * 2));
        progressRef.current = next;
        if (mp.party) {
          mp.updateProgress(next, collectedCoins, collectedTreasures, completedChallenges);
        }
        return next;
      });

      // Move player along route
      const routeLen = route.length;
      if (routeLen >= 2) {
        const segmentCount = routeLen - 1;
        const segmentProgress = (progressRef.current / 100) * segmentCount;
        const segIdx = Math.min(Math.floor(segmentProgress), segmentCount - 1);
        const segT = segmentProgress - segIdx;
        const a = route[segIdx];
        const b = route[segIdx + 1];
        if (a && b) {
          const newPos = {
            lat: a.lat + (b.lat - a.lat) * segT,
            lng: a.lng + (b.lng - a.lng) * segT,
          };
          const smoothed = smoothPosition(newPos, lastSimPosRef.current);
          lastSimPosRef.current = smoothed;
          playerPosRef.current = smoothed;

          // Sync position to multiplayer
          if (mp.party) {
            mp.updatePosition(smoothed, playerHeading ?? 0, 0);
          }

          // Compute heading
          if (lastSimPosRef.current) {
            const head = bearing(lastSimPosRef.current, newPos);
            setPlayerHeading(head);
          }

          if (followPlayer) {
            setMapCenter(smoothed);
          }
        }
      }
    }, 800);

    return () => window.clearInterval(interval);
  }, [selectedAdventure, finished, routeLatLngs, followPlayer]);

  // --- Collection detection: check proximity to coins, treasures, checkpoints ---
  useEffect(() => {
    if (finished || !playerPosRef.current) return;
    const playerPos = playerPosRef.current;

    // Coins
    setCoins((prev) =>
      prev.map((c) => {
        if (c.collected) return c;
        const coinPos = gridToLatLng(c, center, ROUTE_SPAN_M);
        if (haversineMeters(playerPos, coinPos) < PROXIMITY_M) {
          setCollectedCoins((n) => n + 1);
          setCombo((cm) => cm + 1);
          addCoins(10);
          return { ...c, collected: true };
        }
        return c;
      }),
    );

    // Treasures
    setTreasures((prev) =>
      prev.map((t) => {
        if (t.opened) return t;
        const tPos = gridToLatLng(t, center, ROUTE_SPAN_M);
        if (haversineMeters(playerPos, tPos) < PROXIMITY_M) {
          setCollectedTreasures((n) => n + 1);
          setCombo((cm) => cm + 1);
          addCoins(t.coins);
          addXP(t.xp);
          return { ...t, opened: true };
        }
        return t;
      }),
    );

    // Checkpoints
    setCheckpoints((prev) =>
      prev.map((c) => {
        if (c.done || c.kind === 'start') return c;
        const cPos = gridToLatLng(c, center, ROUTE_SPAN_M);
        if (haversineMeters(playerPos, cPos) < PROXIMITY_M) {
          setCompletedChallenges((n) => n + 1);
          setCombo((cm) => cm + 1);
          addCoins(c.reward);
          addXP(50);
          return { ...c, done: true };
        }
        return c;
      }),
    );
  }, [progress, finished, center, setCombo, addCoins, addXP]);

  // --- Finish when progress reaches 100 ---
  useEffect(() => {
    if (progress >= 100 && !finished) {
      setFinished(true);
      if (selectedAdventure) {
        addXP(selectedAdventure.xpReward);
        addCoins(selectedAdventure.coinReward);
      }
    }
  }, [progress, finished, selectedAdventure, addXP, addCoins]);

  // --- Mystery events ---
  useEffect(() => {
    if (!selectedAdventure || finished || accessibility.relaxedMode) return;
    const interval = window.setInterval(() => {
      if (Math.random() < 0.15) {
        const event = MYSTERY_EVENTS[Math.floor(Math.random() * MYSTERY_EVENTS.length)];
        setActiveMystery({
          type: event.id,
          label: event.label,
          icon: event.icon,
          color: event.color,
          timeRemaining: event.duration,
          duration: event.duration,
        });
      }
    }, 8000);
    return () => window.clearInterval(interval);
  }, [selectedAdventure, finished, accessibility.relaxedMode, setActiveMystery]);

  // --- Timer countdown ---
  useEffect(() => {
    if (!selectedAdventure || finished) return;
    if (timeLeft <= 0) return;
    const interval = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [selectedAdventure, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Challenge popup progress ---
  useEffect(() => {
    if (!challengePopup) return;
    setChallengeProgress(0);
    const interval = window.setInterval(() => {
      setChallengeProgress((p) => {
        if (p >= 100) {
          window.clearInterval(interval);
          setChallengePopup(null);
          setCompletedChallenges((n) => n + 1);
          setCombo((c) => c + 1);
          addCoins(100);
          addXP(80);
          return 100;
        }
        return p + 10;
      });
    }, 200);
    return () => window.clearInterval(interval);
  }, [challengePopup, setCombo, addCoins, addXP]);

  // --- Build markers for the map ---
  const markers: MapMarkerData[] = useMemo(() => {
    if (!selectedAdventure) return [];
    const result: MapMarkerData[] = [];

    // Player marker
    if (playerPosRef.current) {
      result.push({
        id: 'player',
        position: playerPosRef.current,
        type: 'player',
      });
    }

    // Checkpoints
    for (const c of checkpointLatLngs) {
      result.push({
        id: c.id,
        position: c.latlng,
        type: c.kind === 'start' ? 'start' : c.kind === 'finish' ? 'finish' : c.kind === 'treasure' ? 'checkpoint' : 'challenge',
        label: c.label,
        emoji: c.kind === 'challenge' ? '⚔️' : c.kind === 'treasure' ? '💎' : undefined,
        color: c.kind === 'challenge' ? '#fb923c' : c.kind === 'treasure' ? '#fbbf24' : '#40f5cb',
        completed: c.done,
        pulsing: !c.done && c.kind !== 'start',
        onClick: () => setSelectedMarker({
          id: c.id,
          label: c.label,
          type: c.kind,
          reward: c.reward,
          done: c.done,
        }),
      });
    }

    // Treasures
    for (const t of treasureLatLngs) {
      const rarity = TREASURE_RARITY_MAP[t.rarity];
      result.push({
        id: t.id,
        position: t.latlng,
        type: 'treasure',
        label: `${rarity.label} Treasure`,
        emoji: rarity.emoji,
        color: rarity.color,
        completed: t.opened,
        onClick: () => setSelectedMarker({
          id: t.id,
          label: `${rarity.label} Treasure`,
          type: 'treasure',
          emoji: rarity.emoji,
          coins: t.coins,
          xp: t.xp,
          rarity: t.rarity,
          done: t.opened,
        }),
      });
    }

    // Coins
    for (const c of coinLatLngs) {
      result.push({
        id: c.id,
        position: c.latlng,
        type: 'coin',
        completed: c.collected,
      });
    }

    // World events — show active seasonal event on map
    const activeEvent = SEASONAL_EVENTS.find((e) => e.status === 'active');
    if (activeEvent) {
      // Place event marker at a visible location near center
      const eventPos = gridToLatLng({ x: 80, y: 20 }, center, ROUTE_SPAN_M);
      result.push({
        id: 'world-event',
        position: eventPos,
        type: 'event',
        label: activeEvent.name,
        emoji: activeEvent.emoji,
        color: '#fbbf24',
        onClick: () => setSelectedMarker({
          id: 'world-event',
          label: activeEvent.name,
          type: 'event',
          emoji: activeEvent.emoji,
        }),
      });
    }

    // Multiplayer player markers
    if (mp.party) {
      for (const m of mp.party.members) {
        if (m.id !== profile.playerId && m.position) {
          result.push({
            id: `mp-${m.id}`,
            position: m.position,
            type: 'multiplayer',
            label: m.username,
            emoji: m.avatar,
            onClick: () => setSelectedMarker({
              id: m.id,
              label: m.username,
              type: 'multiplayer',
              emoji: m.avatar,
            }),
          });
        }
      }
    }

    // Use deviceOrient heading for player marker if GPS heading is null
    void deviceOrient;

    return result;
  }, [selectedAdventure, checkpointLatLngs, treasureLatLngs, coinLatLngs, center, mp.party, profile.playerId, deviceOrient]);

  // --- Build routes for the map ---
  const routes: MapRouteData[] = useMemo(() => {
    if (!selectedAdventure || routeLatLngs.length < 2) return [];
    return [{
      id: 'main-route',
      positions: routeLatLngs,
      color: '#40f5cb',
      weight: 5,
      animated: !initializedRef.current,
    }];
  }, [selectedAdventure, routeLatLngs]);

  // Mark initialized after first render
  useEffect(() => {
    initializedRef.current = true;
  }, []);

  // --- Navigation calculations ---
  const navInfo = useMemo(() => {
    if (!selectedAdventure || routeLatLngs.length === 0) return null;
    const totalDistance = routeLengthMeters(routeLatLngs);
    const remainingDistance = totalDistance * (1 - progress / 100);
    const walkMinutes = estimateWalkMinutes(remainingDistance);

    // Find next incomplete checkpoint
    const nextCp = checkpointLatLngs.find((c) => !c.done && c.kind !== 'start');
    const nextCpDistance = nextCp && playerPosRef.current
      ? haversineMeters(playerPosRef.current, nextCp.latlng)
      : null;

    return {
      totalDistanceKm: totalDistance / 1000,
      remainingDistanceKm: remainingDistance / 1000,
      walkMinutes,
      nextCheckpoint: nextCp?.label ?? null,
      nextCheckpointDistance: nextCpDistance,
    };
  }, [selectedAdventure, routeLatLngs, progress, checkpointLatLngs]);

  const handleQuit = useCallback(() => {
    resetCombo();
    setScreen('adventure-detail');
  }, [resetCombo, setScreen]);

  const handleRecenter = useCallback(() => {
    setFollowPlayer(true);
    if (playerPosRef.current) {
      setMapCenter(playerPosRef.current);
    }
  }, []);

  const handleSearchSelect = useCallback((pos: LatLng) => {
    setFollowPlayer(false);
    setMapCenter(pos);
  }, []);

  // --- No adventure selected ---
  if (!selectedAdventure) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-ink-950">
        <TopBar showBack />
        <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 text-white/40">
            <Icon name="Map" size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No adventure selected</h3>
          <p className="text-sm text-white/50 mb-5">Choose an adventure to start exploring.</p>
          <Button variant="secondary" icon="ArrowLeft" onClick={() => setScreen('adventures')}>
            Browse Adventures
          </Button>
        </div>
      </div>
    );
  }

  const adv = selectedAdventure;
  const tier = getComboTier(combo);
  const minsLeft = Math.floor(timeLeft / 60);
  const secsLeft = timeLeft % 60;

  // --- Finished screen ---
  if (finished) {
    const totalCoins = collectedCoins * 10
      + treasures.filter((t) => t.opened).reduce((sum, t) => sum + t.coins, 0)
      + checkpoints.filter((c) => c.done).reduce((sum, c) => sum + c.reward, 0)
      + adv.coinReward;
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-ink-950">
        <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col items-center justify-center py-16 text-center">
          <div className="text-7xl mb-4 animate-float">🏆</div>
          <h2 className="text-2xl font-black text-white mb-1">Adventure Complete!</h2>
          <p className="text-sm text-white/60 mb-6">{adv.name}</p>

          <GlassCard className="p-5 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-nova-300">
                  <Icon name="Zap" size={20} />
                </div>
                <div className="text-lg font-black text-white">+{adv.xpReward}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">XP Earned</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gold-300">
                  <Icon name="Coins" size={20} />
                </div>
                <div className="text-lg font-black text-white">+{totalCoins}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Coins Earned</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-plasma-300">
                  <Icon name="Gem" size={20} />
                </div>
                <div className="text-lg font-black text-white">{collectedTreasures}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Treasures</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-ember-300">
                  <Icon name="Swords" size={20} />
                </div>
                <div className="text-lg font-black text-white">{completedChallenges}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Challenges</div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-3 w-full mt-6">
            <Button variant="primary" size="lg" fullWidth icon="Home" onClick={() => setScreen('home')}>
              Back to Home
            </Button>
            <Button variant="secondary" size="lg" fullWidth icon="Compass" onClick={() => setScreen('adventures')}>
              More Adventures
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-ink-950">
      {/* Real interactive map */}
      <div className="absolute inset-0">
        <MapView
          center={mapCenter}
          zoom={16}
          style={mapStyle}
          markers={markers}
          routes={routes}
          followPlayer={followPlayer}
          playerHeading={playerHeading}
          onStyleChange={setMapStyle}
          onMapClick={() => setFollowPlayer(false)}
        />
      </div>

      {/* Search overlay */}
      <MapSearch onSelect={handleSearchSelect} />

      {/* GPS status banner */}
      {geo.status !== 'granted' && geo.status !== 'idle' && geo.status !== 'requesting' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] glass-strong rounded-xl px-4 py-2.5 flex items-center gap-2 max-w-[90vw]">
          <Icon name="MapPin" size={14} className={geo.status === 'denied' ? 'text-rose-300' : 'text-gold-300'} />
          <span className="text-xs font-semibold text-white whitespace-nowrap">{geo.message}</span>
          {geo.status === 'denied' && (
            <button onClick={() => geo.requestPermission()} className="text-xs font-bold text-nova-300 ml-2">
              Retry
            </button>
          )}
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[500]">
        <TopBar showBack showCurrencies={false} title={adv.name} />
      </div>

      {/* Recenter button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-32 right-3 z-[500] w-11 h-11 rounded-xl glass-strong flex items-center justify-center text-nova-300 hover:bg-white/10 transition-colors"
        aria-label="Center on current location"
      >
        <Icon name="LocateFixed" size={20} />
      </button>

      {/* Challenge popup */}
      {challengePopup && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-ink-950/60 backdrop-blur-sm">
          <GlassCard className="p-6 max-w-sm mx-4 w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember-400 to-rose-500 flex items-center justify-center text-2xl">
                ⚔️
              </div>
              <div>
                <h3 className="text-base font-black text-white">Challenge!</h3>
                <p className="text-xs text-white/50">{challengePopup}</p>
              </div>
            </div>
            <ProgressBar value={challengeProgress} accent="from-ember-400 to-rose-500" height={8} />
            <p className="text-xs text-white/50 mt-2 text-center">Completing challenge...</p>
          </GlassCard>
        </div>
      )}

      {/* Selected marker info card */}
      {selectedMarker && (
        <div className="absolute bottom-44 left-1/2 -translate-x-1/2 z-[1000] w-[90vw] max-w-sm">
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {selectedMarker.emoji ?? '📍'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white">{selectedMarker.label}</h3>
                <p className="text-xs text-white/50 capitalize">{selectedMarker.type.replace('_', ' ')}</p>
                {selectedMarker.reward != null && selectedMarker.reward > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Icon name="Coins" size={12} className="text-gold-300" />
                    <span className="text-xs font-bold text-gold-300">+{selectedMarker.reward}</span>
                  </div>
                )}
                {selectedMarker.coins != null && (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Icon name="Coins" size={12} className="text-gold-300" />
                      <span className="text-xs font-bold text-gold-300">+{selectedMarker.coins}</span>
                    </div>
                    {selectedMarker.xp != null && (
                      <div className="flex items-center gap-1">
                        <Icon name="Zap" size={12} className="text-nova-300" />
                        <span className="text-xs font-bold text-nova-300">+{selectedMarker.xp}</span>
                      </div>
                    )}
                  </div>
                )}
                {selectedMarker.type === 'challenge' && !selectedMarker.done && (
                  <Button size="sm" variant="primary" className="mt-3" icon="Swords"
                    onClick={() => { setChallengePopup(selectedMarker.label); setSelectedMarker(null); }}>
                    Start Challenge
                  </Button>
                )}
                {selectedMarker.done && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Icon name="CheckCircle" size={14} className="text-nova-300" />
                    <span className="text-xs font-bold text-nova-300">Completed</span>
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedMarker(null)} className="text-white/40 hover:text-white flex-shrink-0" aria-label="Close info card">
                <Icon name="X" size={16} />
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Bottom navigation HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-[500] pb-4">
        <div className="px-3 max-w-md mx-auto">
          <GlassCard className="p-4">
            {/* Live navigation stats */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">Live Navigation</span>
              <span className="text-xs font-bold text-nova-300">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} accent="from-nova-400 to-cyan-300" />

            {navInfo && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex flex-col items-center gap-0.5">
                  <Icon name="Footprints" size={14} className="text-nova-300" />
                  <span className="text-sm font-bold text-white">{navInfo.remainingDistanceKm.toFixed(2)}</span>
                  <span className="text-[9px] text-white/40 uppercase">km left</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Icon name="Clock" size={14} className="text-cyan-300" />
                  <span className="text-sm font-bold text-white">{navInfo.walkMinutes}</span>
                  <span className="text-[9px] text-white/40 uppercase">min walk</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Icon name="Flame" size={14} className="text-rose-300" />
                  <span className="text-sm font-bold text-white">{combo}x</span>
                  <span className="text-[9px] text-white/40 uppercase">combo</span>
                </div>
              </div>
            )}

            {navInfo?.nextCheckpoint && (
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/10">
                <Icon name="MapPin" size={12} className="text-ember-300 flex-shrink-0" />
                <span className="text-xs text-white/50">Next:</span>
                <span className="text-xs font-bold text-white truncate">{navInfo.nextCheckpoint}</span>
                {navInfo.nextCheckpointDistance != null && (
                  <span className="text-xs font-bold text-nova-300 ml-auto flex-shrink-0">
                    {navInfo.nextCheckpointDistance < 1000
                      ? `${Math.round(navInfo.nextCheckpointDistance)}m`
                      : `${(navInfo.nextCheckpointDistance / 1000).toFixed(1)}km`}
                  </span>
                )}
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10">
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Coins" size={14} className="text-gold-300" />
                <span className="text-sm font-bold text-white">{collectedCoins}</span>
                <span className="text-[9px] text-white/40 uppercase">Coins</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Gem" size={14} className="text-plasma-300" />
                <span className="text-sm font-bold text-white">{collectedTreasures}</span>
                <span className="text-[9px] text-white/40 uppercase">Treasure</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Swords" size={14} className="text-ember-300" />
                <span className="text-sm font-bold text-white">{completedChallenges}</span>
                <span className="text-[9px] text-white/40 uppercase">Done</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Clock" size={14} className="text-white/40" />
                <span className="text-sm font-bold text-white">{minsLeft}:{secsLeft.toString().padStart(2, '0')}</span>
                <span className="text-[9px] text-white/40 uppercase">Time</span>
              </div>
            </div>

            {/* Tier + quit */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className={`text-xs font-bold ${tier.threshold > 1 ? 'text-ember-300' : 'text-white/40'}`}>
                {tier.label}
              </div>
              <Button variant="danger" size="sm" icon="X" onClick={handleQuit}>
                Quit
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
