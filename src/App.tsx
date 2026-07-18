import { lazy, Suspense, type ComponentType } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { useStore } from './store';
import Spinner from './components/Spinner';
import BottomNav from './components/BottomNav';
import type { Screen } from './types';

const Home = lazy(() => import('./screens/Home'));
const Auth = lazy(() => import('./screens/Auth'));
const Onboarding = lazy(() => import('./screens/Onboarding'));
const Adventures = lazy(() => import('./screens/Adventures'));
const AdventureDetail = lazy(() => import('./screens/AdventureDetail'));
const AdventureMap = lazy(() => import('./screens/AdventureMap'));
const AdventurePreview = lazy(() => import('./screens/AdventurePreview'));
const Community = lazy(() => import('./screens/Community'));
const AIGenerator = lazy(() => import('./screens/AIGenerator'));
const Creator = lazy(() => import('./screens/Creator'));
const Profile = lazy(() => import('./screens/Profile'));
const Friends = lazy(() => import('./screens/Friends'));
const Quests = lazy(() => import('./screens/Quests'));
const QuestDetail = lazy(() => import('./screens/QuestDetail'));
const Achievements = lazy(() => import('./screens/Achievements'));
const DailyRewards = lazy(() => import('./screens/DailyRewards'));
const Challenges = lazy(() => import('./screens/Challenges'));
const Party = lazy(() => import('./screens/Party'));
const Shop = lazy(() => import('./screens/Shop'));
const Settings = lazy(() => import('./screens/Settings'));
const History = lazy(() => import('./screens/History'));
const Customise = lazy(() => import('./screens/Customise'));
const Inventory = lazy(() => import('./screens/Inventory'));
const Rewards = lazy(() => import('./screens/Rewards'));
const Seasonal = lazy(() => import('./screens/Seasonal'));

const SCREENS: Record<Screen, ComponentType<any>> = {
  home: Home, auth: Auth, onboarding: Onboarding,
  adventures: Adventures, adventureDetail: AdventureDetail,
  adventureMap: AdventureMap, adventurePreview: AdventurePreview,
  community: Community, aiGenerator: AIGenerator, creator: Creator,
  profile: Profile, friends: Friends, quests: Quests, questDetail: QuestDetail,
  achievements: Achievements, dailyRewards: DailyRewards, challenges: Challenges,
  party: Party, shop: Shop, settings: Settings, history: History,
  customise: Customise, inventory: Inventory, rewards: Rewards, seasonal: Seasonal,
};

const GUEST_ALLOWED: Screen[] = [
  'home', 'adventures', 'adventureDetail', 'adventureMap',
  'community', 'aiGenerator', 'adventurePreview', 'creator', 'quests', 'questDetail',
];

const NAV_SCREENS: Screen[] = ['home', 'adventures', 'rewards', 'shop', 'profile'];

function StartupGate() {
  const { status, isGuest } = useAuth();
  const screen = useStore((s) => s.screen);
  const navigate = useStore((s) => s.navigate);
  const resetTo = useStore((s) => s.resetTo);

  if (status === 'unauthenticated') {
    if (screen !== 'auth') navigate('auth');
    return (
      <Suspense fallback={<Spinner label="Loading…" />}>
        <Auth />
      </Suspense>
    );
  }

  if (status === 'checking') {
    return <Spinner label="Loading Zeviqo…" />;
  }

  let active = screen;
  if (isGuest && !GUEST_ALLOWED.includes(screen)) {
    active = 'home';
    if (screen !== 'home') resetTo('home');
  }

  const Component = SCREENS[active];
  const showNav = NAV_SCREENS.includes(active);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Suspense fallback={<Spinner label="Loading…" />}>
          <Component />
        </Suspense>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StartupGate />
    </AuthProvider>
  );
}
