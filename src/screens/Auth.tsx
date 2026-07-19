import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';

export default function Auth() {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const returnAfterAuth = useStore((s) => s.returnAfterAuth);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    const res = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, username || email.split('@')[0]);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    returnAfterAuth();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🧭</div>
          <h1 className="text-2xl font-bold text-ink-900">Zeviqo</h1>
          <p className="text-ink-500 text-sm mt-1">Walking adventures, everywhere.</p>
        </div>
        <div className="flex bg-ink-100 rounded-xl p-1 mb-6">
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === m ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" required minLength={6} />
          {error && <p className="text-sm text-error-600">{error}</p>}
          <Button type="submit" fullWidth disabled={busy}>
            {busy ? <Spinner size={18} className="mx-auto" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-ink-400">
          <div className="flex-1 h-px bg-ink-200" /> OR <div className="flex-1 h-px bg-ink-200" />
        </div>
        <Button variant="secondary" fullWidth onClick={() => { continueAsGuest(); returnAfterAuth(); }}>Continue as Guest</Button>
      </div>
    </div>
  );
}
