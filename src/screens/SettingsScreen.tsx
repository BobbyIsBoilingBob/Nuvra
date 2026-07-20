import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [notifications, setNotifications] = useState(true)
  const [gps, setGps] = useState(true)
  const [camera, setCamera] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  return (
    <ScreenShell title="Settings" icon="⚙️" onBack={onBack}>
      <div className="space-y-3">
        {[
          { label: 'Push Notifications', value: notifications, set: setNotifications },
          { label: 'GPS Tracking', value: gps, set: setGps },
          { label: 'Camera Access', value: camera, set: setCamera },
          { label: 'Dark Mode', value: darkMode, set: setDarkMode },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between bg-ink-900 rounded-xl p-4 border border-ink-800">
            <span className="text-sm text-ink-200">{s.label}</span>
            <button
              onClick={() => s.set(!s.value)}
              className={`w-12 h-6 rounded-full transition relative ${s.value ? 'bg-brand-500' : 'bg-ink-700'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${s.value ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
          <h3 className="text-sm font-semibold text-ink-200 mb-2">About</h3>
          <p className="text-xs text-ink-500">Zeviqo Adventure System v1.0.0</p>
          <p className="text-xs text-ink-500 mt-1">Procedural adventure generator with 71 challenge templates across 16 categories.</p>
        </div>
      </div>
    </ScreenShell>
  )
}
