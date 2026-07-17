import { useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { Landing } from './screens/Landing';
import { Onboarding } from './screens/Onboarding';
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
import type { Screen } from './store';

export default function App() {
  const { currentScreen, hasOnboarded } = useStore();

  if (!hasOnboarded && currentScreen !== 'onboarding' && currentScreen !== 'landing') {
    return <Landing />;
  }

  const screens: Record<Screen, React.ReactElement> = {
    landing: <Landing />,
    onboarding: <Onboarding />,
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

  const showBottomNav = ['home', 'adventures', 'quests', 'community', 'profile'].includes(currentScreen);

  return (
    <div className="min-h-screen w-full bg-ink-950 text-white">
      {screens[currentScreen] ?? <Home />}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
