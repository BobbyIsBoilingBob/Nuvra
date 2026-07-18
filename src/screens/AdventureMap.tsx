import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChallenges } from '../hooks/useChallenges';
import { useSeasonal } from '../hooks/useSeasonal';
import { ADVENTURES } from '../data/gameData';
import type { Adventure, Quest } from '../types';
import MapView from '../components/MapView';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Trophy, Coins, Sparkles, Flag, X } from 'lucide-react';

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

const CHECKPOINT_RADIUS_M = 50;

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface QuestProgress { completed: boolean; progress?: number; }

export default function AdventureMap() {
  const resetTo = useStore((s) => s.resetTo);
  const activeAdventureId = useStore((s) => s.activeAdventureId);
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);
  const addItem = useStore((s) => s.addItem);
  const addHistory = useStore((s) => s.addHistory);
  const unlockAchievement = useStore((s) => s.unlockAchievement);
  const markAdventureClaimed = useStore((s) => s.markAdventureClaimed);
  const hasClaimedAdventure = useStore((s) => s.hasClaimedAdventure);
  const customAdventures = useStore((s) => s.customAdventures);
  const { isGuest, profile } = useAuth();
  const { recordAdventureCompletion } = useChallenges();
  const { recordAdventure: recordSeasonal } = useSeasonal();

  const allAdventures: Adventure[] = useMemo(
    () => [...customAdventures, ...ADVENTURES],
    [customAdventures],
  );
  const adventure = useMemo(
    () => allAdventures.find((a) => a.id === activeAdventureId) ?? allAdventures[0],
    [allAdventures, activeAdventureId],
  );

  const geo = useGeolocation();
  const [questProgress, setQuestProgress] = useState<Record<string, QuestProgress>>({});
  const [done, setDone] = useState(false);
  const [showFinishScreen, setShowFinishScreen] = useState(false);

  useEffect(() => {
    geo.start({ lat: adventure.startLat, lng: adventure.startLng });
    return () => geo.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adventure.id]);

  useEffect(() => {
    if (!geo.position) return;
    setQuestProgress((prev) => {
      const next = { ...prev };
      for (const q of adventure.quests) {
        if (q.type === 'checkpoint' && q.lat != null && q.lng != null) {
          const d = haversineMeters(geo.position!, { lat: q.lat, lng: q.lng });
          if (d <= CHECKPOINT_RADIUS_M) next[q.id] = { completed: true };
        }
      }
      return next;
    });
  }, [geo.position, adventure.quests]);

  useEffect(() => {
    setQuestProgress((prev) => {
      const next = { ...prev };
      for (const q of adventure.quests) {
        if (q.type === 'distance' && q.target) {
          next[q.id] = { completed: geo.distance >= q.target, progress: Math.min(geo.distance, q.target) };
        }
      }
      return next;
    });
  }, [geo.distance, adventure.quests]);

  const allQuestsComplete = () => adventure.quests.every((q) => questProgress[q.id]?.completed);
  const minDistance = Math.max(...adventure.quests.filter((q) => q.type === 'distance' && q.target).map((q) => q.target ?? 0), 0);
  const distanceMet = geo.distance >= minDistance;
  const routeMet = geo.route.length >= 2;
  const requirementsMet = allQuestsComplete() && distanceMet && routeMet;
  const alreadyClaimed = activeAdventureId ? hasClaimedAdventure(activeAdventureId) : false;
  const completedCount = adventure.quests.filter((q) => questProgress[q.id]?.completed).length;

  const finish = async () => {
    if (alreadyClaimed || isGuest || !profile || !requirementsMet) return;
    if (!allQuestsComplete() || !distanceMet || !routeMet) return;
    addXp(adventure.rewards.xp);
    addCoins(adventure.rewards.coins);
    adventure.rewards.items?.forEach((id: string) => addItem({ id, name: id, type: 'cosmetic', quantity: 1 }));
    adventure.rewards.achievements?.forEach((id: string) => unlockAchievement(id));
    addHistory({
      id: `${adventure.id}-${Date.now()}`,
      adventureId: adventure.id,
      adventureTitle: adventure.title,
      completedAt: new Date().toISOString(),
      distance: geo.distance,
      duration: adventure.durationMin,
      xp: adventure.rewards.xp,
      coins: adventure.rewards.coins,
    });
    if (activeAdventureId) markAdventureClaimed(activeAdventureId);
    await recordAdventureCompletion(geo.distance);
    await recordSeasonal(geo.distance);
    geo.stop();
    setDone(true);
    setShowFinishScreen(true);
  };

  const cancel = () => { geo.stop(); geo.reset(); resetTo('home'); };
  const checkpoints = adventure.quests
    .filter((q) => q.type === 'checkpoint' && q.lat != null && q.lng != null)
    .map((q) => ({ lat: q.lat!, lng: q.lng! }));

  return (
    <div className="flex flex-col h-screen">
      <Header title={adventure.title} back={false} right={
        <button onClick={cancel} aria-label="Cancel adventure" className="text-ink-300 hover:text-error-400 transition-colors"><X size={20} /></button>
      } />
      <div className="flex-1 relative">
        <MapView
          center={geo.position ?? { lat: adventure.startLat, lng: adventure.startLng }}
          route={geo.route}
          fitRoute={geo.route.length >= 2}
          checkpoints={checkpoints}
          followPlayer
        />
        <div className="absolute top-3 left-3 right-3 pointer-events-none">
          <Card className="p-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm">{completedCount}/{adventure.quests.length} quests</span>
              <span className="text-ink-300 text-sm">{formatDistance(geo.distance)}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-ink-700 overflow-hidden">
              <div className="h-full bg-brand-400 transition-all" style={{ width: `${(completedCount / adventure.quests.length) * 100}%` }} />
            </div>
          </Card>
        </div>
      </div>
      <div className="px-4 py-4 bg-ink-900/90 backdrop-blur-md border-t border-ink-800 max-w-lg mx-auto w-full">
        {geo.error && (
          <div className="mb-3 p-3 rounded-xl bg-error-500/10 border border-error-500/30 flex items-start gap-2">
            <AlertCircle size={18} color="#f87171" className="flex-shrink-0 mt-0.5" />
            <p className="text-error-400 text-sm">{geo.error}</p>
          </div>
        )}
        {alreadyClaimed && (
          <div className="mb-3 p-3 rounded-xl bg-success-500/10 border border-success-500/30 flex items-start gap-2">
            <CheckCircle2 size={18} color="#4ade80" className="flex-shrink-0 mt-0.5" />
            <p className="text-success-400 text-sm">Rewards already claimed for this adventure.</p>
          </div>
        )}
        {!alreadyClaimed && !requirementsMet && (
          <div className="mb-3 p-3 rounded-xl bg-ink-700/30 border border-ink-600/30 flex items-start gap-2">
            <AlertCircle size={18} color="#94a3b8" className="flex-shrink-0 mt-0.5" />
            <p className="text-ink-300 text-sm">
              Complete all quests to finish. {completedCount}/{adventure.quests.length} quests done,{' '}
              {formatDistance(geo.distance)}/{formatDistance(minDistance)} distance.
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={cancel}>Cancel</Button>
          <Button className="flex-1" onClick={finish} disabled={done || alreadyClaimed || !requirementsMet}>
            <Flag size={18} /> {done ? 'Finished' : 'Finish Adventure'}
          </Button>
        </div>
      </div>
      {showFinishScreen && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card className="p-6 max-w-sm w-full text-center animate-slide-up">
            <div className="h-16 w-16 rounded-full bg-success-500/20 border border-success-500/40 flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} className="text-accent-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Adventure Complete!</h2>
            <p className="text-ink-300 mt-2">You finished {adventure.title}</p>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-1 text-brand-300"><Sparkles size={18} /> +{adventure.rewards.xp} XP</div>
              <div className="flex items-center gap-1 text-accent-400"><Coins size={18} /> +{adventure.rewards.coins}</div>
            </div>
            <Button className="w-full mt-6" onClick={() => resetTo('home')}>Back to Home</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
