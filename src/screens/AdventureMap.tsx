import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, ProgressBar, RewardPopup, ConfirmDialog } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ADVENTURE_TYPES, DIFFICULTY_LABELS, getComboTier, type Adventure } from '../data';
import { createGpsFilter, filterGpsReading, formatDistance, formatDuration, routeToLatLngs, DEFAULT_CENTER, type GpsFilter } from '../lib/map-utils';
import { getAdventureById } from '../data';
import { MapView, type MapMarkerData, type MapRouteData } from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { vibrate } from '../lib/settings';

type GpsState = 'idle' | 'starting' | 'tracking' | 'paused' | 'completed' | 'denied' | 'error';

export function AdventureMap() {
  const { selectedAdventureId, setScreen, recordAdventureComplete, updateQuestProgress } = useStore();
  const { profile, updateProfile } = useAuth();
  const geo = useGeolocation(false);
  const adventure = useStore.getState().selectedAdventureObj ?? null;
  const adventureFromId = useMemo(() => {
    if (adventure) return adventure;
    return getAdventureById(selectedAdventureId ?? '') ?? null;
  }, [adventure, selectedAdventureId]);

  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [distance, setDistance] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [objectivesDone, setObjectivesDone] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [treasuresFound, setTreasuresFound] = useState(0);

  const filterRef = useRef<GpsFilter>(createGpsFilter());
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMoveRef = useRef<number>(0);

  const adv: Adventure | null = adventureFromId;

  useEffect(() => {
    if (adv) setObjectivesDone(new Array(adv.objectives.length).fill(false));
    return () => stopTracking();
  }, [adv?.id]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const tickTimer = useCallback(() => {
    if (startTimeRef.current) setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
  }, []);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const time = pos.timestamp;
    const result = filterGpsReading(filterRef.current, lat, lon, time);

    if (result.accepted && result.distance > 0) {
      setDistance(d => d + result.distance);
      lastMoveRef.current = time;
      setCombo(c => c + 1);
      vibrate(10);
    } else {
      // Standing still — decay combo after 30s of no movement
      if (time - lastMoveRef.current > 30000) setCombo(0);
    }

    if (adv) {
      const pct = (filterRef.current.totalDistance / adv.distance) * 100;
      const newObjs = objectivesDone.map((done, i) => {
        if (done) return true;
        const threshold = ((i + 1) / adv.objectives.length) * 100;
        return pct >= threshold;
      });
      const justCompleted = newObjs.some((d, i) => d && !objectivesDone[i]);
      if (justCompleted) {
        setObjectivesDone(newObjs);
        vibrate([20, 40, 20]);
        setTreasuresFound(t => t + 1);
      }
      if (filterRef.current.totalDistance >= adv.distance && gpsState !== 'completed') {
        completeAdventure();
      }
    }
  }, [adv, objectivesDone, gpsState]);

  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) { setErrorMsg('GPS not supported on this device.'); setGpsState('error'); return; }
    setGpsState('starting'); setErrorMsg(null);
    filterRef.current = createGpsFilter();
    setDistance(0); setElapsed(0); setCombo(0); setTreasuresFound(0);
    if (adv) setObjectivesDone(new Array(adv.objectives.length).fill(false));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        filterRef.current.lastLat = pos.coords.latitude;
        filterRef.current.lastLon = pos.coords.longitude;
        filterRef.current.lastTime = pos.timestamp;
        startTimeRef.current = Date.now();
        lastMoveRef.current = pos.timestamp;
        setGpsState('tracking');
        timerRef.current = setInterval(tickTimer, 1000);
        watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, (err) => {
          setErrorMsg(err.message || 'GPS error');
          setGpsState('error');
        }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) { setGpsState('denied'); setErrorMsg('Location permission denied. Enable GPS to track adventures.'); }
        else { setGpsState('error'); setErrorMsg('Could not get your location. Try going outside.'); }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [adv, handlePosition, tickTimer]);

  const completeAdventure = useCallback(() => {
    if (!adv || gpsState === 'completed') return;
    stopTracking();
    setGpsState('completed');
    vibrate([30, 50, 30, 50, 60]);

    const tier = getComboTier(combo);
    const xpEarned = Math.round(adv.xp * tier.multiplier);
    const coinsEarned = Math.round(adv.coins * tier.multiplier);
    const gemsEarned = adv.gems;

    recordAdventureComplete({
      adventureId: adv.id, adventureName: adv.title, type: adv.type,
      emoji: adv.emoji, difficulty: adv.difficulty,
      distance: filterRef.current.totalDistance, time: elapsed,
      xpEarned, coinsEarned, gemsEarned, treasuresFound,
      maxCombo: combo,
    });

    updateQuestProgress('distance', filterRef.current.totalDistance);
    updateQuestProgress('adventures', 1);
    updateQuestProgress('treasures', treasuresFound);
    updateQuestProgress('combo', combo);

    if (profile) {
      const newXp = profile.xp + xpEarned;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      updateProfile({
        xp: newXp, level: newLevel,
        coins: profile.coins + coinsEarned,
        gems: (profile.gems ?? 0) + gemsEarned,
        distance_walked: Math.round((profile.distance_walked + filterRef.current.totalDistance) * 100) / 100,
        steps: profile.steps + Math.round(filterRef.current.totalDistance * 1300),
        completed_adventures: profile.completed_adventures + 1,
        treasure_collected: profile.treasure_collected + treasuresFound,
        last_walk_date: new Date().toISOString().split('T')[0],
      });
    }
    setShowComplete(true);
  }, [adv, combo, elapsed, treasuresFound, profile, updateProfile, recordAdventureComplete, stopTracking, gpsState, updateQuestProgress]);

  const cancelAdventure = () => { stopTracking(); setScreen('adventure-detail'); setShowCancel(false); };

  if (!adv) {
    return (
      <div className="relative min-h-screen">
        <AdventureBg />
        <TopBar title="Adventure" showBack showCurrencies={false} />
        <div className="px-6 py-20 text-center"><p className="text-sm text-white/40">No adventure selected.</p>
        <Button className="mt-4" onClick={() => setScreen('adventures')}>Browse Adventures</Button></div>
      </div>
    );
  }

  const typeInfo = ADVENTURE_TYPES.find(t => t.type === adv.type);
  const tier = getComboTier(combo);
  const progress = Math.min(100, (distance / adv.distance) * 100);
  const playerPos = geo.position ?? DEFAULT_CENTER;

  const routeLatLngs = useMemo(() => routeToLatLngs(adv.route, DEFAULT_CENTER, 800), [adv.route]);
  const mapMarkers: MapMarkerData[] = useMemo(() => {
    const markers: MapMarkerData[] = [];
    if (routeLatLngs.length > 0) {
      markers.push({ id: 'start', position: routeLatLngs[0], type: 'start', label: 'Start', color: '#22c55e' });
      markers.push({ id: 'finish', position: routeLatLngs[routeLatLngs.length - 1], type: 'finish', label: 'Finish', color: '#fbbf24' });
    }
    if (geo.position) {
      markers.push({ id: 'player', position: geo.position, type: 'player', color: '#00c4ff' });
    }
    return markers;
  }, [routeLatLngs, geo.position]);
  const mapRoutes: MapRouteData[] = useMemo(() => {
    if (routeLatLngs.length < 2) return [];
    return [{ id: 'adv-route', positions: routeLatLngs, color: typeInfo?.color ?? '#00c4ff', weight: 4, animated: true }];
  }, [routeLatLngs, typeInfo?.color]);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent={typeInfo?.color} />
      <TopBar title={adv.title} showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        {/* Stats card */}
        <GlassCard className="p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{adv.emoji}</span>
              <div>
                <p className="text-sm font-display font-bold text-white">{formatDistance(distance)}</p>
                <p className="text-[10px] text-white/40">of {formatDistance(adv.distance)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-display font-bold text-white">{formatDuration(elapsed)}</p>
              <p className="text-[10px] text-white/40">elapsed</p>
            </div>
          </div>
          <ProgressBar value={distance} max={adv.distance} />
          <div className="flex items-center justify-between mt-2 text-[10px] text-white/40">
            <span>{Math.round(progress)}% complete</span>
            <span className="flex items-center gap-1" style={{ color: tier.color }}>
              <Icon name="Flame" size={10} />{combo}x {tier.name}
            </span>
          </div>
        </GlassCard>

        {/* Map */}
        <div className="animate-slide-up h-64 rounded-2xl overflow-hidden glass">
          <MapView
            center={playerPos}
            zoom={16}
            markers={mapMarkers}
            routes={mapRoutes}
            followPlayer={gpsState === 'tracking'}
            playerHeading={geo.heading}
            accuracy={geo.accuracy}
            className="h-full"
          />
        </div>

        {/* Objectives */}
        <GlassCard className="p-4 animate-slide-up">
          <h3 className="text-sm font-display font-bold text-white mb-3">Objectives</h3>
          <div className="space-y-2">
            {adv.objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${objectivesDone[i] ? 'bg-emerald-500/20' : 'glass'}`}>
                  {objectivesDone[i] ? <Icon name="Check" size={12} className="text-emerald-400" /> : <span className="text-[10px] font-bold text-white/40">{i + 1}</span>}
                </div>
                <span className={`text-xs ${objectivesDone[i] ? 'text-white/80 line-through' : 'text-white/60'}`}>{obj}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* GPS status */}
        {geo.message && (
          <GlassCard className="p-3 border-amber-500/20 animate-fade-in">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300">{geo.message}</p>
            </div>
          </GlassCard>
        )}

        {errorMsg && (
          <GlassCard className="p-3 border-rose-500/20 animate-fade-in">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-300">{errorMsg}</p>
            </div>
          </GlassCard>
        )}

        {/* Controls */}
        <div className="space-y-2">
          {gpsState === 'idle' && <Button fullWidth size="lg" icon="Play" onClick={startTracking}>Start Tracking</Button>}
          {gpsState === 'starting' && <Button fullWidth size="lg" disabled>Getting GPS...</Button>}
          {(gpsState === 'tracking' || gpsState === 'paused') && (
            <>
              <Button fullWidth size="lg" variant="secondary" icon="Pause" onClick={() => { stopTracking(); setGpsState('paused'); }}>Pause</Button>
              <Button fullWidth size="md" variant="danger" icon="X" onClick={() => setShowCancel(true)}>End Adventure</Button>
            </>
          )}
          {gpsState === 'paused' && <Button fullWidth size="lg" icon="Play" onClick={startTracking}>Resume</Button>}
          {(gpsState === 'denied' || gpsState === 'error') && (
            <>
              <Button fullWidth size="lg" icon="RotateCcw" onClick={startTracking}>Retry GPS</Button>
              <Button fullWidth size="md" variant="ghost" onClick={() => setScreen('adventures')}>Back to Adventures</Button>
            </>
          )}
          {gpsState === 'completed' && <Button fullWidth size="lg" variant="secondary" icon="Home" onClick={() => setScreen('home')}>Back Home</Button>}
        </div>
      </div>

      <ConfirmDialog visible={showCancel} title="End Adventure?" message="Your progress will be lost. Are you sure you want to end this adventure?" confirmLabel="End" danger onConfirm={cancelAdventure} onCancel={() => setShowCancel(false)} />

      <RewardPopup
        visible={showComplete}
        onClose={() => { setShowComplete(false); setScreen('home'); }}
        rewards={[
          { icon: 'Zap', label: 'XP', amount: Math.round(adv.xp * tier.multiplier), color: 'text-zeviqo-400' },
          { icon: 'Coins', label: 'Coins', amount: Math.round(adv.coins * tier.multiplier), color: 'text-gold-400' },
          ...(adv.gems > 0 ? [{ icon: 'Gem', label: 'Gems', amount: adv.gems, color: 'text-zeviqo-300' }] : []),
        ]}
      />
    </div>
  );
}
