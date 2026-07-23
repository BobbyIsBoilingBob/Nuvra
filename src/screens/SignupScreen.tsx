import { useState } from 'react'
import { MapPin, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface Props { onLogin: () => void }
export default function SignupScreen({ onLogin }: Props) {
  const { signUp } = useAuth()
  const [username, setUsername] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [showPass, setShowPass] = useState(false), [error, setError] = useState<string | null>(null), [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setError(null); setLoading(true); const { error } = await signUp(email, password, username); if (error) setError(error); setLoading(false) }
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-0 via-brand-50/40 to-accent-50/30 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-glow-accent mb-6 animate-bounce-in"><MapPin size={40} className="text-white" /></div>
        <h1 className="text-3xl font-extrabold text-ink-900 text-center">Join Zeviqo</h1>
        <p className="text-sm text-ink-500 mt-2 text-center">Create your adventurer account</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4 mt-8 animate-slide-up">
          {error && <div className="bg-error-50 border border-error-300 rounded-xl px-4 py-3 text-sm text-error-700">{error}</div>}
          <div><label className="text-xs font-semibold text-ink-500 mb-1.5 block">Username</label><div className="relative"><User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Your adventurer name" className="input-field pl-11" /></div></div>
          <div><label className="text-xs font-semibold text-ink-500 mb-1.5 block">Email</label><div className="relative"><Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-11" /></div></div>
          <div><label className="text-xs font-semibold text-ink-500 mb-1.5 block">Password</label><div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="input-field pl-11 pr-11" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50">{loading ? 'Creating account...' : <>Create Account <ArrowRight size={18} /></>}</button>
        </form>
        <div className="flex items-center gap-3 my-6 w-full"><div className="flex-1 h-px bg-surface-300" /><span className="text-xs text-ink-400 font-medium">or</span><div className="flex-1 h-px bg-surface-300" /></div>
        <button onClick={onLogin} className="btn-secondary">Already have an account? Sign In</button>
      </div>
    </div>
  )
}
