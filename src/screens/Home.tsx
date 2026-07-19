import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Compass, Trophy, Target, Calendar, Users, Award, History,
  Package, User as UserIcon, Users as Community, Sparkles, LogIn, UserPlus, Map,
} from 'lucide-react';
import type { Screen } from '../types';

interface Tile { screen: Screen; label: string; icon: typeof Compass; desc: string; }

const TILES: Tile[] = [
  { screen: 'adventures', label: 'Adventures', icon: Compass, desc: 'Browse walking quests' },
  { screen: 'aiGenerator', label: 'AI Adventure', icon: Sparkles, desc: 'Generate a custom route' },
  { screen: 'creator', label: 'Adventure Creator', icon: Map, desc: 'Build your own adventure' },
  { screen: 'leaderboard' as any, label: 'Leaderboard', icon: Trophy, desc: 'Top walkers' },
  { screen: 'challenges', label: 'Challenges', icon: Target, desc: 'Weekly goals' },
  { screen: 'seasonal', label: 'Seasonal', icon: Calendar, desc: 'Festival events' },
  { screen: 'party', label: 'Party', icon: Users, desc: 'Walk with friends' },
  { screen: 'achievements', label: 'Awards', icon: Award, desc: 'Your achievements' },
  { screen: 'history', label: 'History', icon: History, desc: 'Past adventures' },
  { screen: 'inventory', label: 'Items', icon: Package, desc: 'Your inventory' },
  { screen: 'customise', label: 'Avatar', icon: UserIcon, desc: 'Customise avatar' },
  { screen: 'profile', label: 'Profile', icon: UserIcon, desc: 'Your profile' },
  { screen: 'community', label: 'Community', icon: Community, desc: 'Friends & community' },
];

export default function Home() {
  const { isGuest, profile } = useAuth();
  const navigate = useStore((s) => s.navigate);
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const coins = useStore((s) => s.coins);
  const level = useStore((s) => s.level);

  return (
    <div className="px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Zeviqo</h1>
          <p className="text-sm text-ink-500">Walking adventures, everywhere.</p>
        </div>
        {isGuest ? (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigateToAuth('home')}>Sign In</Button>
            <Button size="sm" onClick={() => navigateToAuth('home')}>Create Account</Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-1 rounded-lg bg-brand-100 text-brand-700 font-semibold">Lv {profile?.level ?? level}</span>
            <span className="px-2 py-1 rounded-lg bg-accent-100 text-accent-700 font-semibold">🪙 {profile?.coins ?? coins}</span>
          </div>
        )}
      </header>

      {isGuest && (
        <Card className="mb-6 bg-brand-50 border-brand-100">
          <p className="text-sm text-brand-800">
            You're exploring as a guest. Sign in to save progress, earn rewards, and join parties.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => navigateToAuth('home')}>Sign In</Button>
            <Button size="sm" variant="secondary" onClick={() => navigateToAuth('home')}>Create Account</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {TILES.map(({ screen, label, icon: Icon, desc }) => (
          <Card key={label} onClick={() => navigate(screen as Screen)} className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-ink-900">{label}</p>
              <p className="text-xs text-ink-500">{desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {isGuest && (
        <div className="mt-6 flex gap-2">
          <Button variant="ghost" fullWidth onClick={() => navigateToAuth('home')}>
            <LogIn size={16} className="inline mr-1" /> Sign In
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigateToAuth('home')}>
            <UserPlus size={16} className="inline mr-1" /> Create Account
          </Button>
        </div>
      )}
    </div>
  );
}
