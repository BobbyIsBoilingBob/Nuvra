import { useStore } from '../store';
import { useAdventures } from '../hooks/useAdventures';
import { ADVENTURES } from '../data/gameData';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Spinner } from '../components/Spinner';
import { Sparkles, Plus } from 'lucide-react';
import type { Adventure } from '../types';

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-success-100 text-success-700',
  medium: 'bg-warning-100 text-warning-700',
  hard: 'bg-error-100 text-error-700',
};

export default function Adventures() {
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const { adventures: saved, loading } = useAdventures();

  const all = [...saved, ...ADVENTURES];

  function open(a: Adventure) {
    setActiveAdventure(a.id);
    navigate('adventureDetail');
  }

  return (
    <div>
      <Header title="Adventures" subtitle={`${all.length} available`} />
      <div className="px-4 py-4 space-y-3">
        <Card onClick={() => navigate('aiGenerator')} className="flex items-center gap-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white border-0">
          <Sparkles size={24} />
          <div className="flex-1">
            <p className="font-semibold">AI Adventure Generator</p>
            <p className="text-xs text-white/80">Create a custom walking adventure</p>
          </div>
        </Card>
        <Card onClick={() => navigate('creator')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Plus size={20} /></div>
          <div><p className="font-semibold">Adventure Creator</p><p className="text-xs text-ink-500">Build your own route</p></div>
        </Card>

        {loading && <div className="flex justify-center py-8"><Spinner /></div>}

        <h2 className="text-sm font-semibold text-ink-500 pt-2">All Adventures</h2>
        {all.map((a) => (
          <Card key={a.id} onClick={() => open(a)} padded={false} className="overflow-hidden">
            {a.imageUrl && <img src={a.imageUrl} alt={a.title} className="w-full h-32 object-cover" loading="lazy" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{a.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[a.difficulty]}`}>{a.difficulty}</span>
              </div>
              <p className="text-sm text-ink-500 mt-1 line-clamp-2">{a.description}</p>
              <div className="flex gap-4 text-xs text-ink-400 mt-2">
                <span>📍 {a.distanceKm} km</span>
                <span>⏱️ {a.durationMin} min</span>
                <span>🎯 {a.quests.length} quests</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
