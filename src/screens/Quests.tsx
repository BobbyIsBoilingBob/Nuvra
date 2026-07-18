import { useStore } from '../store';
import { ADVENTURES } from '../data/gameData';
import type { Adventure, Quest } from '../types';
import Header from '../components/Header';
import Card from '../components/Card';
import { Target, ChevronRight, MapPin, Ruler, Eye } from 'lucide-react';

const TYPE_ICON = { distance: Ruler, checkpoint: MapPin, challenge: Eye };

export default function Quests() {
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const customAdventures = useStore((s) => s.customAdventures);

  const allAdventures: Adventure[] = [...customAdventures, ...ADVENTURES];
  const quests: Quest[] = allAdventures.flatMap((a) =>
    a.quests.map((q: Quest) => ({ ...q, adventureId: a.id, adventureTitle: a.title })),
  );

  const openQuest = (q: Quest) => {
    if (q.adventureId) setActiveAdventure(q.adventureId);
    navigate('questDetail');
  };

  return (
    <div className="pb-24">
      <Header title="Quests" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {quests.length === 0 && <p className="text-ink-400 text-sm text-center py-8">No quests available.</p>}
        {quests.map((q) => {
          const Icon = TYPE_ICON[q.type] ?? Target;
          return (
            <Card key={q.id + (q.adventureId ?? '')} className="p-4 flex items-start gap-3" onClick={() => openQuest(q)}>
              <div className="h-10 w-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-brand-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{q.title}</p>
                <p className="text-ink-400 text-sm line-clamp-2">{q.description}</p>
                <p className="text-ink-500 text-xs mt-1">From: {q.adventureTitle}</p>
              </div>
              <ChevronRight size={18} className="text-ink-500 flex-shrink-0 mt-1" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
