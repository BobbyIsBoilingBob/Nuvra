import { useState } from 'react';
import { ZeviqoLogo, Button, Icon, Spinner } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useAuth } from '../lib/auth';
import { APP_TAGLINE } from '../data';

type Mode = 'login' | 'signup' | 'reset';

export function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) { setError(error); setLoading(false); }
    } else if (mode === 'signup') {
      const { error } = await signUp(email.trim(), password, username.trim());
      if (error) { setError(error); setLoading(false); }
      else { setSuccess('Account created! Welcome to Zeviqo.'); setLoading(false); }
    } else {
      const { error } = await resetPassword(email.trim());
      if (error) { setError(error); setLoading(false); }
      else { setSuccess('Password reset link sent! Check your email.'); setLoading(false); }
    }
  };

  const switchMode = (m: Mode) => { setMode(m); setError(null); setSuccess(null); setPassword(''); setUsername(''); };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      <AdventureBg />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="mb-8 animate-fade-in"><ZeviqoLogo size="lg" /></div>
        <p className="text-sm text-white/50 text-center mb-8 max-w-xs">{APP_TAGLINE}</p>
        <div className="w-full max-w-sm flex flex-col gap-4 animate-slide-up">
          <div className="flex gap-1 p-1 glass rounded-2xl">
            <button onClick={() => switchMode('login')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode==='login'?'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950':'text-white/50'}`}>Log In</button>
            <button onClick={() => switchMode('signup')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode==='signup'?'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950':'text-white/50'}`}>Sign Up</button>
          </div>
          {error && <div className="glass rounded-xl px-4 py-3 flex items-start gap-2 border border-rose-500/20"><Icon name="AlertCircle" size={16} className="text-rose-400 mt-0.5 flex-shrink-0" /><span className="text-xs text-rose-300 font-medium">{error}</span></div>}
          {success && <div className="glass rounded-xl px-4 py-3 flex items-start gap-2 border border-emerald-500/20"><Icon name="CheckCircle" size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" /><span className="text-xs text-emerald-300 font-medium">{success}</span></div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-white/40 mb-1 block font-medium">Username</label>
                <div className="relative"><Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" maxLength={20} autoComplete="username" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-white text-sm outline-none focus:border-zeviqo-400/50" /></div>
                <p className="text-[10px] text-white/30 mt-1">3-20 characters, letters/numbers/underscores only</p>
              </div>
            )}
            <div>
              <label className="text-xs text-white/40 mb-1 block font-medium">Email</label>
              <div className="relative"><Icon name="Mail" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-white text-sm outline-none focus:border-zeviqo-400/50" /></div>
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="text-xs text-white/40 mb-1 block font-medium">Password</label>
                <div className="relative"><Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm outline-none focus:border-zeviqo-400/50" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"><Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} /></button></div>
              </div>
            )}
            <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">{loading ? <Spinner size={18} /> : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</Button>
          </form>
          {mode === 'login' && <button onClick={() => switchMode('reset')} className="text-xs text-zeviqo-400 font-medium text-center hover:text-zeviqo-300">Forgot your password?</button>}
          {mode === 'reset' && <button onClick={() => switchMode('login')} className="text-xs text-zeviqo-400 font-medium text-center hover:text-zeviqo-300">Back to login</button>}
          {mode === 'signup' && <p className="text-[10px] text-white/30 text-center">By creating an account, you agree to Zeviqo's Terms of Service and Privacy Policy.</p>}
        </div>
      </div>
    </div>
  );
}
