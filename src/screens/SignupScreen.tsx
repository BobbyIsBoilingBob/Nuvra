import { useState } from 'react'
import { Compass, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useToasts, ToastContainer } from '@/components/Toast'

interface Props { onLogin: () => void }

export default function SignupScreen({ onLogin }: Props) {
  const { signUp } = useAuth()
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { push('error', 'Fill in all fields'); return }
    if (password.length < 6) { push('error', 'Password must be 6+ characters'); return }
    setLoading(true)
    const { error } = await signUp(email, password, name)
    setLoading(false)
    if (error) push('error', 'Sign up failed', error)
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-glow-accent mb-4 animate-float">
              <Compass size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold gradient-text">Join Zeviqo</h1>
            <p className="text-sm text-ink-400 mt-1.5">Start your adventure today</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Display name" className="w-full bg-surface-100 border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
            </div>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-surface-100 border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ chars)" className="w-full bg-surface-100 border border-white/[0.06] rounded-xl pl-11 pr-11 py-3.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white rounded-xl font-bold text-sm btn-press shadow-glow-accent disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>
          <p className="text-center text-sm text-ink-400 mt-6">Already have an account? <button onClick={onLogin} className="text-brand-400 font-semibold hover:text-brand-300">Sign in</button></p>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
