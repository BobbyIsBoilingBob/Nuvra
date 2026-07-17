import { ZeviqoLogo, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';

export function Landing(): React.ReactElement {
  const { setScreen } = useStore();
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6">
      <AdventureBg accent="#3dd4ff" />
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm text-center">
        <div className="animate-[bounce-in_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
          <ZeviqoLogo size="lg" />
        </div>
        <p className="text-sm text-white/40 leading-relaxed">Turn your daily walks into epic adventures. Discover treasures, complete challenges, and level up as you explore the world.</p>
        <Button variant="primary" size="lg" fullWidth icon="ArrowRight" onClick={() => setScreen('onboarding')}>Start Your Journey</Button>
      </div>
    </div>
  );
}
