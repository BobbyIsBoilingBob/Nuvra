import { lazy, Suspense, useEffect, type ComponentType } from 'react';
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

const SCREENS: Record<Screen, ComponentType> = {
  home: Home,
  auth: Auth,
  onboarding: Onboarding,
  adventures: Adventures,
  adventureDetail: AdventureDetail,
  adventureMap: AdventureMap,
  adventurePreview: AdventurePreview,
  community: Community,
  aiGenerator: AIGenerator,
  creator: Creator,
  profile: Profile,
  friends: Friends,
  quests: Quests,
  achievements: Achievements,
  dailyRewards: DailyRewards,
  challenges: Challenges,
  party: Party,
  shop: Shop,
  settings: Settings,
  history: History,
  customise: Customise,
  inventory: Inventory,
  rewards: Rewards,
  seasonal: Seasonal,
};

// Screens guests are allowed to browse without signing in.
const GUEST_ALLOWED: Screen[] = [
  'home',
  'adventures',
  'adventureDetail',
  'adventureMap',
  'community',
  'aiGenerator',
  'adventurePreview',
  'creator',
];

// Screens that show the bottom nav bar.
const NAV_SCREENS: Screen[] = ['home', 'adventures', 'rewards', 'shop', 'profile'];

function Router() {
  const screen = useStore((s) => s.screen);
  const navigate = useStore((s) => s.navigate);
  const { isGuest, loading } = useAuth();

  // Bug #2 fix: guests never wait on a loading spinner.
  // Only block for signed-in users while the session resolves.
  if (loading && !isGuest) return <Spinner label="Loading Zeviqo…" />;

  // Guests can only access allowed screens; redirect others to home.
  let active = screen;
  if (isGuest && !GUEST_ALLOWED.includes(screen)) {
    active = 'home';
    // Correct the store so goBack works from here.
    if (screen !== 'home') navigate('home');
  }

  const Component = SCREENS[active] as ComponentType;
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
      <Router />
    </AuthProvider>
  );
}
