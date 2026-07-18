import { useStore } from '../store';
import { ADVENTURES } from '../data/gameData';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { MapPin, CircleCheck as CheckCircle2, Navigation } from 'lucide-react';

export default function AdventurePreview() {
  const navigate = useStore((s) => s.navigate);
  const activeAdventureId = useStore((s) => s.activeAdventureId);
  const adv = ADVENTURES.find((a) => a.id === activeAdventureId) ?? ADVENTURES[0];

  return (
    <div className="pb-24">
      <Header title="Adventure Preview" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <Card className="p-5">
          <h2 className="font-display text-xl font-bold text-white">{adv.title}</h2>
          <p className="text-ink-300 text-sm mt-1">{adv.description}</p>
          <div className="flex items-center gap-2 mt-3 text-ink-300 text-sm">
            <MapPin size={16} className="text-brand-400" />
            Start: {adv.startLat.toFixed(4)}, {adv.startLng.toFixed(4)}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold text-white">Quests to complete</h3>
          <ul className="mt-3 space-y-2">
            {adv.quests.map((q) => (
              <li key={q.id} className="flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="text-ink-500 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{q.title}</p>
                  <p className="text-ink-400 text-xs">{q.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Button className="w-full" size="lg" onClick={() => navigate('adventureMap')}>
          <Navigation size={18} /> Begin Adventure
        </Button>
      </div>
    </div>
  );
}
