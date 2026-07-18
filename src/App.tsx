import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { useStore } from './store';
import { useDataSync } from './hooks/useDataSync';
import { AdventureBg, BottomNav } from './components/BottomNav';
import { LoadingScreen } from './components/ui';

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

const SCREENS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: Home, adventures: Adventures, 'adventure-detail': AdventureDetail, 'adventure-map': AdventureMap,
  quests: Quests, achievements: Achievements, 'daily-rewards': DailyRewards, profile: Profile,
  challenges: Challenges, community: Community, friends: Friends, party: Party, shop: Shop,
  settings: Settings, history: History, 'ai-generator': AIGenerator, 'adventure-preview': AdventurePreview,
  creator: Creator, customise: Customise, inventory: Inventory, rewards: Rewards, seasonal: Seasonal,
  onboarding: Onboarding,
};

const FULLSCREEN_SCREENS = new Set(['adventure-map']);

function AppContent() {
  const { user, loading } = useAuth();
  const { currentScreen, setScreen } = useStore();
  useDataSync();

  if (loading) return <LoadingScreen />;
  if (!user) return <Suspense fallback={<LoadingScreen />}><Auth /></Suspense>;

  const isFullscreen = FULLSCREEN_SCREENS.has(currentScreen);
  const Screen = SCREENS[currentScreen] ?? Home;
  const showNav = !isFullscreen;

  return (
    <div className="min-h-screen flex flex-col">
      <AdventureBg />
      <Suspense fallback={<LoadingScreen />}><Screen /></Suspense>
      {showNav && <BottomNav current={currentScreen} onNavigate={(s) => setScreen(s as never)} />}
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
