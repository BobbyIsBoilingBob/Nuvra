import { useState } from 'react'
import { useAuth } from '@/lib/auth'

interface Props {
  onAuthed: () => void
  onSwitchToSignup: () => void
}

export default function LoginScreen({ onAuthed, onSwitchToSignup }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      onAuthed()
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🧭</div>
        <h1 className="text-2xl font-bold text-ink-100">Zeviqo</h1>
        <p className="text-sm text-ink-400 mt-1">Adventure System</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition"
          />
        </div>

        {error && (
          <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3">
            <p className="text-sm text-error-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 active:scale-95"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-sm text-ink-500 mt-6">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignup} className="text-brand-400 hover:text-brand-300 transition font-medium">
          Sign up
        </button>
      </p>
    </div>
  )
}
