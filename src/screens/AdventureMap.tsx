import { useState, useEffect, useRef } from 'react';
import { Icon, GlassCard, Button, ProgressBar, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ADVENTURES, getComboTier } from '../data';
import { haversineDistance, formatDistance, type LatLng } from '../lib/map-utils';

export function AdventureMap(): React.ReactElement {
  const { selectedAdventureId, setScreen, recordAdventureComplete, recordDistance, recordTreasureFound } = useStore();
  const adventure = ADVENTURES.find((a) => a.id === selectedAdventureId);

  const [phase, setPhase] = useState<'active' | 'complete'>('active');
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [treasures, setTreasures] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<Array<{ icon: string; label: string; amount: number; color: string }>>([]);
  const [paused, setPaused] = useState(false);
  const startPosRef = useRef<LatLng | null>(null);
  const lastPosRef = useRef<LatLng | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate GPS tracking
  useEffect(() => {
    if (phase !== 'active' || paused) return;

    // Try real geolocation
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const current: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (startPosRef.current === null) startPosRef.current = current;
          if (lastPosRef.current) {
            const d = haversineDistance(lastPosRef.current, current);
            if (d > 2 && d < 100) {
              setDistance((prev) => prev + d);
              recordDistance(d);
              if (Math.random() < 0.15) {
                const coinGain = Math.floor(Math.random() * 20) + 10;
                setCoins((prev) => prev + coinGain);
                recordTreasureFound(coinGain);
                setCombo((c) => c + 1);
              }
            }
          }
          lastPosRef.current = current;
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    }

    // Timer
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    // Simulate distance if no GPS
    const simInterval = setInterval(() => {
      if (!lastPosRef.current) {
        const d = 15 + Math.random() * 10;
        setDistance((prev) => prev + d);
        recordDistance(d);
        if (Math.random() < 0.2) {
          const coinGain = Math.floor(Math.random() * 20) + 10;
          setCoins((prev) => prev + coinGain);
          recordTreasureFound(coinGain);
          setCombo((c) => c + 1);
        }
      }
    }, 2000);

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(simInterval);
    };
  }, [phase, paused, recordDistance, recordTreasureFound]);

  const handleComplete = () => {
    if (!adventure) return;
    const comboTier = getComboTier(combo);
    const xpReward = Math.round(adventure.xpReward * comboTier.multiplier);
    const coinReward = coins + adventure.coinReward;
    const gemReward = adventure.gemReward;

    recordAdventureComplete(adventure.id, xpReward, coinReward, gemReward, false);
    setPhase('complete');
    setRewardData([
      { icon: 'Zap', label: 'XP', amount: xpReward, color: 'text-nova-300' },
      { icon: 'Coins', label: 'Coins', amount: coinReward, color: 'text-gold-300' },
      ...(gemReward > 0 ? [{ icon: 'Gem', label: 'Gems', amount: gemReward, color: 'text-plasma-400' }] : []),
    ]);
    setShowReward(true);
  };

  if (!adventure) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AdventureBg />
        <div className="relative z-10">
          <TopBar showBack title="Adventure" />
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-white/40">Adventure not found</p>
            <Button variant="secondary" className="mt-4" onClick={() => setScreen('adventures')}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6">
        <AdventureBg accent="#33ffd6" />
        <RewardPopup rewards={rewardData} visible={showReward} onClose={() => setShowReward(false)} />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm w-full">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-nova-400 to-plasma-500 flex items-center justify-center text-5xl shadow-glow-lg animate-[bounce-in_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
            {adventure.emoji}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Adventure Complete!</h2>
            <p className="text-sm text-white/50 mt-1">{adventure.name}</p>
          </div>
          <GlassCard className="p-5 w-full">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Distance</span>
                <span className="text-sm font-bold text-white">{formatDistance(distance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Time</span>
                <span className="text-sm font-bold text-white">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Treasures</span>
                <span className="text-sm font-bold text-white">{treasures}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Max Combo</span>
                <span className="text-sm font-bold text-nova-300">{combo}x</span>
              </div>
            </div>
          </GlassCard>
          <Button variant="primary" size="lg" fullWidth icon="Home" onClick={() => setScreen('home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const comboTier = getComboTier(combo);
  const targetDistance = adventure.distanceKm * 1000;
  const progressPct = Math.min(100, (distance / targetDistance) * 100);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AdventureBg accent={adventure.theme === 'forest' ? '#22c55e' : '#33ffd6'} />
      <div className="relative z-10">
        <TopBar showBack title={adventure.name} showCurrencies={false} />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 mt-4">
          {/* Map placeholder */}
          <GlassCard className="p-6 flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-plasma-400/20 to-nova-500/20 flex items-center justify-center text-6xl">
              {adventure.emoji}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Icon name="MapPin" size={14} className="text-cyan-300" />
              <span>GPS tracking active</span>
            </div>
          </GlassCard>

          {/* Progress */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/60">Progress</span>
              <span className="text-xs text-white/40">{formatDistance(distance)} / {adventure.distanceKm} km</span>
            </div>
            <ProgressBar value={progressPct} accent="from-nova-400 to-cyan-300" height={10} />
          </GlassCard>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-2">
            <GlassCard className="p-3 text-center">
              <Icon name="Clock" size={18} className="text-white/60 mx-auto mb-1" />
              <div className="text-sm font-black text-white">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
              <div className="text-[10px] text-white/40">Time</div>
            </GlassCard>
            <GlassCard className="p-3 text-center">
              <Icon name="Coins" size={18} className="text-gold-300 mx-auto mb-1" />
              <div className="text-sm font-black text-white">{coins}</div>
              <div className="text-[10px] text-white/40">Coins</div>
            </GlassCard>
            <GlassCard className="p-3 text-center">
              <Icon name="Gem" size={18} className="text-plasma-400 mx-auto mb-1" />
              <div className="text-sm font-black text-white">{treasures}</div>
              <div className="text-[10px] text-white/40">Treasures</div>
            </GlassCard>
          </div>

          {/* Combo */}
          {combo > 0 && (
            <GlassCard className="p-3 flex items-center justify-center gap-2 animate-[scale-in_0.2s_ease-out]" style={{ borderColor: comboTier.color }}>
              <Icon name="Zap" size={18} style={{ color: comboTier.color }} />
              <span className="text-sm font-black" style={{ color: comboTier.color }}>{combo}x Combo</span>
              <span className="text-xs text-white/40">· {comboTier.name} ({comboTier.multiplier}x XP)</span>
            </GlassCard>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="secondary" icon={paused ? 'Play' : 'Pause'} onClick={() => setPaused((p) => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="danger" icon="Flag" fullWidth onClick={handleComplete}>
              Complete Adventure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
