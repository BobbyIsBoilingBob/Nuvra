import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Card } from '../components/ui';
import { Mail, Lock, User, Eye, EyeOff, Loader as Loader2, CircleAlert as AlertCircle, Compass } from 'lucide-react';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-950">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-2">🧭</div>
        <h1 className="font-display text-4xl font-bold text-zeviqo-400">Zeviqo</h1>
        <p className="text-ink-400 mt-1">Walking Adventures</p>
      </div>

      <Card className="w-full max-w-sm p-6">
        <div className="flex gap-2 mb-6 p-1 bg-ink-700/50 rounded-xl">
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-zeviqo-500 text-ink-950' : 'text-ink-400'}`}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-sm text-ink-400 mb-1 block">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="3-20 characters" maxLength={20}
                  className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm text-ink-400 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" />
            </div>
          </div>
          <div>
            <label className="text-sm text-ink-400 mb-1 block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-400">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 size={20} className="animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </Card>
      <p className="text-ink-500 text-xs mt-6 flex items-center gap-1">
        <Compass size={14} /> Start your walking adventure today
      </p>
    </div>
  );
}
