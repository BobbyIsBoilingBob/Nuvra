import Header from '../components/Header';
import Card from '../components/Card';
import { Circle } from 'lucide-react';
import { ADVENTURES } from '../data/gameData';

export default function Quests() {
  const quests = ADVENTURES.flatMap((a) => a.quests.map((q) => ({ ...q, adventure: a.title })));
  return (
    <div className="pb-24">
      <Header title="Quests" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {quests.map((q) => (
          <Card key={q.id + q.adventure} className="p-4 flex items-start gap-3">
            <Circle size={18} className="text-ink-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-medium">{q.title}</p>
              <p className="text-ink-400 text-sm">{q.description}</p>
              <p className="text-ink-500 text-xs mt-1">From: {q.adventure}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
