import { useStore } from '../store';
import { useHistory } from '../hooks/useHistory';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Footprints, Clock, MapPin } from 'lucide-react';

export default function History() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const { history, loading, error } = useHistory();
  if (loading) return (<div><Header title="History" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  return (
    <div>
      <Header title="Adventure History" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        {history.length === 0 && !loading ? (
          <div className="text-center py-12 text-ink-400"><Footprints className="mx-auto mb-2" /><p>No adventures yet. Start your first one!</p></div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <Card key={h.id} onClick={() => { if (h.adventure) { setActiveAdventure(h.adventure.id); navigate('adventureDetail'); } }} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0"><Footprints size={20} /></div>
                <div className="flex-1"><h3 className="font-semibold">{h.adventure?.title ?? 'Adventure'}</h3><div className="flex items-center gap-3 mt-1 text-xs text-ink-400"><span className="flex items-center gap-1"><Clock size={12} />{new Date(h.completedAt).toLocaleDateString()}</span>{h.adventure && <span className="flex items-center gap-1"><MapPin size={12} />{h.adventure.distanceKm} km</span>}</div>{h.xpEarned > 0 && <p className="text-xs text-brand-600 mt-1">+{h.xpEarned} XP · +{h.coinsEarned} 🪙</p>}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
