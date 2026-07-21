import { useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/db'
import ScreenShell from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'

const COLORS = [
  { name: 'Emerald', value: '#10b981' }, { name: 'Amber', value: '#f59e0b' }, { name: 'Sky', value: '#0ea5e9' },
  { name: 'Rose', value: '#f43f5e' }, { name: 'Violet', value: '#8b5cf6' }, { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' }, { name: 'Pink', value: '#ec4899' }, { name: 'Lime', value: '#84cc16' },
  { name: 'Cyan', value: '#06b6d4' }, { name: 'Indigo', value: '#6366f1' }, { name: 'Red', value: '#ef4444' },
]

export default function AvatarScreen() {
  const { profile, refreshProfile } = useAuth()
  const [selected, setSelected] = useState(profile?.avatar_color || '#10b981')
  const [saving, setSaving] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const handleSave = async () => {
    setSaving(true)
    if (!profile) return
    const ok = await updateProfile({ id: profile.id, avatar_color: selected })
    setSaving(false)
    if (ok) { push('success', 'Avatar updated!'); refreshProfile() }
    else push('error', 'Failed to save')
  }

  return (
    <>
      <ScreenShell title="Avatar" subtitle="Customize your look">
        <div className="space-y-5">
          <div className="card-premium p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors" style={{ background: `linear-gradient(135deg, ${selected}, ${selected}cc)` }}>
              <span className="text-4xl font-bold text-white">{profile?.username?.charAt(0).toUpperCase() || 'A'}</span>
            </div>
            <p className="text-sm font-bold text-ink-100">{profile?.username || 'Adventurer'}</p>
            <p className="text-xs text-ink-500">Level {profile?.level || 1}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Palette size={14} /> Choose Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setSelected(c.value)} className={`aspect-square rounded-2xl flex items-center justify-center transition-all btn-press ${selected === c.value ? 'ring-2 ring-white scale-105' : ''}`} style={{ background: `linear-gradient(135deg, ${c.value}, ${c.value}cc)` }}>
                  {selected === c.value && <Check className="text-white" size={20} />}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl text-sm font-bold btn-press disabled:opacity-50">Save Changes</button>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
