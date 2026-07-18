import { useStore } from '../store';
import { Card, Screen, EmptyState, Badge, ProgressBar } from '../components/ui';
import { History, MapPin, Clock, Route, Zap, Star } from 'lucide-react';
import { formatDistance, formatDuration } from '../lib/map-utils';

export default function HistoryScreen() {
  const { history } = useStore();
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">History</h1>
      {history.length === 0 ? <EmptyState icon={History} title="No adventures yet" subtitle="Your completed adventures will appear here" /> : <div className="space-y-3">{history.slice().reverse().map(h => (<Card key={h.id} className="p-4"><div className="flex items-start justify-between mb-2"><div><h3 className="font-semibold text-white">{h.adventureName}</h3><p className="text-ink-400 text-xs">{new Date(h.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>{h.rating && <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} color={i < h.rating! ? '#fbbf24' : '#475569'} fill={i < h.rating! ? '#fbbf24' : 'transparent'} />)}</div>}</div><div className="grid grid-cols-3 gap-2 mt-3"><div className="flex items-center gap-1.5"><Route size={14} color="#94a3b8" /><div><p className="text-white text-sm font-semibold">{formatDistance(h.distance)}</p><p className="text-ink-400 text-xs">Distance</p></div></div><div className="flex items-center gap-1.5"><Clock size={14} color="#94a3b8" /><div><p className="text-white text-sm font-semibold">{formatDuration(h.duration)}</p><p className="text-ink-400 text-xs">Duration</p></div></div><div className="flex items-center gap-1.5"><Zap size={14} color="#fbbf24" /><div><p className="text-white text-sm font-semibold">{h.xp} XP</p><p className="text-ink-400 text-xs">Earned</p></div></div></div></Card>))}</div>}
    </Screen>
  );
}
