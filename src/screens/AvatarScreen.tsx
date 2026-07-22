import { useState } from 'react'
import { Smile, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/db'
import { useToasts, ToastContainer } from '@/components/Toast'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'

interface Props { onNavigate: (s: string) => void }

const colors = ['#10b981', '#f59e0b', '#312f81', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6']

export default function AvatarScreen({ onNavigate }: Props) {
  const { profile, refreshProfile } = useAuth()
  const [selected, setSelected] = useState(profile?.avatar_color || '#10b981')
  const [saving, setSaving] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const ok = await updateProfile({ id: profile.id, avatar_color: selected })
    setSaving(false)
    if (ok) { push('success', 'Avatar updated!'); await refreshProfile() } else push('error', 'Failed to save')
  }

  return (
    <>
      <ScreenShell title="Avatar" subtitle="Customize your look" onBack={() => onNavigate('profile')}>
        <div className="space-y-6">
          <div className="flex flex-col items-center py-4">
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-white text-5xl font-extrabold shadow-glow-brand mb-3 transition-colors duration-300" style={{ background: selected }}>
              {profile?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <p className="text-sm font-bold text-ink-900">{profile?.username || 'Adventurer'}</p>
            <p className="text-xs text-ink-400">Level {profile?.level || 1}</p>
          </div>

          <div>
            <h3 className="section-label flex items-center gap-1.5"><Smile size={12} /> Choose Color</h3>
            <div className="grid grid-cols-5 gap-3">
              {colors.map(c => (
                <button key={c} onClick={() => setSelected(c)} className={`aspect-square rounded-2xl flex items-center justify-center transition btn-press ${selected === c ? 'ring-4 ring-brand-400 ring-offset-2' : ''}`} style={{ background: c }}>
                  {selected === c && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || selected === profile?.avatar_color} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : <><Check size={18} /> Save Avatar</>}
          </button>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
