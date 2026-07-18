import { useState, useEffect, useRef } from 'react';
import { MapView } from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { ADVENTURES } from '../data';
import { Card, Screen, Button, Stat, EmptyState, ProgressBar, Badge } from '../components/ui';
import { ArrowLeft, Play, Pause, Footprints, MapPin, CircleCheck as CheckCircle2, Circle, Zap, CircleAlert as AlertCircle, Trophy } from 'lucide-react';
import { formatDistance, formatDuration } from '../lib/map-utils';

export default function AdventureMap() {
  const { activeAdventureId, setScreen, questProgress, updateQuest, addHistory, markAdventureClaimed, hasClaimedAdventure } = useStore();
  const { profile, updateProfile, isGuest } = useAuth();
  const adventure = ADVENTURES.find((a) => a.id === activeAdventureId);
  const geo = useGeolocation();
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [showFinishScreen, setShowFinishScreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startTime) { timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime]);

  const toggle = () => { if (geo.tracking) { geo.stop(); } else { geo.start(); setStartTime(Date.now() - elapsed * 1000); } };

  if (!adventure) return <Screen><EmptyState icon={MapPin} title="No adventure selected" /><Button onClick={() => setScreen('adventures')} className="mt-4">Browse</Button></Screen>;

  const alreadyClaimed = activeAdventureId ? hasClaimedAdventure(activeAdventureId) : false;

  const updateDistanceQuests = () => {
    for (const q of adventure.quests) {
      if (q.type === 'distance' && q.target) {
        const currentProg = questProgress[q.id]?.progress ?? 0;
        if (geo.distance > currentProg) updateQuest(q.id, geo.distance, geo.distance >= q.target);
      }
    }
  };

  useEffect(() => { if (geo.tracking) updateDistanceQuests(); }, [geo.distance, geo.tracking]);

  const allQuestsComplete = () => adventure.quests.every((q) => questProgress[q.id]?.completed);
  const completedCount = adventure.quests.filter((q) => questProgress[q.id]?.completed).length;
  const minDistance = Math.max(...adventure.quests.filter((q) => q.type === 'distance' && q.target).map((q) => q.target ?? 0), 0);
  const distanceMet = geo.distance >= minDistance;
  const routeMet = geo.route.length >= 2;
  const requirementsMet = allQuestsComplete() && distanceMet && routeMet;

  const finish = () => {
    if (alreadyClaimed || isGuest || !profile || !requirementsMet) return;
    updateDistanceQuests();
    if (!allQuestsComplete() || !distanceMet || !routeMet) return;
    for (const q of adventure.quests) { if (!questProgress[q.id]?.completed) updateQuest(q.id, q.target ?? 100, true); }
    addHistory({ id: crypto.randomUUID(), adventureName: adventure.name, distance: geo.distance, duration: elapsed, xp: adventure.totalXp, rating: null, completedAt: new Date().toISOString() });
    updateProfile({ xp: profile.xp + adventure.totalXp, coins: profile.coins + Math.floor(adventure.totalXp / 2), distance_walked: profile.distance_walked + geo.distance, completed_adventures: profile.completed_adventures + 1 });
    if (activeAdventureId) markAdventureClaimed(activeAdventureId);
    geo.stop(); setDone(true); setShowFinishScreen(true);
  };

  if (showFinishScreen) return (
    <Screen className="flex flex-col justify-center">
      <Card className="p-6 text-center">
        <CheckCircle2 size={48} color="#22c55e" className="mx-auto mb-3" />
        <h2 className="font-display text-xl font-bold text-white mb-2">Adventure Complete!</h2>
        <p className="text-ink-400 mb-4">You earned {adventure.totalXp} XP and {Math.floor(adventure.totalXp / 2)} coins</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat icon={Footprints} label="Distance" value={formatDistance(geo.distance)} color="#22c55e" />
          <Stat icon={MapPin} label="Duration" value={formatDuration(elapsed)} color="#3b82f6" />
        </div>
        <Button onClick={() => setScreen('home')} className="w-full">Back to Home</Button>
      </Card>
    </Screen>
  );

  return (
    <Screen>
      <button onClick={() => { geo.stop(); setScreen('adventureDetail'); }} className="flex items-center gap-1 text-ink-400 text-sm mb-3"><ArrowLeft size={16} /> Back</button>
      <h1 className="font-display text-xl font-bold text-white mb-3">{adventure.emoji} {adventure.name}</h1>

      <div className="h-80 mb-4 rounded-2xl overflow-hidden">
        {geo.position ? <MapView center={[geo.position.lat, geo.position.lng]} route={geo.route} fitRoute={geo.route.length >= 2} /> : <div className="h-full flex items-center justify-center bg-ink-800/60 rounded-2xl"><p className="text-ink-400">Waiting for GPS... Press Start to begin.</p></div>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat icon={Footprints} label="Distance" value={formatDistance(geo.distance)} color="#22c55e" />
        <Stat icon={MapPin} label="Duration" value={formatDuration(elapsed)} color="#3b82f6" />
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Quests ({completedCount}/{adventure.quests.length})</h3>
          <Badge color={requirementsMet ? '#22c55e' : '#fbbf24'}>{requirementsMet ? 'Ready' : 'In Progress'}</Badge>
        </div>
        <div className="space-y-2">
          {adventure.quests.map((q, i) => {
            const prog = questProgress[q.id]; const qDone = prog?.completed;
            return (
              <div key={q.id} className="flex items-center gap-2">
                {qDone ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="#64748b" />}
                <div className="flex-1">
                  <p className={`text-sm ${qDone ? 'text-white' : 'text-ink-300'}`}>{i + 1}. {q.title}</p>
                  {q.target && q.type === 'distance' && <div className="mt-1"><ProgressBar value={prog?.progress ?? geo.distance} max={q.target} color={qDone ? '#22c55e' : '#3b82f6'} /></div>}
                </div>
                <Badge color="#fbbf24"><Zap size={10} className="inline" /> {q.xp}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {alreadyClaimed && (
        <div className="mb-3 p-3 rounded-xl bg-zeviqo-500/10 border border-zeviqo-500/20 flex items-start gap-2">
          <Trophy size={18} color="#fbbf24" className="flex-shrink-0 mt-0.5" />
          <p className="text-zeviqo-400 text-sm">Rewards already claimed for this adventure.</p>
        </div>
      )}

      {!alreadyClaimed && !requirementsMet && (
        <div className="mb-3 p-3 rounded-xl bg-ink-700/30 border border-ink-600/30 flex items-start gap-2">
          <AlertCircle size={18} color="#94a3b8" className="flex-shrink-0 mt-0.5" />
          <p className="text-ink-300 text-sm">Complete the adventure to finish. {completedCount}/{adventure.quests.length} quests done, {formatDistance(geo.distance)}/{formatDistance(minDistance)} distance.</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2" onClick={toggle}>
          {geo.tracking ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
        </Button>
        <Button className="flex-1 flex items-center justify-center gap-2" onClick={finish} disabled={done || alreadyClaimed || !requirementsMet}>
          <CheckCircle2 size={18} /> Finish
        </Button>
      </div>
    </Screen>
  );
}
