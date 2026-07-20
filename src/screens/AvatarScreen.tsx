import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/db'

interface Props { onBack: () => void }

const AVATARS = ['🧭', '🏃', '🚶', '🧗', '📸', '🌿', '🗺', '🎒', '🥾', '🏕', '🌲', '🏔']
const COLORS = [
  { id: '#1ba87d', label: 'Green' },
  { id: '#f97316', label: 'Orange' },
  { id: '#3b82f6', label: 'Blue' },
  { id: '#a855f7', label: 'Purple' },
  { id: '#14b8a6', label: 'Teal' },
  { id: '#f43f5e', label: 'Rose' },
  { id: '#eab308', label: 'Yellow' },
  { id: '#64748b', label: 'Slate' },
]

export default function AvatarScreen({ onBack }: Props) {
  const { profile, refreshProfile } = useAuth()
  const [avatar, setAvatar] = useState(profile?.avatar_emoji ?? '🧭')
  const [color, setColor] = useState(profile?.avatar_color ?? '#1ba87d')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await updateProfile({ id: profile.id, avatar_emoji: avatar, avatar_color: color })
    setSaving(false)
    setSaved(true)
    refreshProfile()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ScreenShell title="Avatar / Customise" icon="🎨" onBack={onBack}>
      <div className="text-center mb-6">
        <div className="w-28 h-28 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl"
          style={{ background: color }}>
          {avatar}
        </div>
        <p className="text-sm text-ink-400">Customise your adventurer avatar</p>
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Avatar</h3>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map(a => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition active:scale-95 ${
                avatar === a ? 'bg-brand-500/20 border-2 border-brand-500' : 'bg-ink-900 border border-ink-800'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Background Colour</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`w-10 h-10 rounded-full transition active:scale-95 ${color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-950' : ''}`}
              style={{ background: c.id }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Avatar'}
      </button>
    </ScreenShell>
  )
}
