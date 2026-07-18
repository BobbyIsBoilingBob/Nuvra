import { lazy, Suspense, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { LoadingScreen } from './components/ui';
import { useDataSync } from './hooks/useDataSync';

const Auth = lazy(() => import('./screens/Auth'));
const Home = lazy(() => import('./screens/Home'));
const Adventures = lazy(() => import('./screens/Adventures'));
const AdventureDetail = lazy(() => import('./screens/AdventureDetail'));
const AdventureMap = lazy(() => import('./screens/AdventureMap'));
const Quests = lazy(() => import('./screens/Quests'));
const Achievements = lazy(() => import('./screens/Achievements'));
const DailyRewards = lazy(() => import('./screens/DailyRewards'));
const Profile = lazy(() => import('./screens/Profile'));
const Challenges = lazy(() => import('./screens/Challenges'));
const Community = lazy(() => import('./screens/Community'));
const Friends = lazy(() => import('./screens/Friends'));
const Party = lazy(() => import('./screens/Party'));
const Shop = lazy(() => import('./screens/Shop'));
const Settings = lazy(() => import('./screens/Settings'));
const History = lazy(() => import('./screens/History'));
const AIGenerator = lazy(() => import('./screens/AIGenerator'));
const AdventurePreview = lazy(() => import('./screens/AdventurePreview'));
const Creator = lazy(() => import('./screens/Creator'));
const Customise = lazy(() => import('./screens/Customise'));
const Inventory = lazy(() => import('./screens/Inventory'));
const Rewards = lazy(() => import('./screens/Rewards'));
const Seasonal = lazy(() => import('./screens/Seasonal'));
const Onboarding = lazy(() => import('./screens/Onboarding'));

const SCREENS: Record<string, React.ComponentType> = {
  auth: Auth, home: Home, adventures: Adventures, adventureDetail: AdventureDetail, adventureMap: AdventureMap,
  quests: Quests, achievements: Achievements, dailyRewards: DailyRewards, profile: Profile, challenges: Challenges,
  community: Community, friends: Friends, party: Party, shop: Shop, settings: Settings, history: History,
  aiGenerator: AIGenerator, adventurePreview: AdventurePreview, creator: Creator, customise: Customise,
  inventory: Inventory, rewards: Rewards, seasonal: Seasonal, onboarding: Onboarding,
};

const GUEST_ALLOWED: string[] = ['home', 'adventures', 'adventureDetail', 'adventureMap', 'community', 'aiGenerator', 'adventurePreview', 'creator'];

function AppContent() {
  const { session, profile, loading, isGuest } = useAuth();
  const { screen, setScreen } = useStore();
  useDataSync();

  useEffect(() => {
    if (loading) return;
    if (session && profile && !profile.onboarding_complete) { setScreen('onboarding'); }
    else if (!session && !isGuest) { setScreen('auth'); }
    else if (isGuest && !GUEST_ALLOWED.includes(screen)) { setScreen('home'); }
  }, [session, profile, isGuest, loading, setScreen]);

  if (loading) return <LoadingScreen />;
  if (!session && !isGuest) { const C = SCREENS['auth']; return <C />; }

  const effectiveScreen = isGuest && !GUEST_ALLOWED.includes(screen) ? 'home' : screen;
  const Current = SCREENS[effectiveScreen] ?? SCREENS['home'];

  return <div className="min-h-screen bg-ink-950"><Suspense fallback={<LoadingScreen />}><Current /></Suspense><BottomNav /></div>;
}

export default function App() { return <AuthProvider><AppContent /></AuthProvider>; }
