import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Button } from '../components/Button';

export default function Onboarding() {
  const { signUp, continueAsGuest } = useAuth();
  const returnAfterAuth = useStore((s) => s.returnAfterAuth);
  const navigate = useStore((s) => s.navigate);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { title: 'Welcome to Zeviqo', body: 'Walking adventures that turn your neighbourhood into a quest.' },
    { title: 'Explore & Earn', body: 'Complete adventures to earn XP, coins, and treasures.' },
    { title: 'Walk Together', body: 'Join parties, challenge friends, climb the leaderboard.' },
  ];

  async function finish(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signUp(email, password, username || email.split('@')[0]);
    if (res.error) { setError(res.error); return; }
    returnAfterAuth();
  }

  if (step < steps.length) {
    const s = steps[step];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🧭</div>
        <h1 className="text-2xl font-bold mb-3">{s.title}</h1>
        <p className="text-ink-500 mb-8 max-w-xs">{s.body}</p>
        <div className="flex gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-brand-500' : 'w-2 bg-ink-200'}`} />
          ))}
        </div>
        <div className="flex gap-2 w-full max-w-xs">
          {step > 0 && <Button variant="secondary" fullWidth onClick={() => setStep(step - 1)}>Back</Button>}
          <Button fullWidth onClick={() => setStep(step + 1)}>{step === steps.length - 1 ? 'Get Started' : 'Next'}</Button>
        </div>
        <button className="mt-4 text-sm text-ink-400" onClick={() => { continueAsGuest(); navigate('home'); }}>Skip for now</button>
      </div>
    );
  }

  return (
    <form onSubmit={finish} className="min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-bold mb-2">Create your account</h1>
      <input className="px-4 py-3 rounded-xl border border-ink-200" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input className="px-4 py-3 rounded-xl border border-ink-200" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="px-4 py-3 rounded-xl border border-ink-200" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      {error && <p className="text-sm text-error-600">{error}</p>}
      <Button type="submit" fullWidth>Create Account</Button>
      <Button variant="ghost" fullWidth onClick={() => { continueAsGuest(); navigate('home'); }}>Continue as guest</Button>
    </form>
  );
}
