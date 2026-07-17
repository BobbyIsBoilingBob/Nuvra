import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Button, Icon, ZeviqoLogo } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';

const AVATAR_OPTIONS = [
  { emoji: '🧭', color: '#00c4ff' }, { emoji: '🦊', color: '#fb923c' }, { emoji: '🦉', color: '#8b5cf6' },
  { emoji: '🐱', color: '#22c55e' }, { emoji: '🐧', color: '#4de8ff' }, { emoji: '🦄', color: '#e879f9' },
];

export function Onboarding() {
  const { updateProfile } = useAuth();
  const { setScreen } = useStore();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);

  function handleFinish() {
    if (username) updateProfile({ username, avatar_emoji: avatar.emoji, avatar_color: avatar.color });
    setScreen('home');
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center px-6">
      <AdventureBg />
      <div className="relative z-10 max-w-sm mx-auto w-full">
        {step === 0 && (
          <div className="text-center animate-slide-up">
            <ZeviqoLogo size="lg" />
            <h2 className="text-xl font-display font-bold text-white mt-6">Welcome to Zeviqo</h2>
            <p className="text-sm text-white/50 mt-2">Turn your walks into adventures. Discover hidden treasures, complete challenges, and level up.</p>
            <Button fullWidth size="lg" className="mt-6" icon="ArrowRight" onClick={() => setStep(1)}>Get Started</Button>
          </div>
        )}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-xl font-display font-bold text-white mb-4">Choose Your Avatar</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {AVATAR_OPTIONS.map(a => (
                <button key={a.emoji} onClick={() => setAvatar(a)} className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all ${avatar.emoji === a.emoji ? 'ring-2 ring-zeviqo-400' : 'glass'}`} style={{ background: `${a.color}22` }}>{a.emoji}</button>
              ))}
            </div>
            <Button fullWidth size="lg" icon="ArrowRight" onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-xl font-display font-bold text-white mb-4">What's Your Name?</h2>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Explorer123" maxLength={20} className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40 mb-6" />
            <Button fullWidth size="lg" icon="Rocket" onClick={handleFinish} disabled={username.length < 3}>Start Exploring</Button>
          </div>
        )}
      </div>
    </div>
  );
}
