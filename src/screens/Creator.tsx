import { useState } from 'react';
import { useStore } from '../store';
import { Card, Screen, Button, EmptyState, Badge } from '../components/ui';
import { SquarePen as PenSquare, Plus, Trash2, MapPin, Clock, Zap } from 'lucide-react';

export default function Creator() {
  const { setScreen } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quests, setQuests] = useState<{ id: string; title: string; xp: number }[]>([]);
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Adventure Creator</h1>
      <Card className="p-4 mb-4"><label className="text-ink-400 text-sm font-semibold uppercase mb-1 block">Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="My Custom Adventure" className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 mb-3" /><label className="text-ink-400 text-sm font-semibold uppercase mb-1 block">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your adventure..." className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 h-20 resize-none" /></Card>
      <div className="flex items-center justify-between mb-3"><h3 className="text-ink-400 text-sm font-semibold uppercase">Quests ({quests.length})</h3><Button size="sm" variant="ghost" onClick={() => setQuests([...quests, { id: crypto.randomUUID(), title: 'New Quest', xp: 50 }])}><Plus size={16} /> Add Quest</Button></div>
      {quests.length === 0 ? <EmptyState icon={PenSquare} title="No quests yet" subtitle="Add quests to your custom adventure" /> : <div className="space-y-2">{quests.map((q, i) => (<Card key={q.id} className="p-3 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zeviqo-500/20 flex items-center justify-center text-zeviqo-400 text-sm font-bold">{i + 1}</div><input value={q.title} onChange={e => setQuests(quests.map(x => x.id === q.id ? { ...x, title: e.target.value } : x))} className="flex-1 bg-transparent text-white" /><Badge color="#fbbf24"><Zap size={10} className="inline" /> {q.xp}</Badge><button onClick={() => setQuests(quests.filter(x => x.id !== q.id))}><Trash2 size={16} color="#ef4444" /></button></Card>))}</div>}
      <Button className="w-full mt-4" disabled={!name} onClick={() => setScreen('adventures')}>Save Adventure</Button>
    </Screen>
  );
}
