import { useState } from 'react'
import { Mail, Lock, LogIn, Compass } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface Props {
  onNavigate: (screen: 'signup') => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function LoginScreen({ onNavigate, onToast }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) onToast('error', 'Login failed', error)
    else onToast('success', 'Welcome back!')
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-500/20 border border-brand-500/30 mb-4">
            <Compass size={36} className="text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-ink-100">Zeviqo</h1>
          <p className="text-sm text-ink-400 mt-1">Adventure awaits</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Email</label>
            <div className="relative mt-1.5">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-ink-900 border border-ink-700 rounded-xl pl-11 pr-3 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Password</label>
            <div className="relative mt-1.5">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-ink-900 border border-ink-700 rounded-xl pl-11 pr-3 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-ink-400 mt-6">
          No account?{' '}
          <button onClick={() => onNavigate('signup')} className="text-brand-400 font-medium hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
