import { useAuth } from './lib/auth';
import { useStore } from './store';
import { LoadingScreen } from './components/ui';
import { Auth } from './screens/Auth';
import { BottomNav } from './components/BottomNav';
import { Home } from './screens/Home';
import { Adventures } from './screens/Adventures';
import { AdventureDetail } from './screens/AdventureDetail';
import { AdventureMap } from './screens/AdventureMap';
import { Quests } from './screens/Quests';
import { Achievements } from './screens/Achievements';
import { DailyRewards } from './screens/DailyRewards';
import { Profile } from './screens/Profile';
import { Challenges } from './screens/Challenges';
import { Community } from './screens/Community';
import { Friends } from './screens/Friends';
import { Party } from './screens/Party';
import { Shop } from './screens/Shop';
import { Settings } from './screens/Settings';
import { History } from './screens/History';

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
    history: <History />
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      {screens[currentScreen] ?? <Home />}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
