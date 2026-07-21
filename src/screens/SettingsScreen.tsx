import { useState } from 'react'
import { Settings as SettingsIcon, Bell, MapPin, Compass, Camera, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import ScreenShell from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`w-11 h-6 rounded-full transition-colors ${on ? 'bg-brand-500' : 'bg-surface-200'}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} /></button>
}

export default function SettingsScreen() {
  const { signOut } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [toggles, setToggles] = useState({ notifications: true, location: true, compass: true, camera: true })

  const toggle = (key: keyof typeof toggles) => setToggles(prev => ({ ...prev, [key]: !prev[key] }))

  const settings = [
    { key: 'notifications' as const, icon: Bell, label: 'Push Notifications', desc: 'Receive adventure alerts' },
    { key: 'location' as const, icon: MapPin, label: 'Location Services', desc: 'GPS for route tracking' },
    { key: 'compass' as const, icon: Compass, label: 'Compass Sensor', desc: 'Navigation challenges' },
    { key: 'camera' as const, icon: Camera, label: 'Camera Access', desc: 'Photo challenges' },
  ]

  return (
    <>
      <ScreenShell title="Settings" subtitle="App preferences">
        <div className="space-y-4">
          <div className="card-premium overflow-hidden">
            {settings.map((s, i) => (
              <div key={s.key} className={`flex items-center gap-3 p-4 ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-surface-200 flex items-center justify-center"><s.icon className="text-ink-400" size={16} /></div>
                <div className="flex-1"><p className="text-sm font-semibold text-ink-100">{s.label}</p><p className="text-xs text-ink-500">{s.desc}</p></div>
                <Toggle on={toggles[s.key]} onClick={() => toggle(s.key)} />
              </div>
            ))}
          </div>

          <div className="card-premium overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-white/[0.04]">
              <div className="w-9 h-9 rounded-lg bg-surface-200 flex items-center justify-center"><SettingsIcon className="text-ink-400" size={16} /></div>
              <div className="flex-1"><p className="text-sm font-semibold text-ink-100">About Zeviqo</p><p className="text-xs text-ink-500">Version 2.1.0</p></div>
              <ChevronRight size={16} className="text-ink-600" />
            </div>
          </div>

          <button onClick={() => signOut()} className="w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 btn-press">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center"><LogOut className="text-rose-400" size={16} /></div>
            <p className="text-sm font-bold text-rose-400">Sign Out</p>
          </button>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
