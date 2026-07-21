import { useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/db'
import ScreenShell from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'

const COLORS = [
  { id: 'emerald', bg: 'from-emerald-500 to-teal-600' }, { id: 'blue', bg: 'from-blue-500 to-indigo-600' },
  { id: 'amber', bg: 'from-amber-500 to-orange-600' }, { id: 'rose', bg: 'from-rose-500 to-pink-600' },
  { id: 'purple', bg: 'from-purple-500 to-violet-600' }, { id: 'cyan', bg: 'from-cyan-500 to-blue-600' },
  { id: 'lime', bg: 'from-lime-500 to-green-600' }, { id: 'red', bg: 'from-red-500 to-rose-600' },
]

export default function AvatarScreen() {
  const { profile, refreshProfile } = useAuth()
  const [selected, setSelected] = useState(profile?.avatar_color || 'emerald')
  const { toasts, push, dismiss } = useToasts()

  const apply = async (color: string) => {
    setSelected(color)
    if (!profile) return
    await updateProfile({ id: profile.id, avatar_color: color })
    push('success', 'Avatar updated!')
    refreshProfile()
  }

  return (
    <>
      <ScreenShell title="Avatar" subtitle="Customize your look">
        <div className="space-y-6">
          <div className="text-center mb-2 animate-slide-up">
            <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br ${COLORS.find(c => c.id === selected)?.bg || COLORS[0].bg} text-white text-4xl font-extrabold shadow-lg mb-3`}>{profile?.username.charAt(0).toUpperCase() || 'A'}</div>
            <p className="text-sm font-bold text-ink-100">{profile?.username}</p>
            <p className="text-xs text-ink-500 mt-0.5">Level {profile?.level ?? 1}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Palette size={12} /> Choose Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map((c, i) => (
                <button key={c.id} onClick={() => apply(c.id)} className={`aspect-square rounded-2xl bg-gradient-to-br ${c.bg} flex items-center justify-center btn-press stagger ${selected === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-950' : ''}`} style={{ animationDelay: `${i * 40}ms` }}>
                  {selected === c.id && <Check size={24} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
