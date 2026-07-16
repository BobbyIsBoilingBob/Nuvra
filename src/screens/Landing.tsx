import { Icon, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';

export function Landing(): React.ReactElement {
  const { setScreen } = useStore();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AdventureBg variant="space" accent="#40f5cb" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-nova-400 to-cyan-400 flex items-center justify-center shadow-glow">
            <Icon name="Compass" size={48} className="text-ink-950" strokeWidth={2.5} />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">Nuvra</h1>
            <p className="text-lg font-semibold text-nova-300">Your world becomes the adventure</p>
          </div>

          {/* Description */}
          <p className="max-w-md text-center text-sm text-white/60 leading-relaxed">
            Turn every walk into an epic journey. Discover hidden treasures, complete challenges,
            and explore the world around you like never before.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            icon="Rocket"
            fullWidth
            onClick={() => setScreen('onboarding')}
          >
            Begin Your Journey
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => setScreen('home')}
          >
            I already have an account
          </Button>
        </div>

        {/* Footer Badges */}
        <div className="mt-12 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-nova-500/30 bg-white/[0.04] text-nova-300">
            <Icon name="Shield" size={14} />
            No pay-to-win
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-plasma-500/30 bg-white/[0.04] text-plasma-300">
            <Icon name="Sparkles" size={14} />
            Cosmetic only
          </span>
        </div>
      </div>
    </div>
  );
}
