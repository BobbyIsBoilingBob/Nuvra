import { useState, useCallback, memo } from 'react'
import { Mail, Lock, User, UserPlus, Compass } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuth } from '@/lib/auth'

interface Props { onNavigate: (s: 'home') => void }

function SignupScreenInner({ onNavigate }: Props) {
  const { signUp } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password.trim()) { push('error', 'Missing fields', 'Fill in all fields'); return }
    if (password.length < 6) { push('error', 'Password too short', 'Use at least 6 characters'); return }
    setBusy(true)
    const { error } = await signUp(email.trim(), password, username.trim())
    setBusy(false)
    if (error) { push('error', 'Signup failed', error); return }
    push('success', 'Account created!', 'Welcome to Zeviqo')
    onNavigate('home')
  }, [username, email, password, signUp, push, onNavigate])

  return (
    <>
      <ScreenShell title="Sign Up" subtitle="Start your adventure" icon={<Compass size={18} />}>
        <div className="flex flex-col items-center pt-6 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-6 shadow-glow-brand">
            <UserPlus size={40} className="text-white" />
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="section-label">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Explorer123" className="input-field pl-10" autoComplete="username" />
              </div>
            </div>
            <div>
              <label className="section-label">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-10" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="section-label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="input-field pl-10" autoComplete="new-password" />
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn-primary flex items-center justify-center gap-2 w-full disabled:opacity-50">
              {busy ? <LoadingSpinner size="sm" /> : <UserPlus size={18} />}
              {busy ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-ink-400 mt-6 text-center">
            Already have an account? <button onClick={() => push('info', 'Sign in', 'Use the login screen to sign in')} className="text-brand-600 font-bold">Sign in</button>
          </p>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const SignupScreen = memo(SignupScreenInner)
