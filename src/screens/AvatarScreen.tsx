import { useState, useCallback, memo } from 'react'
import { User, Palette, Check, X } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/db'
import type { ScreenName } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const avatarColors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#f97316', '#84cc16',
]

function AvatarScreenInner({ onNavigate }: Props) {
  const { profile, refreshProfile } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [selectedColor, setSelectedColor] = useState(profile?.avatar_color ?? avatarColors[0])
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!profile) return
    setSaving(true)
    const ok = await updateProfile({ id: profile.id, avatar_color: selectedColor })
    setSaving(false)
    if (ok) { push('success', 'Avatar updated', 'Your new look is saved'); refreshProfile(); onNavigate('profile') }
    else push('error', 'Update failed', 'Could not save changes')
  }, [profile, selectedColor, push, refreshProfile, onNavigate])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  return (
    <>
      <ScreenShell title="Avatar" subtitle="Customize your look" icon={<User size={18} />} onBack={() => onNavigate('profile')}>
        <div className="space-y-5">
          {/* Preview */}
          <div className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-6 text-center animate-fade-in">
            <div className="inline-block w-28 h-28 rounded-full mb-3 flex items-center justify-center text-4xl font-extrabold text-white shadow-card-hover transition-all duration-300" style={{ background: selectedColor }}>
              {(profile?.username ?? 'U').charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-bold text-ink-900">{profile?.username ?? 'Explorer'}</p>
            <p className="text-xs text-ink-400">Level {profile?.level ?? 1}</p>
          </div>

          {/* Color picker */}
          <div>
            <p className="section-label flex items-center gap-1.5"><Palette size={12} /> Choose Color</p>
            <div className="grid grid-cols-5 gap-3">
              {avatarColors.map(color => (
                <button key={color} onClick={() => setSelectedColor(color)} className={'relative w-14 h-14 rounded-2xl transition btn-press ' + (selectedColor === color ? 'ring-2 ring-brand-500 ring-offset-2' : '')} style={{ background: color }}>
                  {selectedColor === color && <Check size={18} className="absolute inset-0 m-auto text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => onNavigate('profile')} className="flex-1 btn-secondary flex items-center justify-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
              <Check size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="avatar" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const AvatarScreen = memo(AvatarScreenInner)
