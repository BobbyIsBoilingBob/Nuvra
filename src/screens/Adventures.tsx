import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import Header from '../components/Header';
import Card from '../components/Card';
import { ADVENTURES } from '../data/gameData';
import { Clock, MapPin, TrendingUp } from 'lucide-react';

const DIFF_COLOR: Record<string, string> = {
  easy: 'text-success-400 bg-success-500/10',
  medium: 'text-accent-400 bg-accent-500/10',
  hard: 'text-error-400 bg-error-500/10',
};

export default function Adventures() {
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const { isGuest } = useAuth();
  return (
    <div className="pb-24">
      <Header title="Adventures" back={false} />
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {isGuest && (
          <p className="text-ink-400 text-sm bg-ink-800/50 rounded-xl p-3 border border-ink-700/50">
            You're browsing as a guest. Sign in to start and track adventures.
          </p>
        )}
        {ADVENTURES.map((adv) => (
          <Card key={adv.id} className="overflow-hidden" onClick={() => { setActiveAdventure(adv.id); navigate('adventureDetail'); }}>
            <div className="h-32 bg-ink-700 relative" style={adv.imageUrl ? { backgroundImage: `url(${adv.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold capitalize ${DIFF_COLOR[adv.difficulty]}`}>
                {adv.difficulty}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-white">{adv.title}</h3>
              <p className="text-ink-400 text-sm mt-1 line-clamp-2">{adv.description}</p>
              <div className="flex items-center gap-4 mt-3 text-ink-300 text-xs">
                <span className="flex items-center gap-1"><Clock size={14} /> {adv.durationMin} min</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {adv.distanceKm} km</span>
                <span className="flex items-center gap-1"><TrendingUp size={14} /> {adv.rewards.xp} XP</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
