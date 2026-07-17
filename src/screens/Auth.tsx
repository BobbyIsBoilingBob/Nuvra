import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Icon, ZeviqoLogo } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';

export function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
      } else if (mode === 'signup') {
        const { error: err } = await signUp(email, password, username);
        if (err) setError(err);
      } else {
        const { error: err } = await resetPassword(email);
        if (err) setError(err); else setResetSent(true);
      }
    } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      <AdventureBg />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8"><ZeviqoLogo size="lg" /></div>
        <div className="glass-strong rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-display font-bold text-white text-center">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Start Your Adventure' : 'Reset Password'}
          </h2>
          {resetSent && <p className="text-sm text-zeviqo-300 text-center">Password reset link sent. Check your email.</p>}
          {error && <div className="glass rounded-xl px-3 py-2 flex items-start gap-2 border-rose-500/20"><Icon name="AlertCircle" size={14} className="text-rose-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-rose-300">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-white/50 font-semibold mb-1 block">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="explorer123" className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40" />
              </div>
            )}
            <div>
              <label className="text-xs text-white/50 font-semibold mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40" />
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="text-xs text-white/50 font-semibold mb-1 block">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40" />
              </div>
            )}
            <Button type="submit" fullWidth size="lg" disabled={loading} icon={loading ? undefined : mode === 'login' ? 'LogIn' : mode === 'signup' ? 'Rocket' : 'Mail'}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </Button>
          </form>
          <div className="flex items-center justify-between text-xs">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('reset')} className="text-white/40 hover:text-zeviqo-300">Forgot password?</button>
                <button onClick={() => { setMode('signup'); setError(null); }} className="text-zeviqo-300 font-semibold">Sign up</button>
              </>
            ) : (
              <button onClick={() => { setMode('login'); setError(null); setResetSent(false); }} className="text-zeviqo-300 font-semibold mx-auto">Back to login</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
