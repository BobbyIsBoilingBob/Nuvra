import { useState } from 'react'
import { Palette, Check } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/db'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

const AVATAR_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7',
  '#ec4899', '#14b8a6', '#eab308', '#6366f1', '#84cc16',
  '#06b6d4', '#f43f5e',
]

export default function AvatarScreen({ onBack, onToast }: Props) {
  const { profile, refreshProfile } = useAuth()
  const [color, setColor] = useState(profile?.avatar_color || '#10b981')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const ok = await updateProfile({ id: profile.id, avatar_color: color })
    setSaving(false)
    if (ok) { await refreshProfile(); onToast('success', 'Avatar updated!') }
    else onToast('error', 'Update failed')
  }

  return (
    <ScreenShell title="Avatar" icon={<Palette size={18} />} onBack={onBack}>
      <div className="space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-3 transition" style={{ backgroundColor: color }}>
            <Palette size={40} className="text-white" />
          </div>
          <p className="text-sm text-ink-300">{profile?.username}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-200 mb-3">Avatar Color</h3>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_COLORS.map(c => (
              <button
                key={c} onClick={() => setColor(c)}
                className={`aspect-square rounded-xl transition active:scale-95 flex items-center justify-center ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-950' : ''}`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check size={18} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave} disabled={saving}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
        >
          {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={18} /> Save Avatar</>}
        </button>
      </div>
    </ScreenShell>
  )
}
