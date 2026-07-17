import { useState } from 'react';
import { Icon, Button, GlassCard } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';

const AVATARS = ['🧭', '🦊', '🐱', '🦉', '🐉', '🦄', '🔥', '🌲', '🌊', '⛰️', '🌙', '⭐'];
const COLORS = ['#33ffd6', '#7a33ff', '#ffcc33', '#ff6600', '#22d3ee', '#a78bfa'];

export function Onboarding(): React.ReactElement {
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const handleFinish = () => {
    completeOnboarding(username.trim() || 'Explorer', { emoji: avatar, color });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col px-6 py-8">
      <AdventureBg accent={color} />
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-nova-400' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center animate-[fade-in_0.3s_ease-out]">
            <div className="text-5xl">🧭</div>
            <h2 className="text-2xl font-black text-white">Welcome to Nuvra</h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Turn your daily walks into epic adventures. Discover treasures, complete challenges, and level up as you explore the world.
            </p>
            <Button variant="primary" size="lg" fullWidth icon="ArrowRight" onClick={() => setStep(1)}>
              Continue
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
            <h2 className="text-xl font-black text-white text-center">Choose Your Avatar</h2>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 ${
                    avatar === a ? 'bg-gradient-to-br from-nova-400 to-plasma-500 scale-105 shadow-glow' : 'glass'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <h3 className="text-sm font-bold text-white/60 text-center mt-2">Pick a color</h3>
            <div className="flex gap-3 justify-center">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${color === c ? 'ring-2 ring-white scale-110' : 'ring-1 ring-white/20'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <GlassCard className="px-6 py-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: color + '30' }}>
                  {avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{username || 'Your name'}</div>
                  <div className="text-xs text-white/40">Level 1 · Wanderer</div>
                </div>
              </GlassCard>
            </div>
            <div className="flex gap-3 mt-auto">
              <Button variant="ghost" icon="ArrowLeft" onClick={() => setStep(0)}>Back</Button>
              <Button variant="primary" fullWidth icon="ArrowRight" onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
            <h2 className="text-xl font-black text-white text-center">What's Your Name?</h2>
            <GlassCard className="p-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                placeholder="Enter your explorer name..."
                className="w-full bg-transparent text-white text-lg font-bold placeholder:text-white/30 outline-none text-center"
                autoFocus
                maxLength={20}
              />
            </GlassCard>
            <div className="flex gap-3 mt-auto">
              <Button variant="ghost" icon="ArrowLeft" onClick={() => setStep(1)}>Back</Button>
              <Button variant="primary" fullWidth icon="Check" onClick={handleFinish}>Start Adventure</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
