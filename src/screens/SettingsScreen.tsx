import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/db'

interface Props { onBack: () => void }

export default function SettingsScreen({ onBack }: Props) {
  const { profile, signOut, refreshProfile } = useAuth()
  const [notifications, setNotifications] = useState(Boolean((profile?.settings as Record<string, unknown>)?.notifications ?? true))
  const [gps, setGps] = useState(Boolean((profile?.settings as Record<string, unknown>)?.gps ?? true))
  const [camera, setCamera] = useState(Boolean((profile?.settings as Record<string, unknown>)?.camera ?? false))
  const [saving, setSaving] = useState(false)

  const settings = [
    { label: 'Push Notifications', value: notifications, set: setNotifications },
    { label: 'GPS Tracking', value: gps, set: setGps },
    { label: 'Camera Access', value: camera, set: setCamera },
  ]

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await updateProfile({
      id: profile.id,
      settings: { notifications, gps, camera },
    })
    setSaving(false)
    refreshProfile()
  }

  return (
    <ScreenShell title="Settings" icon="⚙️" onBack={onBack}>
      <div className="space-y-3 mb-4">
        {settings.map((s, i) => (
          <div key={i} className="flex items-center justify-between bg-ink-900 rounded-xl p-4 border border-ink-800">
            <span className="text-sm text-ink-200">{s.label}</span>
            <button
              onClick={() => s.set(!s.value)}
              className={`w-12 h-6 rounded-full transition relative active:scale-95 ${s.value ? 'bg-brand-500' : 'bg-ink-700'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${s.value ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50 mb-4"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 mb-4">
        <h3 className="text-sm font-semibold text-ink-200 mb-2">About</h3>
        <p className="text-xs text-ink-500">Zeviqo Adventure System v1.0.0</p>
        <p className="text-xs text-ink-500 mt-1">Procedural adventure generator with 71 challenge templates across 16 categories.</p>
      </div>

      <button
        onClick={signOut}
        className="w-full py-3 bg-error-500/10 border border-error-500/30 text-error-400 rounded-xl font-semibold text-sm transition active:scale-95 hover:bg-error-500/20"
      >
        Sign Out
      </button>
    </ScreenShell>
  )
}
