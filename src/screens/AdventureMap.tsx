import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useAdventures } from '../hooks/useAdventures';
import { ADVENTURES, routePointsForAdventure, checkpointsForAdventure, challengesForAdventure } from '../data/gameData';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChallenges } from '../hooks/useChallenges';
import { useSeasonal } from '../hooks/useSeasonal';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { MapView } from '../components/MapView';
import type { GeoPoint } from '../types';

export default function AdventureMap() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const activeId = useStore((s) => s.activeAdventureId);
  const customAdventures = useStore((s) => s.customAdventures);
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);
  const addHistory = useStore((s) => s.addHistory);
  const markAdventureClaimed = useStore((s) => s.markAdventureClaimed);
  const unlockAchievement = useStore((s) => s.unlockAchievement);
  const { adventures: saved } = useAdventures();
  const { recordAdventureCompletion } = useChallenges();
  const { recordProgress } = useSeasonal();
  const all = [...customAdventures, ...saved, ...ADVENTURES];
  const adv = all.find((a) => a.id === activeId);

  const [tracking, setTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [done, setDone] = useState(false);
  const { position, error } = useGeolocation(tracking);
  const [lastPos, setLastPos] = useState<GeoPoint | null>(null);

  useEffect(() => {
    if (!position) return;
    if (!lastPos) { setLastPos(position); return; }
    const dlat = position.lat - lastPos.lat;
    const dlng = position.lng - lastPos.lng;
    const m = Math.sqrt(dlat * dlat + dlng * dlng) * 111000;
    if (m > 2) { setDistance((d) => d + m); setLastPos(position); }
  }, [position, lastPos]);

  if (!adv) {
    return <div><Header title="Adventure" onBack={goBack} /><div className="p-6 text-center text-ink-500">Adventure not found.</div></div>;
  }

  const checkpoints = checkpointsForAdventure(adv);
  const challenges = challengesForAdventure(adv);
  const route = routePointsForAdventure(adv);

  async function finish() {
    if (!adv) return;
    setDone(true); setTracking(false);
    addXp(adv.rewards.xp); addCoins(adv.rewards.coins); markAdventureClaimed(adv.id);
    if (adv.rewards.achievements) adv.rewards.achievements.forEach((id) => unlockAchievement(id));
    addHistory({ id: `${adv.id}-${Date.now()}`, adventureId: adv.id, adventureTitle: adv.title, completedAt: new Date().toISOString(), distance: Math.round(distance), duration: Math.round(distance / 80), xp: adv.rewards.xp, coins: adv.rewards.coins });
    try { await recordAdventureCompletion(adv.id, Math.round(distance)); } catch { /* ignore */ }
    try { await recordProgress(Math.round(distance)); } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title={adv.title} onBack={goBack} subtitle={done ? 'Completed!' : `${(distance / 1000).toFixed(2)} km`} />
      <div className="flex-1 min-h-0">
        <MapView player={position} checkpoints={checkpoints} challenges={challenges} route={route} fitBounds showStartFinish />
      </div>
      <div className="p-4 bg-white border-t border-ink-100">
        {error && <p className="text-sm text-error-600 mb-2">GPS: {error}</p>}
        {done ? (
          <Button fullWidth variant="success" onClick={() => navigate('rewards')}>Claim Rewards</Button>
        ) : tracking ? (
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setTracking(false)}>Pause</Button>
            <Button fullWidth onClick={finish}>Finish</Button>
          </div>
        ) : (
          <Button fullWidth onClick={() => setTracking(true)}>Start Tracking</Button>
        )}
      </div>
    </div>
  );
}
