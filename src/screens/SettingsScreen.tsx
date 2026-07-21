import { useState, useEffect } from 'react'
import { Bell, MapPin, Compass, Camera, Smartphone, Moon, Globe, CircleHelp as HelpCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import ScreenShell from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`w-11 h-6 rounded-full transition relative ${on ? 'bg-gradient-to-r from-brand-500 to-brand-600' : 'bg-surface-300'}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></button>
}

export default function SettingsScreen() {
  const { signOut, profile } = useAuth()
  const [settings, setSettings] = useState({ notifications: true, gps: true, compass: true, camera: true, accelerometer: true, darkMode: true, metricUnits: true })
  const { toasts, push, dismiss } = useToasts()

  const toggle = (key: keyof typeof settings) => { setSettings(s => ({ ...s, [key]: !s[key] })); push('info', `${key} ${!settings[key] ? 'enabled' : 'disabled'}`) }

  const sections = [
    { title: 'Notifications', icon: Bell, items: [{ key: 'notifications' as const, label: 'Push Notifications', desc: 'Quests, rewards, friend activity' }] },
    { title: 'Sensors', icon: Smartphone, items: [
      { key: 'gps' as const, label: 'GPS Tracking', desc: 'Location for adventures', icon: MapPin },
      { key: 'compass' as const, label: 'Compass', desc: 'Navigation challenges', icon: Compass },
      { key: 'camera' as const, label: 'Camera', desc: 'Photo challenges', icon: Camera },
      { key: 'accelerometer' as const, label: 'Accelerometer', desc: 'Motion challenges', icon: Smartphone },
    ]},
    { title: 'Appearance', icon: Moon, items: [{ key: 'darkMode' as const, label: 'Dark Mode', desc: 'Easier on the eyes' }] },
    { title: 'General', icon: Globe, items: [{ key: 'metricUnits' as const, label: 'Metric Units', desc: 'Kilometers instead of miles' }] },
  ]

  return (
    <>
      <ScreenShell title="Settings" subtitle="App preferences">
        <div className="space-y-5">
          <div className="bg-surface-100 border border-white/[0.04] rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">{profile?.username.charAt(0).toUpperCase() ?? 'U'}</div>
            <div><p className="text-sm font-bold text-ink-100">{profile?.username}</p><p className="text-xs text-ink-500">Level {profile?.level}</p></div>
          </div>

          {sections.map((section, si) => {
            const SectionIcon = section.icon
            return (
              <div key={si} className="animate-slide-up" style={{ animationDelay: `${si * 50}ms` }}>
                <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><SectionIcon size={12} /> {section.title}</h3>
                <div className="bg-surface-100 border border-white/[0.04] rounded-2xl overflow-hidden">
                  {section.items.map((item, ii) => (
                    <div key={item.key} className={`p-4 flex items-center gap-3 ${ii < section.items.length - 1 ? 'border-b border-white/[0.03]' : ''}`}>
                      {'icon' in item && item.icon ? <item.icon size={18} className="text-ink-400" /> : null}
                      <div className="flex-1"><p className="text-sm font-semibold text-ink-100">{item.label}</p><p className="text-xs text-ink-500 mt-0.5">{item.desc}</p></div>
                      <Toggle on={settings[item.key]} onClick={() => toggle(item.key)} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="space-y-2">
            <button className="w-full bg-surface-100 border border-white/[0.04] rounded-xl p-4 flex items-center gap-3 btn-press"><HelpCircle size={18} className="text-ink-400" /><span className="text-sm font-semibold text-ink-200">Help & Support</span></button>
            <button onClick={signOut} className="w-full bg-error-500/10 border border-error-500/20 rounded-xl p-4 flex items-center gap-3 btn-press"><LogOut size={18} className="text-error-400" /><span className="text-sm font-semibold text-error-400">Sign Out</span></button>
          </div>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
