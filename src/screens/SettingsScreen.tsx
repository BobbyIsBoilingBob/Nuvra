import { useState } from 'react'
import { Settings, Bell, MapPin, Compass, User, LogOut, ChevronRight, Moon, Globe, Shield, CircleHelp as HelpCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useToasts, ToastContainer } from '@/components/Toast'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'

interface Props { onNavigate: (s: string) => void }

export default function SettingsScreen({ onNavigate }: Props) {
  const { signOut, profile } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [highAccuracy, setHighAccuracy] = useState(true)
  const [compassMode, setCompassMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const toggle = (key: string, val: boolean, set: (v: boolean) => void) => { set(!val); push('info', `${key} ${!val ? 'on' : 'off'}`) }

  return (
    <>
      <ScreenShell title="Settings" subtitle="Customize your experience" onBack={() => onNavigate('profile')}>
        <div className="space-y-5">
          <div className="bg-white border border-surface-200 rounded-2xl p-4 flex items-center gap-3 shadow-card">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: profile?.avatar_color || '#10b981' }}>{profile?.username?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="flex-1"><p className="text-sm font-bold text-ink-900">{profile?.username || 'Adventurer'}</p><p className="text-xs text-ink-400">Level {profile?.level || 1} · {profile?.xp.toLocaleString() || 0} XP</p></div>
            <button onClick={() => onNavigate('avatar')} className="px-3 py-2 bg-brand-50 border border-brand-200 text-brand-600 rounded-xl text-xs font-bold btn-press hover:bg-brand-100 transition">Edit</button>
          </div>

          <div>
            <h3 className="section-label">Preferences</h3>
            <div className="bg-white border border-surface-200 rounded-2xl divide-y divide-surface-200 shadow-card overflow-hidden">
              <ToggleRow icon={<Bell size={18} />} label="Notifications" desc="Adventure reminders and alerts" value={notifications} onChange={() => toggle('Notifications', notifications, setNotifications)} />
              <ToggleRow icon={<MapPin size={18} />} label="High Accuracy GPS" desc="More precise location tracking" value={highAccuracy} onChange={() => toggle('High Accuracy GPS', highAccuracy, setHighAccuracy)} />
              <ToggleRow icon={<Compass size={18} />} label="Compass Mode" desc="Show compass on map screen" value={compassMode} onChange={() => toggle('Compass Mode', compassMode, setCompassMode)} />
              <ToggleRow icon={<Moon size={18} />} label="Dark Mode" desc="Reduce brightness at night" value={darkMode} onChange={() => toggle('Dark Mode', darkMode, setDarkMode)} />
            </div>
          </div>

          <div>
            <h3 className="section-label">About</h3>
            <div className="bg-white border border-surface-200 rounded-2xl divide-y divide-surface-200 shadow-card overflow-hidden">
              <LinkRow icon={<Globe size={18} />} label="Language" value="English" onClick={() => push('info', 'Language settings coming soon')} />
              <LinkRow icon={<Shield size={18} />} label="Privacy" value="Manage" onClick={() => push('info', 'Privacy settings coming soon')} />
              <LinkRow icon={<HelpCircle size={18} />} label="Help & Support" value="FAQ" onClick={() => push('info', 'Help center coming soon')} />
            </div>
          </div>

          <button onClick={() => signOut()} className="w-full py-3.5 bg-error-50 border border-error-300 text-error-600 rounded-xl font-bold text-sm btn-press hover:bg-error-100 transition flex items-center justify-center gap-2">
            <LogOut size={18} /> Sign Out
          </button>

          <p className="text-center text-xs text-ink-400 pt-2">Zeviqo v1.0.0 · Adventure Awaits</p>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

function ToggleRow({ icon, label, desc, value, onChange }: { icon: React.ReactNode; label: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center text-ink-500">{icon}</div>
      <div className="flex-1"><p className="text-sm font-semibold text-ink-900">{label}</p><p className="text-xs text-ink-400">{desc}</p></div>
      <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition ${value ? 'bg-brand-500' : 'bg-surface-300'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function LinkRow({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4 hover:bg-surface-50 transition text-left">
      <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center text-ink-500">{icon}</div>
      <div className="flex-1"><p className="text-sm font-semibold text-ink-900">{label}</p></div>
      <span className="text-xs text-ink-400">{value}</span>
      <ChevronRight size={16} className="text-ink-400" />
    </button>
  )
}
