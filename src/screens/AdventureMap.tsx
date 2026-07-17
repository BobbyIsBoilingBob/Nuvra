import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar, ConfirmDialog, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getAdventureById, getComboTier, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';
import { routeToLatLngs, DEFAULT_CENTER, formatDistance, formatDuration, createGpsFilter, filterGpsReading, type GpsFilter } from '../lib/map-utils';
import { MapView, type MapMarkerData, type MapRouteData } from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { vibrate } from '../lib/settings';

type GpsState = 'idle' | 'starting' | 'tracking' | 'paused' | 'completed' | 'denied' | 'error';

export function AdventureMap() {
  const { selectedAdventureId, goBack, recordAdventureComplete, addQuestProgress } = useStore();
  const { profile, updateProfile } = useAuth();
  const adventure = getAdventureById(selectedAdventureId ?? '');

  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const geo = useGeolocation(gpsState === 'tracking' || gpsState === 'starting');
  const [distance, setDistance] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [objectivesDone, setObjectivesDone] = useState<boolean[]>([]);
  const [treasuresFound, setTreasuresFound] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{ icon: string; label: string; amount: number; color: string }[]>([]);

  const gpsFilterRef = useRef<GpsFilter>(createGpsFilter());
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const routeLatLngs = useMemo(() => {
    if (!adventure) return [];
    return routeToLatLngs(adventure.route, DEFAULT_CENTER);
  }, [adventure]);

  const mapMarkers: MapMarkerData[] = useMemo(() => {
    const markers: MapMarkerData[] = [];
    if (routeLatLngs.length > 0) {
      markers.push({ id: 'start', position: routeLatLngs[0], type: 'start', label: 'Start' });
      markers.push({ id: 'finish', position: routeLatLngs[routeLatLngs.length - 1], type: 'finish', label: 'Finish' });
    }
    if (geo.position) {
      markers.push({ id: 'player', position: geo.position, type: 'player' });
    }
    return markers;
  }, [routeLatLngs, geo.position]);

  const mapRoutes: MapRouteData[] = useMemo(() => {
    if (routeLatLngs.length < 2) return [];
    return [{ id: 'route', positions: routeLatLngs, color: '#00c4ff', weight: 4, dashed: true }];
  }, [routeLatLngs]);

  // Start tracking when GPS is granted
  useEffect(() => {
    if (gpsState === 'starting' && geo.status === 'granted') {
      setGpsState('tracking');
      startTimeRef.current = Date.now();
      setObjectivesDone(new Array(adventure?.objectives.length ?? 0).fill(false));
    }
    if (gpsState === 'starting' && (geo.status === 'denied' || geo.status === 'unavailable' || geo.status === 'error')) {
      setGpsState('denied');
    }
  }, [geo.status, gpsState, adventure]);

  // Timer
  useEffect(() => {
    if (gpsState === 'tracking') {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [gpsState]);

  // GPS reading processing
  useEffect(() => {
    if (gpsState !== 'tracking' || !geo.position) return;
    const result = filterGpsReading(gpsFilterRef.current, geo.position.lat, geo.position.lng, Date.now());
    if (result.accepted && result.distance > 0) {
      setDistance(prev => prev + result.distance);
      if (geo.movement === 'walking') {
        setCombo(prev => {
          const next = prev + 1;
          setMaxCombo(m => Math.max(m, next));
          return next;
        });
      } else {
        setCombo(prev => prev > 0 ? 0 : prev);
      }
    }
  }, [geo.position, geo.movement, gpsState]);

  // Complete objectives based on distance progress
  useEffect(() => {
    if (!adventure || gpsState !== 'tracking') return;
    const progress = adventure.distance > 0 ? distance / adventure.distance : 0;
    const newDone = adventure.objectives.map((_, i) => {
      const threshold = (i + 1) / adventure.objectives.length;
      return progress >= threshold;
    });
    const justCompleted = newDone.some((d, i) => d && !objectivesDone[i]);
    if (justCompleted) {
      vibrate(30);
      setTreasuresFound(prev => prev + 1);
    }
    setObjectivesDone(newDone);
  }, [distance, adventure, gpsState]);

  // Check completion
  useEffect(() => {
    if (!adventure || completedRef.current || gpsState !== 'tracking') return;
    if (distance >= adventure.distance * 0.95) {
      completedRef.current = true;
      handleComplete();
    }
  }, [distance, adventure, gpsState]);

  async function handleComplete() {
    if (!adventure || !profile) return;
    setGpsState('completed');
    if (timerRef.current) clearInterval(timerRef.current);
    vibrate([50, 30, 50]);

    const comboTier = getComboTier(maxCombo);
    const xpEarned = Math.round(adventure.xp * comboTier.multiplier);
    const coinsEarned = Math.round(adventure.coins * comboTier.multiplier);
    const gemsEarned = adventure.gems;

    setRewardData([
      { icon: 'Zap', label: 'XP', amount: xpEarned, color: 'text-zeviqo-300' },
      { icon: 'Coins', label: 'Coins', amount: coinsEarned, color: 'text-gold-400' },
      ...(gemsEarned > 0 ? [{ icon: 'Gem', label: 'Gems', amount: gemsEarned, color: 'text-zeviqo-300' }] : []),
      { icon: 'Route', label: 'Distance', amount: Math.round(distance * 1000), color: 'text-zeviqo-400' },
    ]);

    await recordAdventureComplete({
      adventure_id: adventure.id,
      adventure_name: adventure.title,
      emoji: adventure.emoji,
      type: adventure.type,
      difficulty: adventure.difficulty,
      distance,
      duration: elapsed,
      xp_earned: xpEarned,
      coins_earned: coinsEarned,
      gems_earned: gemsEarned,
      treasures_found: treasuresFound,
      max_combo: maxCombo,
    });

    await updateProfile({
      xp: (profile.xp ?? 0) + xpEarned,
      coins: (profile.coins ?? 0) + coinsEarned,
      gems: (profile.gems ?? 0) + gemsEarned,
      distance_walked: (profile.distance_walked ?? 0) + distance,
      steps: (profile.steps ?? 0) + Math.round(distance * 1300),
      completed_adventures: (profile.completed_adventures ?? 0) + 1,
      treasure_collected: (profile.treasure_collected ?? 0) + treasuresFound,
      last_walk_date: new Date().toISOString().split('T')[0],
    });

    addQuestProgress('distance', distance);
    addQuestProgress('adventures', 1);
    addQuestProgress('treasures', treasuresFound);
    addQuestProgress('combo', maxCombo);

    setShowReward(true);
  }

  if (!adventure) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AdventureBg />
        <div className="relative z-10 text-center">
          <p className="text-sm text-white/40">No adventure selected</p>
          <Button onClick={goBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const comboTier = getComboTier(combo);
  const progressPct = Math.min(100, (distance / adventure.distance) * 100);

  return (
    <div className="relative min-h-screen">
      <AdventureBg accent={DIFFICULTY_COLORS[adventure.difficulty]} />
      <TopBar title={adventure.title} showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-3">
        {gpsState === 'idle' && (
          <GlassCard className="p-6 text-center">
            <div className="text-4xl mb-3">{adventure.emoji}</div>
            <h2 className="text-lg font-display font-bold text-white mb-2">{adventure.title}</h2>
            <p className="text-sm text-white/50 mb-4">{formatDistance(adventure.distance)} · {formatDuration(adventure.duration * 60)}</p>
            <Button fullWidth size="lg" icon="Play" onClick={() => setGpsState('starting')}>
              Start GPS Tracking
            </Button>
          </GlassCard>
        )}

        {gpsState === 'starting' && (
          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-zeviqo-400 border-t-transparent animate-spin" />
            <p className="text-sm text-white/60">Finding your location...</p>
          </GlassCard>
        )}

        {gpsState === 'denied' && (
          <GlassCard className="p-6 text-center">
            <Icon name="MapPin" size={32} className="text-rose-400 mx-auto mb-3" />
            <p className="text-sm text-white/60 mb-4">Location permission denied. Enable GPS to start your adventure.</p>
            <Button fullWidth onClick={() => setGpsState('starting')}>Try Again</Button>
          </GlassCard>
        )}

        {(gpsState === 'tracking' || gpsState === 'paused' || gpsState === 'completed') && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <GlassCard className="p-3 text-center">
                <p className="text-[10px] text-white/40 mb-1">Distance</p>
                <p className="text-sm font-bold text-white">{formatDistance(distance)}</p>
                <p className="text-[9px] text-white/30">of {formatDistance(adventure.distance)}</p>
              </GlassCard>
              <GlassCard className="p-3 text-center">
                <p className="text-[10px] text-white/40 mb-1">Time</p>
                <p className="text-sm font-bold text-white">{formatDuration(elapsed)}</p>
              </GlassCard>
              <GlassCard className="p-3 text-center">
                <p className="text-[10px] text-white/40 mb-1">Combo</p>
                <p className="text-sm font-bold" style={{ color: comboTier.color }}>{combo}x</p>
                <p className="text-[9px]" style={{ color: comboTier.color }}>{comboTier.name}</p>
              </GlassCard>
            </div>

            <GlassCard className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Progress</span>
                <span className="text-[10px] text-white/40">{Math.round(progressPct)}%</span>
              </div>
              <ProgressBar value={progressPct} max={100} accent="from-zeviqo-400 to-zeviqo-500" />
            </GlassCard>

            <GlassCard className="p-3">
              <p className="text-xs font-bold text-white mb-2">Objectives</p>
              <div className="space-y-1.5">
                {adventure.objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${objectivesDone[i] ? 'bg-zeviqo-500/30' : 'glass'}`}>
                      {objectivesDone[i] ? <Icon name="Check" size={12} className="text-zeviqo-300" /> : <span className="text-[9px] text-white/40">{i + 1}</span>}
                    </div>
                    <p className={`text-xs ${objectivesDone[i] ? 'text-zeviqo-300 line-through' : 'text-white/60'}`}>{obj}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}

        <GlassCard className="p-0 overflow-hidden h-64">
          <MapView
            center={geo.position ?? DEFAULT_CENTER}
            zoom={16}
            markers={mapMarkers}
            routes={mapRoutes}
            followPlayer={gpsState === 'tracking'}
            playerHeading={geo.heading}
            accuracy={geo.accuracy}
          />
        </GlassCard>

        {gpsState === 'tracking' && (
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth icon="Pause" onClick={() => setGpsState('paused')}>Pause</Button>
            <Button variant="danger" fullWidth icon="X" onClick={() => setShowCancel(true)}>Cancel</Button>
          </div>
        )}
        {gpsState === 'paused' && (
          <div className="flex gap-2">
            <Button fullWidth icon="Play" onClick={() => setGpsState('tracking')}>Resume</Button>
            <Button variant="danger" fullWidth icon="X" onClick={() => setShowCancel(true)}>Cancel</Button>
          </div>
        )}
        {gpsState === 'completed' && !showReward && (
          <Button fullWidth size="lg" icon="Check" onClick={goBack}>Finish</Button>
        )}
      </div>

      <ConfirmDialog
        visible={showCancel}
        title="Cancel Adventure?"
        message="Your progress will be lost. Are you sure?"
        confirmLabel="Cancel Adventure"
        danger
        onConfirm={() => { if (timerRef.current) clearInterval(timerRef.current); goBack(); }}
        onCancel={() => setShowCancel(false)}
      />

      <RewardPopup
        visible={showReward}
        onClose={() => { setShowReward(false); goBack(); }}
        rewards={rewardData}
      />
    </div>
  );
}
