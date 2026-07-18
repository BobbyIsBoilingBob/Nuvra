import { useState } from 'react';
import { MapView } from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { useStore } from '../store';
import { ADVENTURES } from '../data';
import { Card, Screen, Button, Stat, EmptyState } from '../components/ui';
import { ArrowLeft, Play, Pause, Footprints, MapPin, CircleCheck as CheckCircle2 } from 'lucide-react';
import { formatDistance, formatDuration } from '../lib/map-utils';

export default function AdventureMap() {
  const { activeAdventureId, setScreen, questProgress, updateQuest, addHistory } = useStore();
  const adventure = ADVENTURES.find((a) => a.id === activeAdventureId);
  const geo = useGeolocation();
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const toggle = () => {
    if (geo.tracking) { geo.stop(); setStartTime(null); }
    else { geo.start(); setStartTime(Date.now()); }
  };

  useState(() => {
    const i = setInterval(() => { if (startTime) setElapsed(Math.floor((Date.now() - startTime) / 1000)); }, 1000);
    return () => clearInterval(i);
  });

  if (!adventure) return <Screen><EmptyState icon={MapPin} title="No adventure selected" /><Button onClick={() => setScreen('adventures')} className="mt-4">Browse</Button></Screen>;

  const finish = () => {
    for (const q of adventure.quests) updateQuest(q.id, q.target ?? 100, true);
    addHistory({ id: crypto.randomUUID(), adventureName: adventure.name, distance: geo.distance, duration: elapsed, xp: adventure.totalXp, rating: null, completedAt: new Date().toISOString() });
    setDone(true);
  };

  if (done) return (
    <Screen className="flex flex-col justify-center">
      <Card className="p-6 text-center">
        <CheckCircle2 size={48} color="#22c55e" className="mx-auto mb-3" />
        <h2 className="font-display text-xl font-bold text-white mb-2">Adventure Complete!</h2>
        <p className="text-ink-400 mb-4">You earned {adventure.totalXp} XP</p>
        <Button onClick={() => setScreen('home')} className="w-full">Back to Home</Button>
      </Card>
    </Screen>
  );

  return (
    <Screen>
      <button onClick={() => setScreen('adventureDetail')} className="flex items-center gap-1 text-ink-400 text-sm mb-3"><ArrowLeft size={16} /> Back</button>
      <h1 className="font-display text-xl font-bold text-white mb-3">{adventure.emoji} {adventure.name}</h1>
      <div className="h-80 mb-4 rounded-2xl overflow-hidden">
        {geo.position ? <MapView center={[geo.position.lat, geo.position.lng]} route={geo.route} /> : <div className="h-full flex items-center justify-center bg-ink-800/60 rounded-2xl"><p className="text-ink-400">Waiting for GPS...</p></div>}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat icon={Footprints} label="Distance" value={formatDistance(geo.distance)} color="#22c55e" />
        <Stat icon={MapPin} label="Duration" value={formatDuration(elapsed)} color="#3b82f6" />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2" onClick={toggle}>{geo.tracking ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}</Button>
        <Button className="flex-1" onClick={finish}>Finish</Button>
      </div>
    </Screen>
  );
}
