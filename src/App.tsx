import { StoreProvider, useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { EncouragementToast, MysteryBanner, CelebrationOverlay } from './components/ui';
import { Landing } from './screens/Landing';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Adventures } from './screens/Adventures';
import { AdventureDetail } from './screens/AdventureDetail';
import { AdventureMap } from './screens/AdventureMap';
import { AIGenerator } from './screens/AIGenerator';
import { Challenges } from './screens/Challenges';
import { Rewards } from './screens/Rewards';
import { Community } from './screens/Community';
import { Creator } from './screens/Creator';
import { Profile } from './screens/Profile';
import { Customise } from './screens/Customise';
import { Shop } from './screens/Shop';
import { Inventory } from './screens/Inventory';
import { Seasonal } from './screens/Seasonal';
import { Settings } from './screens/Settings';

const NO_NAV_SCREENS = ['landing', 'onboarding', 'adventure-map'];

function ScreenRouter() {
  const { screen, accessibility } = useStore();
  const showNav = !NO_NAV_SCREENS.includes(screen);

  const rootClasses = [
    'min-h-screen bg-ink-950 text-white antialiased',
    accessibility.highContrast ? 'hc-mode' : '',
    accessibility.reducedMotion ? 'reduce-motion' : '',
    accessibility.largeText ? 'large-text' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClasses}>
      {screen === 'landing' && <Landing />}
      {screen === 'onboarding' && <Onboarding />}
      {screen === 'home' && <Home />}
      {screen === 'adventures' && <Adventures />}
      {screen === 'adventure-detail' && <AdventureDetail />}
      {screen === 'adventure-map' && <AdventureMap />}
      {screen === 'ai-generator' && <AIGenerator />}
      {screen === 'challenges' && <Challenges />}
      {screen === 'rewards' && <Rewards />}
      {screen === 'community' && <Community />}
      {screen === 'creator' && <Creator />}
      {screen === 'profile' && <Profile />}
      {screen === 'customise' && <Customise />}
      {screen === 'shop' && <Shop />}
      {screen === 'inventory' && <Inventory />}
      {screen === 'seasonal' && <Seasonal />}
      {screen === 'settings' && <Settings />}
      {showNav && <BottomNav />}
      <EncouragementToast />
      <MysteryBanner />
      <CelebrationOverlay />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ScreenRouter />
    </StoreProvider>
  );
}
