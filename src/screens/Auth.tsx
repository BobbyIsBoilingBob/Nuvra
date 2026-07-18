import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

export default function Auth() {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const resetTo = useStore((s) => s.resetTo);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null); setBusy(true);
    const res = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, username || 'Adventurer');
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    setOnboarded(true); resetTo('home');
  };

  const guest = () => { continueAsGuest(); setOnboarded(true); resetTo('home'); };

  return (
    <div className="px-4 py-10 max-w-md mx-auto min-h-screen flex flex-col justify-center">
      <h1 className="font-display text-3xl font-bold text-white text-center">{mode === 'signin' ? 'Welcome back' : 'Join Zeviqo'}</h1>
      <p className="text-ink-400 text-center mt-2">{mode === 'signin' ? 'Sign in to continue your adventure.' : 'Create an account to start exploring.'}</p>
      <Card className="p-5 mt-6 space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="text-ink-300 text-sm font-medium">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Trailblazer"
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-ink-900 border border-ink-700 text-white focus:border-brand-500 outline-none" />
          </div>
        )}
        <div>
          <label className="text-ink-300 text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-ink-900 border border-ink-700 text-white focus:border-brand-500 outline-none" />
        </div>
        <div>
          <label className="text-ink-300 text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-ink-900 border border-ink-700 text-white focus:border-brand-500 outline-none" />
        </div>
        {error && <p className="text-error-400 text-sm">{error}</p>}
        <Button className="w-full" onClick={submit} disabled={busy || !email || !password}>
          {busy ? <Spinner /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </Card>
      <p className="text-center text-ink-400 text-sm mt-4">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }} className="text-brand-400 font-semibold hover:text-brand-300">
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
      <p className="text-center mt-3">
        <button onClick={guest} className="text-ink-400 text-sm hover:text-ink-200">Continue as guest</button>
      </p>
    </div>
  );
}
