import { useState } from 'react';
import { useStore } from '../store';
import Button from '../components/Button';
import { Compass, MapPin, Trophy } from 'lucide-react';

const STEPS = [
  { icon: Compass, title: 'Discover adventures', desc: 'Browse walking routes tailored to your location and skill level.' },
  { icon: MapPin, title: 'Follow the route', desc: 'Your GPS tracks your path in real time as you reach checkpoints.' },
  { icon: Trophy, title: 'Earn rewards', desc: 'Complete quests to earn XP, coins, cosmetics, and achievements.' },
];

export default function Onboarding() {
  const resetTo = useStore((s) => s.resetTo);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    setOnboarded(true);
    resetTo('home');
  };

  const Icon = STEPS[step].icon;

  return (
    <div className="px-4 py-10 max-w-md mx-auto flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mb-6">
          <Icon size={36} className="text-brand-300" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white">{STEPS[step].title}</h1>
        <p className="text-ink-300 mt-3 max-w-xs">{STEPS[step].desc}</p>
        <div className="flex gap-2 mt-8">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-brand-400' : 'w-2 bg-ink-600'}`} />
          ))}
        </div>
      </div>
      <div className="pb-6">
        <Button className="w-full" size="lg" onClick={next}>
          {step < STEPS.length - 1 ? 'Continue' : "You're all set! Start exploring"}
        </Button>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full text-ink-400 text-sm mt-3 hover:text-ink-200">
            Back
          </button>
        )}
      </div>
    </div>
  );
}
