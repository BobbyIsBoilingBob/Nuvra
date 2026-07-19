import { Suspense, lazy, useMemo, type ComponentType } from 'react';
import { useAuth } from './lib/auth';
import { useStore } from './store';
import { Spinner } from './components/Spinner';
import { BottomNav } from './components/BottomNav';
import type { Screen } from './types';

type ScreenLoader = () => Promise<{ default: ComponentType<any> }>;

const screens: Record<Screen, ScreenLoader> = {
  home: () => import('./screens/Home'),
  auth: () => import('./screens/Auth'),
  onboarding: () => import('./screens/Onboarding'),
  adventures: () => import('./screens/Adventures'),
  adventureDetail: () => import('./screens/AdventureDetail'),
  adventureMap: () => import('./screens/AdventureMap'),
  adventurePreview: () => import('./screens/AdventurePreview'),
  community: () => import('./screens/Community'),
  aiGenerator: () => import('./screens/AiGenerator'),
  creator: () => import('./screens/Creator'),
  profile: () => import('./screens/Profile'),
  friends: () => import('./screens/Friends'),
  quests: () => import('./screens/Quests'),
  questDetail: () => import('./screens/QuestDetail'),
  achievements: () => import('./screens/Achievements'),
  dailyRewards: () => import('./screens/DailyRewards'),
  challenges: () => import('./screens/Challenges'),
  party: () => import('./screens/Party'),
  shop: () => import('./screens/Shop'),
  settings: () => import('./screens/Settings'),
  history: () => import('./screens/History'),
  customise: () => import('./screens/Customise'),
  inventory: () => import('./screens/Inventory'),
  rewards: () => import('./screens/Rewards'),
  seasonal: () => import('./screens/Seasonal'),
  leaderboard: () => import('./screens/Leaderboard'),
};

const GUEST_ALLOWED: Screen[] = [
  'home', 'auth', 'onboarding', 'adventures', 'adventureDetail',
  'adventureMap', 'adventurePreview', 'community', 'aiGenerator',
];

function StartupGate() {
  const { status } = useAuth();
  const screen = useStore((s) => s.screen);
  const resetTo = useStore((s) => s.resetTo);

  if (status === 'checking') {
    return <div className="flex items-center justify-center h-screen"><Spinner size={40} /></div>;
  }

  if (status === 'unauthenticated' && screen !== 'auth') {
    resetTo('auth');
    return <div className="flex items-center justify-center h-screen"><Spinner size={40} /></div>;
  }

  if (status === 'guest' && !GUEST_ALLOWED.includes(screen)) {
    return <div className="flex items-center justify-center h-screen"><Spinner size={40} /></div>;
  }

  return null;
}

export default function App() {
  const screen = useStore((s) => s.screen);
  const LazyScreen = useMemo(() => lazy(screens[screen]!), [screen]);

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 font-sans">
      <StartupGate />
      <main className="pb-16 min-h-screen">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Spinner size={32} /></div>}>
          <LazyScreen />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
