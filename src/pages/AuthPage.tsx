import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthPage() {
  const { signIn, signUp, error, loading, clearError } = useAuthStore()
  const [mode, setMode] = useState<'welcome' | 'signup' | 'login'>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const displayError = localError || error

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()
    if (!EMAIL_REGEX.test(email)) { setLocalError('Please enter a valid email address.'); return }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters long.'); return }
    if (password !== confirmPassword) { setLocalError('Passwords do not match.'); return }
    await signUp(email, password)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()
    if (!EMAIL_REGEX.test(email)) { setLocalError('Please enter a valid email address.'); return }
    if (password.length === 0) { setLocalError('Please enter your password.'); return }
    await signIn(email, password)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-600 via-primary-700 to-neutral-900 p-4 safe-top safe-bottom">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <span className="text-5xl">🧭</span>
          </div>
          <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">Nuvra</h1>
          <p className="text-primary-100 mt-2 text-sm">Explore the world. Complete adventures. Collect treasures.</p>
        </div>

        {mode === 'welcome' && (
          <div className="card p-8 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Welcome</h2>
            <p className="text-neutral-500 text-sm mb-6">Start your exploration journey today.</p>
            <button onClick={() => setMode('signup')} className="btn-primary w-full mb-3">Create New Account</button>
            <button onClick={() => setMode('login')} className="btn-secondary w-full">I already have an account</button>
          </div>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="card p-8 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-1">Create Account</h2>
            <p className="text-neutral-500 text-sm mb-6">Join Nuvra and start exploring.</p>
            {displayError && <div className="mb-4 rounded-xl bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700 animate-fade-in">{displayError}</div>}
            <div className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" autoComplete="email" required />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="input" autoComplete="new-password" required />
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm Password</label>
                <input id="signup-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="input" autoComplete="new-password" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span> : 'Sign Up'}
            </button>
            <button type="button" onClick={() => { setMode('welcome'); setLocalError(null); clearError() }} className="btn-ghost w-full mt-3">Back</button>
          </form>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="card p-8 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-1">I already have an account</h2>
            <p className="text-neutral-500 text-sm mb-6">Welcome back, explorer.</p>
            {displayError && <div className="mb-4 rounded-xl bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700 animate-fade-in">{displayError}</div>}
            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" autoComplete="email" required />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="input" autoComplete="current-password" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span> : 'Log In'}
            </button>
            <button type="button" onClick={() => { setMode('welcome'); setLocalError(null); clearError() }} className="btn-ghost w-full mt-3">Back</button>
          </form>
        )}
      </div>
    </div>
  )
}
