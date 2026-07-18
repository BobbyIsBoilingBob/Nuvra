import { useState } from 'react';
import { useStore } from '../store';
import { generateAdventure } from '../data';
import { Card, Screen, Button, Badge } from '../components/ui';
import { Wand as Wand2, Sparkles, MapPin, Clock, Zap, RefreshCw } from 'lucide-react';

export default function AIGenerator() {
  const { setScreen, setActiveAdventure } = useStore();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<ReturnType<typeof generateAdventure> | null>(null);
  const generate = () => { setLoading(true); setTimeout(() => { setGenerated(generateAdventure()); setLoading(false); }, 1200); };
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">AI Adventure Generator</h1>
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Wand2 size={24} color="#a78bfa" />
          <div><h3 className="font-semibold text-white">Generate a unique adventure</h3><p className="text-ink-400 text-sm">AI creates a custom adventure tailored for you</p></div>
        </div>
        <Button onClick={generate} disabled={loading} className="w-full flex items-center justify-center gap-2">
          {loading ? <><RefreshCw size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Adventure</>}
        </Button>
      </Card>
      {generated && (
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div><h3 className="font-semibold text-white text-lg">{generated.name}</h3><p className="text-ink-400 text-sm">{generated.description}</p></div>
            <Badge color="#a78bfa">{generated.theme}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center gap-1.5"><MapPin size={14} color="#94a3b8" /><span className="text-white text-sm">{generated.quests.length} quests</span></div>
            <div className="flex items-center gap-1.5"><Clock size={14} color="#94a3b8" /><span className="text-white text-sm">~{generated.estimatedMinutes} min</span></div>
            <div className="flex items-center gap-1.5"><Zap size={14} color="#fbbf24" /><span className="text-white text-sm">{generated.totalXp} XP</span></div>
          </div>
          <Button onClick={() => { setActiveAdventure(generated.id); setScreen('adventureDetail'); }} className="w-full">Start Adventure</Button>
        </Card>
      )}
    </Screen>
  );
}
