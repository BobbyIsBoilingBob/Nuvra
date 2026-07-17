import { Icon, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';

export function Landing(): React.ReactElement {
  const { setScreen } = useStore();
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6">
      <AdventureBg accent="#33ffd6" />
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nova-400 to-plasma-500 flex items-center justify-center text-4xl shadow-glow-lg animate-[bounce-in_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
          🧭
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">NUVRA</h1>
          <p className="text-sm text-white/50 font-medium">Walking Adventures</p>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          Explore the world around you. Complete adventures, earn rewards, and walk with friends in real-time.
        </p>
        <Button variant="primary" size="lg" fullWidth icon="ArrowRight" onClick={() => setScreen('onboarding')}>
          Start Your Journey
        </Button>
      </div>
    </div>
  );
}
