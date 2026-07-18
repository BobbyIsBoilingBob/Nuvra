import { useStore } from '../store';
import { ADVENTURES } from '../data/gameData';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { Clock, MapPin, TrendingUp, Coins, Target } from 'lucide-react';

export default function AdventureDetail() {
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const activeAdventureId = useStore((s) => s.activeAdventureId);
  const customAdventures = useStore((s) => s.customAdventures);
  const allAdventures = [...customAdventures, ...ADVENTURES];
  const adv = allAdventures.find((a) => a.id === activeAdventureId) ?? allAdventures[0];

  const start = () => { setActiveAdventure(adv.id); navigate('adventurePreview'); };

  return (
    <div className="pb-24">
      <Header title="Adventure Details" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <div className="h-48 rounded-2xl bg-ink-700" style={adv.imageUrl ? { backgroundImage: `url(${adv.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{adv.title}</h2>
          <p className="text-ink-300 mt-1">{adv.description}</p>
        </div>
        <Card className="p-4 grid grid-cols-3 gap-3 text-center">
          <div><Clock size={18} className="text-brand-400 mx-auto" /><p className="text-white font-semibold mt-1">{adv.durationMin}m</p></div>
          <div><MapPin size={18} className="text-brand-400 mx-auto" /><p className="text-white font-semibold mt-1">{adv.distanceKm} km</p></div>
          <div><TrendingUp size={18} className="text-brand-400 mx-auto" /><p className="text-white font-semibold mt-1">{adv.rewards.xp} XP</p></div>
        </Card>
        <Card className="p-4">
          <h3 className="font-display font-bold text-white flex items-center gap-2"><Target size={18} className="text-brand-400" /> Quests</h3>
          <ul className="mt-3 space-y-2">
            {adv.quests.map((q) => (
              <li key={q.id} className="flex items-start gap-2 text-ink-200 text-sm">
                <span className="h-5 w-5 rounded-full bg-ink-700 flex items-center justify-center text-[10px] font-bold text-ink-300 mt-0.5">Q</span>
                <div><p className="font-medium text-white">{q.title}</p><p className="text-ink-400 text-xs">{q.description}</p></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="font-display font-bold text-white flex items-center gap-2"><Coins size={18} className="text-accent-400" /> Rewards</h3>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-ink-200">{adv.rewards.xp} XP</span>
            <span className="text-ink-200">{adv.rewards.coins} coins</span>
            {adv.rewards.items?.map((i) => <span key={i} className="text-ink-200">{i}</span>)}
          </div>
        </Card>
        <Button className="w-full" size="lg" onClick={start}>Start Adventure</Button>
      </div>
    </div>
  );
}
