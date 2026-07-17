import { useEffect } from 'react';
import { useStore } from './store';
import { LoadingScreen } from './components/ui';
import { BottomNav } from './components/BottomNav';

// Screens
import { Landing } from './screens/Landing';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Adventures } from './screens/Adventures';
import { AdventureDetail } from './screens/AdventureDetail';
import { AdventureMap } from './screens/AdventureMap';
import { Quests } from './screens/Quests';
import { Achievements } from './screens/Achievements';
import { Profile } from './screens/Profile';
import { DailyRewards } from './screens/DailyRewards';
import { Challenges } from './screens/Challenges';
import { Community } from './screens/Community';
import { Friends } from './screens/Friends';
import { Party } from './screens/Party';
import { Shop } from './screens/Shop';
import { Settings } from './screens/Settings';

export default function App(): React.ReactElement {
  const { screen, onboardingComplete, checkDailyReward } = useStore();

  useEffect(() => {
    checkDailyReward();
  }, [checkDailyReward]);

  if (!onboardingComplete && screen !== 'onboarding' && screen !== 'landing') {
    return <LoadingScreen />;
  }

  const renderScreen = (): React.ReactElement => {
    switch (screen) {
      case 'landing': return <Landing />;
      case 'onboarding': return <Onboarding />;
      case 'home': return <Home />;
      case 'adventures': return <Adventures />;
      case 'adventure-detail': return <AdventureDetail />;
      case 'adventure-map': return <AdventureMap />;
      case 'quests': return <Quests />;
      case 'achievements': return <Achievements />;
      case 'profile': return <Profile />;
      case 'daily-rewards': return <DailyRewards />;
      case 'challenges': return <Challenges />;
      case 'community': return <Community />;
      case 'friends': return <Friends />;
      case 'party': return <Party />;
      case 'shop': return <Shop />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  const showNav = ['home', 'adventures', 'quests', 'profile'].includes(screen);

  return (
    <>
      {renderScreen()}
      {showNav && <BottomNav />}
    </>
  );
}
