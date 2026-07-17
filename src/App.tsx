import { lazy, Suspense } from 'react';
import { useAuth } from './lib/auth';
import { useStore } from './store';
import { LoadingScreen } from './components/ui';
import { Auth } from './screens/Auth';
import { BottomNav } from './components/BottomNav';
import { Home } from './screens/Home';

const Adventures = lazy(() => import('./screens/Adventures').then(m => ({ default: m.Adventures })));
const AdventureDetail = lazy(() => import('./screens/AdventureDetail').then(m => ({ default: m.AdventureDetail })));
const AdventureMap = lazy(() => import('./screens/AdventureMap').then(m => ({ default: m.AdventureMap })));
const Quests = lazy(() => import('./screens/Quests').then(m => ({ default: m.Quests })));
const Achievements = lazy(() => import('./screens/Achievements').then(m => ({ default: m.Achievements })));
const DailyRewards = lazy(() => import('./screens/DailyRewards').then(m => ({ default: m.DailyRewards })));
const Profile = lazy(() => import('./screens/Profile').then(m => ({ default: m.Profile })));
const Challenges = lazy(() => import('./screens/Challenges').then(m => ({ default: m.Challenges })));
const Community = lazy(() => import('./screens/Community').then(m => ({ default: m.Community })));
const Friends = lazy(() => import('./screens/Friends').then(m => ({ default: m.Friends })));
const Party = lazy(() => import('./screens/Party').then(m => ({ default: m.Party })));
const Shop = lazy(() => import('./screens/Shop').then(m => ({ default: m.Shop })));
const Settings = lazy(() => import('./screens/Settings').then(m => ({ default: m.Settings })));
const History = lazy(() => import('./screens/History').then(m => ({ default: m.History })));

export default function App() {
  const { session, profile, loading } = useAuth();
  const { currentScreen } = useStore();

  if (loading) return <LoadingScreen />;
  if (!session || !profile) return <Auth />;

  const showBottomNav = !['adventure-detail', 'adventure-map'].includes(currentScreen);

  const screens: Record<string, React.ReactNode> = {
    home: <Home />,
    adventures: <Adventures />,
    'adventure-detail': <AdventureDetail />,
    'adventure-map': <AdventureMap />,
    quests: <Quests />,
    achievements: <Achievements />,
    'daily-rewards': <DailyRewards />,
    profile: <Profile />,
    challenges: <Challenges />,
    community: <Community />,
    friends: <Friends />,
    party: <Party />,
    shop: <Shop />,
    settings: <Settings />,
    history: <History />,
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      <Suspense fallback={<LoadingScreen />}>
        {screens[currentScreen] ?? <Home />}
      </Suspense>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
