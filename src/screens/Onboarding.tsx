import { useState } from 'react';
import { Icon, Button, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';
import { AVATARS, ADVENTURE_STYLES, type Avatar, type AdventureStyle } from '../data';

const TOTAL_STEPS = 4;

export function Onboarding(): React.ReactElement {
  const { updateProfile, setScreen } = useStore();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [style, setStyle] = useState<AdventureStyle | null>(null);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  function finish(): void {
    if (avatar && style) {
      updateProfile({ username: username || 'Explorer', avatar, style });
    }
    setScreen('home');
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AdventureBg variant="space" accent="#40f5cb" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-8 safe-top safe-bottom">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-xs font-bold text-nova-300">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} accent="from-nova-400 to-cyan-300" height={6} />
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nova-400 to-cyan-400 flex items-center justify-center shadow-glow">
                <Icon name="Compass" size={40} className="text-ink-950" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-3">Welcome to Nuvra</h1>
                <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                  Let's set up your explorer profile. It only takes a minute, and then your world
                  becomes the adventure.
                </p>
              </div>
              <Button variant="primary" size="lg" icon="ArrowRight" fullWidth onClick={() => setStep(1)}>
                Get Started
              </Button>
            </div>
          )}

          {/* Step 1: Choose Avatar */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">Choose Your Avatar</h2>
                <p className="text-sm text-white/50 mb-4">Pick an explorer identity and a username.</p>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl glass text-white text-sm font-semibold placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-nova-400/50 mb-5"
                />
                <div className="grid grid-cols-3 gap-3">
                  {AVATARS.map((av) => {
                    const selected = avatar?.id === av.id;
                    return (
                      <button
                        key={av.id}
                        onClick={() => setAvatar(av)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
                          selected
                            ? 'glass-strong ring-2 ring-nova-400 scale-[1.02]'
                            : 'glass hover:bg-white/[0.1]'
                        }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-full bg-gradient-to-br ${av.color} flex items-center justify-center text-2xl`}
                        >
                          <span>{av.emoji}</span>
                        </div>
                        <span className="text-xs font-bold text-white">{av.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon="ArrowRight"
                fullWidth
                disabled={!avatar || !username.trim()}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Pick Style */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">Pick Your Style</h2>
                <p className="text-sm text-white/50 mb-4">What kind of explorer are you?</p>
                <div className="flex flex-col gap-3">
                  {ADVENTURE_STYLES.map((s) => {
                    const selected = style === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left ${
                          selected
                            ? 'glass-strong ring-2 ring-nova-400 scale-[1.01]'
                            : 'glass hover:bg-white/[0.1]'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-nova-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Icon name={s.icon} size={22} className="text-ink-950" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white">{s.label}</div>
                          <div className="text-xs text-white/50">{s.desc}</div>
                        </div>
                        {selected && <Icon name="Check" size={20} className="text-nova-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon="ArrowRight"
                fullWidth
                disabled={!style}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && avatar && style && (
            <div className="flex flex-col items-center text-center gap-6">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-5xl ring-4 ring-white/20`}
              >
                <span>{avatar.emoji}</span>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-1">
                  {username || 'Explorer'}
                </h2>
                <p className="text-sm text-nova-300 font-semibold capitalize">
                  {style.replace('_', ' ')} Explorer
                </p>
              </div>
              <div className="glass rounded-2xl px-6 py-4 w-full">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Avatar</span>
                  <span className="text-white font-bold">{avatar.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-white/50">Style</span>
                  <span className="text-white font-bold capitalize">{style.replace('_', ' ')}</span>
                </div>
              </div>
              <Button variant="primary" size="lg" icon="Rocket" fullWidth onClick={finish}>
                Start Exploring
              </Button>
            </div>
          )}
        </div>

        {/* Back button */}
        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors self-center"
          >
            <Icon name="ChevronLeft" size={16} />
            Back
          </button>
        )}
      </div>
    </div>
  );
}
