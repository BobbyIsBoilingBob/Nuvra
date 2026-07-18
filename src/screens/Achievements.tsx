import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { ACHIEVEMENTS } from '../data/gameData';
import { Award, Footprints, Compass, Mountain, Users, Medal, Sunrise } from 'lucide-react';

const ICONS: Record<string, typeof Award> = { Footprints, Compass, Mountain, Users, Medal, Sunrise, Award };

export default function Achievements() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const unlockedAchievements = useStore((s) => s.unlockedAchievements);

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Achievements" />
        <div className="px-4 py-10 text-center"><p className="text-ink-300">Sign in to view your achievements.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }
  return (
    <div className="pb-24"><Header title="Achievements" />
      <div className="px-4 py-4 max-w-lg mx-auto grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const Icon = ICONS[a.icon] ?? Award;
          const unlocked = unlockedAchievements.includes(a.id);
          return (
            <Card key={a.id} className={`p-4 text-center ${unlocked ? 'border-accent-500/40' : ''}`}>
              <Icon size={32} className={unlocked ? 'text-accent-400 mx-auto' : 'text-ink-500 mx-auto'} />
              <p className="text-white font-semibold mt-2 text-sm">{a.title}</p>
              <p className="text-ink-400 text-xs mt-1">{a.description}</p>
              {a.target && <p className="text-ink-500 text-xs mt-1">{a.progress ?? 0}/{a.target}</p>}
              {unlocked && <p className="text-accent-400 text-xs mt-1 font-medium">Unlocked!</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
