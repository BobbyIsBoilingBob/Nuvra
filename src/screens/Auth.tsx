import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Card } from '../components/ui';
import { AdventureBg } from '../components/BottomNav';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, username);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-950 relative">
      <AdventureBg />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🧭</div>
          <h1 className="font-display text-3xl font-bold text-white">Zeviqo</h1>
          <p className="text-ink-400 mt-1">Your walking adventure awaits</p>
        </div>
        <Card className="p-6">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode('signin')} className={`flex-1 py-2 rounded-xl font-semibold text-sm ${mode === 'signin' ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>Sign In</button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-xl font-semibold text-sm ${mode === 'signup' ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>Sign Up</button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username (3-20 chars)" className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" required />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" required minLength={6} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
