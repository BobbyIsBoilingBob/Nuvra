import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useStore } from '../store';
import { getAdventureById, getComboTier } from '../data';
import { useGeolocation } from '../hooks/useGeolocation';
import { formatDistance, formatDuration, DEFAULT_CENTER } from '../lib/map-utils';
import { useAuth } from '../lib/auth';
import { Card, Button, Spinner } from '../components/ui';
import { Play, Pause, Clock, Footprints, Gem, Flame, Zap, Coins, Check, X } from 'lucide-react';

const MapView = lazy(() => import('../components/MapView'));

export default function AdventureMap() {
  const { selectedAdventureId, selectedAdventureObj, setScreen, addQuestProgress, recordAdventureComplete } = useStore();
  const { profile, updateProfile } = useAuth();
  const adventure = selectedAdventureObj ?? getAdventureById(selectedAdventureId ?? '');
  const [geo, geoActions] = useGeolocation();
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [treasures] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  useEffect(() => {
    if (active && geo.isMoving && geo.totalDistance > 0) {
      setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; });
      addQuestProgress('distance', geo.totalDistance);
    }
    if (active && !geo.isMoving) setCombo(0);
  }, [geo.isMoving, geo.totalDistance, active, addQuestProgress]);

  const handleStart = () => { setActive(true); geoActions.start(); geoActions.reset(); setElapsed(0); };
  const handlePause = () => setActive(false);
  const handleStop = async () => {
    setActive(false); geoActions.stop();
    if (!adventure || !profile) return;
    const xpEarned = Math.round(adventure.xp * (1 + maxCombo * 0.01));
    await updateProfile({
      xp: profile.xp + xpEarned, coins: profile.coins + adventure.coins, gems: profile.gems + adventure.gems,
      distance_walked: profile.distance_walked + geo.totalDistance,
      steps: profile.steps + Math.round(geo.totalDistance * 1300),
      completed_adventures: profile.completed_adventures + 1,
      treasure_collected: profile.treasure_collected + treasures,
    });
    addQuestProgress('adventures', 1);
    addQuestProgress('treasures', treasures);
    addQuestProgress('combo', maxCombo);
    await recordAdventureComplete({
      adventure_id: adventure.id, adventure_name: adventure.title, emoji: adventure.emoji,
      type: adventure.type, difficulty: adventure.difficulty, distance: geo.totalDistance,
      duration: elapsed, xp_earned: xpEarned, coins_earned: adventure.coins, gems_earned: adventure.gems,
      treasures_found: treasures, max_combo: maxCombo,
    });
    setCompleted(true);
  };

  if (!adventure) return (
    <div className="px-4 pt-4">
      <p className="text-ink-400">Adventure not found.</p>
      <Button onClick={() => setScreen('adventures')} className="mt-4">Back</Button>
    </div>
  );

  const comboTier = getComboTier(combo);

  return (
    <div className="fixed inset-0 flex flex-col bg-ink-950 z-20">
      <div className="flex items-center gap-3 p-4 bg-ink-900/80 backdrop-blur-md z-10">
        <button onClick={() => { geoActions.stop(); setScreen('adventure-detail'); }} className="text-ink-400 hover:text-white"><X size={24} /></button>
        <div className="flex-1">
          <p className="text-white font-semibold">{adventure.emoji} {adventure.title}</p>
          <p className="text-ink-400 text-xs">{formatDistance(geo.totalDistance)} · {formatDuration(elapsed)}</p>
        </div>
        {combo > 0 && (
          <div className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: `${comboTier.color}22`, color: comboTier.color }}>
            {combo}x {comboTier.name}
          </div>
        )}
      </div>
      <div className="flex-1 relative" style={{ minHeight: '300px' }}>
        <div className="absolute inset-0 bg-ink-800/40 rounded-2xl m-2 overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner /></div>}>
            <MapView center={geo.position ?? DEFAULT_CENTER} route={adventure.route} showUserLocation />
          </Suspense>
        </div>
        {!active && !completed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button size="lg" onClick={handleStart} className="flex items-center gap-2"><Play size={20} /> Start Adventure</Button>
          </div>
        )}
        {completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm">
            <Card className="p-6 text-center max-w-xs">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="font-display text-xl font-bold text-white mb-2">Adventure Complete!</h2>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="flex items-center gap-1 text-ink-300"><Footprints size={16} /> {formatDistance(geo.totalDistance)}</div>
                <div className="flex items-center gap-1 text-ink-300"><Clock size={16} /> {formatDuration(elapsed)}</div>
                <div className="flex items-center gap-1 text-zeviqo-400"><Zap size={16} /> +{Math.round(adventure.xp * (1 + maxCombo * 0.01))} XP</div>
                <div className="flex items-center gap-1 text-gold-400"><Coins size={16} /> +{adventure.coins}</div>
              </div>
              <Button onClick={() => setScreen('home')} className="w-full">Done</Button>
            </Card>
          </div>
        )}
      </div>
      {active && (
        <div className="p-4 bg-ink-900/80 backdrop-blur-md">
          <div className="grid grid-cols-4 gap-2 mb-3">
            <StatItem icon={Footprints} label="Distance" value={formatDistance(geo.totalDistance)} color="#00c4ff" />
            <StatItem icon={Clock} label="Time" value={formatDuration(elapsed)} color="#22c55e" />
            <StatItem icon={Gem} label="Treasures" value={treasures} color="#fbbf24" />
            <StatItem icon={Flame} label="Combo" value={`${combo}x`} color="#f97316" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePause} className="flex-1 flex items-center justify-center gap-2"><Pause size={18} /> Pause</Button>
            <Button variant="danger" onClick={handleStop} className="flex-1 flex items-center justify-center gap-2"><Check size={18} /> Finish</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon size={18} color={color} />
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="text-xs text-ink-400">{label}</span>
    </div>
  );
}
