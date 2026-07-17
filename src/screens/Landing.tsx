import { ZeviqoLogo, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { APP_TAGLINE } from '../data';
import { useStore } from '../store';

export function Landing() {
  const { setScreen, hasOnboarded } = useStore();
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      <AdventureBg />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-12"><ZeviqoLogo size="lg" /></div>
        <h1 className="text-3xl font-display font-extrabold text-white text-center mb-3">{APP_TAGLINE}</h1>
        <p className="text-sm text-white/50 text-center max-w-xs mb-12">
          Explore unique routes, complete quests, find treasures, and level up your walking adventures.
        </p>
        <Button size="lg" fullWidth icon="ArrowRight" onClick={() => setScreen(hasOnboarded ? 'home' : 'onboarding')} className="max-w-xs">
          Start Your Journey
        </Button>
      </div>
      <div className="relative z-10 pb-8 text-center">
        <p className="text-[10px] text-white/30">Powered by Zeviqo</p>
      </div>
    </div>
  );
}
