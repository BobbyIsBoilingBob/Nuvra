import { useStore } from '../store';
import { ADVENTURES } from '../data/gameData';
import type { Adventure, Quest } from '../types';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { MapPin, Ruler, Eye, Target, Navigation } from 'lucide-react';

const TYPE_ICON = { distance: Ruler, checkpoint: MapPin, challenge: Eye };
const TYPE_LABEL = { distance: 'Distance', checkpoint: 'Checkpoint', challenge: 'Challenge' };

export default function QuestDetail() {
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const activeAdventureId = useStore((s) => s.activeAdventureId);
  const customAdventures = useStore((s) => s.customAdventures);

  const allAdventures: Adventure[] = [...customAdventures, ...ADVENTURES];
  const adv = allAdventures.find((a) => a.id === activeAdventureId) ?? allAdventures[0];
  const quest: Quest = adv.quests[0] ?? { id: 'q', type: 'checkpoint', title: 'Quest', description: '' };

  const Icon = TYPE_ICON[quest.type] ?? Target;

  const startAdventure = () => {
    setActiveAdventure(adv.id);
    navigate('adventurePreview');
  };

  return (
    <div className="pb-24">
      <Header title="Quest Details" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <Icon size={24} className="text-brand-300" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">{quest.title}</h2>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium bg-ink-700 text-ink-300">
                {TYPE_LABEL[quest.type]}
              </span>
            </div>
          </div>
          <p className="text-ink-300 mt-3">{quest.description}</p>
          {quest.target && (
            <p className="text-ink-400 text-sm mt-2">Target: {(quest.target / 1000).toFixed(1)} km</p>
          )}
          {quest.lat != null && quest.lng != null && (
            <p className="text-ink-400 text-sm mt-1">Location: {quest.lat.toFixed(4)}, {quest.lng.toFixed(4)}</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold text-white">Part of adventure</h3>
          <p className="text-ink-300 mt-1">{adv.title}</p>
          <p className="text-ink-400 text-sm mt-1">{adv.description}</p>
          <div className="flex gap-4 mt-3 text-ink-300 text-sm">
            <span>{adv.durationMin} min</span>
            <span>{adv.distanceKm} km</span>
            <span>{adv.rewards.xp} XP</span>
            <span>{adv.rewards.coins} coins</span>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold text-white mb-3">All quests in this adventure</h3>
          <ul className="space-y-2">
            {adv.quests.map((q: Quest, i: number) => {
              const QIcon = TYPE_ICON[q.type] ?? Target;
              return (
                <li key={q.id} className="flex items-center gap-2 text-sm">
                  <span className="h-6 w-6 rounded-full bg-ink-700 flex items-center justify-center text-xs font-bold text-ink-300">{i + 1}</span>
                  <QIcon size={14} className="text-brand-400" />
                  <span className="text-ink-200">{q.title}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Button className="w-full" size="lg" onClick={startAdventure}>
          <Navigation size={18} /> Start This Adventure
        </Button>
      </div>
    </div>
  );
}
