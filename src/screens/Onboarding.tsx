import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { GlassCard, Icon, Button, AvatarDisplay } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { supabase } from '../lib/supabase';

const AVATAR_OPTIONS = [
  { emoji: '🧭', color: '#00c4ff' },
  { emoji: '🚶', color: '#22c55e' },
  { emoji: '🏃', color: '#fb923c' },
  { emoji: '🧗', color: '#8b5cf6' },
  { emoji: '🦊', color: '#fbbf24' },
  { emoji: '🐉', color: '#ef4444' },
  { emoji: '🦉', color: '#60a5fa' },
  { emoji: '🐺', color: '#94a3b8' },
];

const STEPS = [
  { icon: 'Compass', title: 'Welcome to Zeviqo', desc: 'Your walking adventure companion. Explore, collect treasures, and level up!' },
  { icon: 'Palette', title: 'Choose Your Avatar', desc: 'Pick an avatar that represents you on your adventures.' },
  { icon: 'User', title: 'Set Your Username', desc: 'This is how other explorers will see you.' },
];

export function Onboarding() {
  const { setScreen } = useStore();
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    if (username.trim().length < 3) { setError('Username must be at least 3 characters.'); return; }
    setError(null);
    setSaving(true);
    if (user) {
      await updateProfile({
        username: username.trim(),
        avatar_emoji: avatar.emoji,
        avatar_color: avatar.color,
      });
    }
    setSaving(false);
    setScreen('home');
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      <AdventureBg />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-zeviqo-400' : i < step ? 'w-4 bg-zeviqo-500/50' : 'w-4 bg-white/10'}`}
            />
          ))}
        </div>

        <GlassCard className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-zeviqo-400 to-nova-500 flex items-center justify-center mb-3">
              <Icon name={STEPS[step].icon} size={32} className="text-ink-950" />
            </div>
            <h2 className="text-lg font-display font-bold text-white">{STEPS[step].title}</h2>
            <p className="text-sm text-white/50 mt-1">{STEPS[step].desc}</p>
          </div>

          {step === 1 && (
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map(opt => (
                <button
                  key={opt.emoji}
                  onClick={() => setAvatar(opt)}
                  className={`flex justify-center transition-all ${avatar.emoji === opt.emoji ? 'scale-110' : 'opacity-60'}`}
                >
                  <AvatarDisplay emoji={opt.emoji} color={opt.color} size={56} ring={avatar.emoji === opt.emoji} />
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex justify-center mb-2">
                <AvatarDisplay emoji={avatar.emoji} color={avatar.color} size={64} ring />
              </div>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="explorer123"
                maxLength={20}
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40 text-center"
              />
              {error && <p className="text-xs text-rose-300 text-center">{error}</p>}
            </div>
          )}

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="secondary" fullWidth icon="ArrowLeft" onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {step < 2 ? (
              <Button fullWidth icon="ArrowRight" onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button fullWidth size="lg" icon="Rocket" disabled={saving} onClick={handleFinish}>
                {saving ? 'Saving...' : 'Start Adventure'}
              </Button>
            )}
          </div>
          {step === 0 && (
            <button onClick={() => setScreen('home')} className="w-full text-center text-xs text-white/40">
              Skip for now
            </button>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
