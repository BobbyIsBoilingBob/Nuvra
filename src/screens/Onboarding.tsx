import { useState } from 'react';
import { ZeviqoLogo, Button, Icon } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';

export function Onboarding() {
  const { completeOnboarding, setProfile } = useStore();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');

  const steps = [
    {
      icon: 'Compass',
      title: 'Welcome to Zeviqo',
      desc: 'Turn every walk into an adventure. Discover unique routes, find hidden treasures, and level up as you explore the world around you.'
    },
    {
      icon: 'Map',
      title: 'Explore Endless Adventures',
      desc: 'From treasure hunts to scenic walks, every adventure is procedurally generated. No two walks are ever the same.'
    },
    {
      icon: 'Trophy',
      title: 'Level Up & Earn Rewards',
      desc: 'Complete quests, unlock achievements, collect daily rewards, and challenge yourself with new goals every day.'
    }
  ];

  if (step < 3) {
    const s = steps[step];
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
        <AdventureBg />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-3xl glass-strong flex items-center justify-center mb-8 animate-pulse-glow">
            <Icon name={s.icon} size={40} className="text-zeviqo-400" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white text-center mb-3">{s.title}</h2>
          <p className="text-sm text-white/50 text-center max-w-xs mb-8">{s.desc}</p>
        </div>
        <div className="relative z-10 px-6 pb-8 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-zeviqo-400' : 'w-1.5 bg-white/20'}`} />
            ))}
          </div>
          <Button size="lg" fullWidth icon="ArrowRight" onClick={() => setStep(step + 1)} className="max-w-xs">
            {step === 2 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      <AdventureBg />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <ZeviqoLogo size="md" />
        <h2 className="text-2xl font-display font-extrabold text-white text-center mt-8 mb-2">Create Your Profile</h2>
        <p className="text-sm text-white/50 text-center mb-8 max-w-xs">Choose your explorer name to get started.</p>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value.slice(0, 20))}
          placeholder="Enter your name"
          maxLength={20}
          className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg font-bold outline-none focus:border-zeviqo-400/50 mb-4"
        />
        <Button
          size="lg"
          fullWidth
          icon="Check"
          disabled={!username.trim()}
          onClick={() => { setProfile({ username: username.trim() }); completeOnboarding(); }}
          className="max-w-xs"
        >
          Begin Adventure
        </Button>
      </div>
    </div>
  );
}
