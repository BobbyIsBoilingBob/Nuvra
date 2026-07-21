import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Compass, Camera, Navigation, Smartphone, Volume2, Vibrate, Moon, LogOut } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import { useAuth } from '@/lib/auth'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function SettingsScreen({ onBack, onToast }: Props) {
  const { signOut } = useAuth()
  const [toggles, setToggles] = useState({
    notifications: true, compass: true, camera: true, gps: true, accelerometer: true,
    sound: true, vibration: true, darkMode: true,
  })

  const toggle = (key: keyof typeof toggles) => {
    setToggles(t => ({ ...t, [key]: !t[key] }))
    onToast('info', `${key} ${!toggles[key] ? 'enabled' : 'disabled'}`)
  }

  const settings = [
    { key: 'notifications' as const, label: 'Push Notifications', icon: Bell },
    { key: 'compass' as const, label: 'Compass Sensor', icon: Compass },
    { key: 'camera' as const, label: 'Camera Access', icon: Camera },
    { key: 'gps' as const, label: 'GPS Tracking', icon: Navigation },
    { key: 'accelerometer' as const, label: 'Accelerometer', icon: Smartphone },
    { key: 'sound' as const, label: 'Sound Effects', icon: Volume2 },
    { key: 'vibration' as const, label: 'Vibration', icon: Vibrate },
    { key: 'darkMode' as const, label: 'Dark Mode', icon: Moon },
  ]

  return (
    <ScreenShell title="Settings" icon={<SettingsIcon size={18} className="text-brand-400" />} onBack={onBack}>
      <div className="space-y-2">
        {settings.map(s => {
          const Icon = s.icon
          return (
            <button key={s.key} onClick={() => toggle(s.key)}
              className="w-full flex items-center gap-3 bg-ink-900 border border-ink-800 rounded-xl p-3 hover:bg-ink-800/50 transition active:scale-[0.98]">
              <div className="w-9 h-9 rounded-xl bg-ink-800 flex items-center justify-center">
                <Icon size={18} className="text-ink-300" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-ink-100">{s.label}</span>
              <div className={`w-11 h-6 rounded-full transition relative ${toggles[s.key] ? 'bg-brand-500' : 'bg-ink-700'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${toggles[s.key] ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </button>
          )
        })}

        <div className="pt-4">
          <button onClick={async () => { await signOut(); onToast('info', 'Signed out') }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-error-500/10 border border-error-500/30 text-error-400 rounded-xl font-semibold text-sm transition hover:bg-error-500/20 active:scale-95">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}
