import { useState, useCallback, memo } from 'react'
import { Mail, Lock, LogIn, Compass } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuth } from '@/lib/auth'

interface Props { onNavigate: (s: 'home') => void }

function LoginScreenInner({ onNavigate }: Props) {
  const { signIn } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { push('error', 'Missing fields', 'Enter email and password'); return }
    setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) { push('error', 'Login failed', error); return }
    push('success', 'Welcome back!', 'You are signed in')
    onNavigate('home')
  }, [email, password, signIn, push, onNavigate])

  return (
    <>
      <ScreenShell title="Sign In" subtitle="Welcome back, explorer" icon={<Compass size={18} />}>
        <div className="flex flex-col items-center pt-6 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-6 shadow-glow-brand">
            <Compass size={40} className="text-white" />
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
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
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="input-field pl-10" autoComplete="current-password" />
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn-primary flex items-center justify-center gap-2 w-full disabled:opacity-50">
              {busy ? <LoadingSpinner size="sm" /> : <LogIn size={18} />}
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-ink-400 mt-6 text-center">
            New here? <button onClick={() => push('info', 'Sign up', 'Use the signup screen to create an account')} className="text-brand-600 font-bold">Create account</button>
          </p>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const LoginScreen = memo(LoginScreenInner)
