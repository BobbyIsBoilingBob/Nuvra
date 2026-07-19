import { useStore } from '../store';
import { useQuests } from '../hooks/useQuests';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { CircleCheck as CheckCircle2, Circle, Clock, Lock } from 'lucide-react';

export default function Quests() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const setActiveQuestId = useStore((s) => s.setActiveQuestId);
  const { quests, loading, error, refresh } = useQuests();
  if (loading) return (<div><Header title="Quests" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  if (error) return (<div><Header title="Quests" onBack={goBack} /><div className="px-4 py-8 text-center text-error-600">{error}<button onClick={refresh} className="block mx-auto mt-2 underline">Retry</button></div></div>);
  const active = quests.filter((q) => !q.completed);
  const done = quests.filter((q) => q.completed);
  return (
    <div>
      <Header title="Quests" onBack={goBack} subtitle={`${active.length} active · ${done.length} completed`} />
      <div className="px-4 py-4 space-y-4">
        {active.length > 0 && (<div><h2 className="font-semibold mb-2">Active</h2><div className="space-y-2">{active.map((q) => (<Card key={q.id} onClick={() => { setActiveQuestId(q.id); navigate('questDetail'); }} className="flex items-start gap-3"><div className="mt-0.5"><Circle size={20} className="text-brand-500" /></div><div className="flex-1"><h3 className="font-medium">{q.title}</h3><p className="text-sm text-ink-500">{q.description}</p><div className="flex items-center gap-2 mt-1 text-xs text-ink-400"><Clock size={12} />{q.expiresAt ? new Date(q.expiresAt).toLocaleDateString() : 'No deadline'}</div></div></Card>))}</div></div>)}
        {done.length > 0 && (<div><h2 className="font-semibold mb-2">Completed</h2><div className="space-y-2">{done.map((q) => (<Card key={q.id} onClick={() => { setActiveQuestId(q.id); navigate('questDetail'); }} className="flex items-start gap-3 opacity-60"><CheckCircle2 size={20} className="text-success-500 mt-0.5" /><div className="flex-1"><h3 className="font-medium line-through">{q.title}</h3><p className="text-sm text-ink-500">{q.description}</p></div></Card>))}</div></div>)}
        {quests.length === 0 && (<div className="text-center py-12 text-ink-400"><Lock className="mx-auto mb-2" /><p>No quests available. Check back tomorrow!</p></div>)}
      </div>
    </div>
  );
}
