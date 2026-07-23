import { useState, useCallback, memo } from 'react'
import { Settings, Bell, MapPin, Volume2, Moon, Globe, LogOut, ChevronRight, User, Shield, CircleHelp as HelpCircle } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { useAuth } from '@/lib/auth'
import type { ScreenName } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

interface ToggleProps { label: string; description: string; icon: typeof Bell; value: boolean; onChange: (v: boolean) => void }

const Toggle = memo(function Toggle({ label, description, icon: Icon, value, onChange }: ToggleProps) {
  return (
    <div className="card-premium p-3.5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-ink-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900">{label}</p>
        <p className="text-xs text-ink-400">{description}</p>
      </div>
      <button onClick={() => onChange(!value)} className={'relative w-11 h-6 rounded-full transition flex-shrink-0 ' + (value ? 'bg-brand-500' : 'bg-surface-300')}>
        <div className={'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ' + (value ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>
  )
})

function SettingsScreenInner({ onNavigate }: Props) {
  const { profile, signOut } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [notifications, setNotifications] = useState(true)
  const [location, setLocation] = useState(true)
  const [sound, setSound] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSignOut = useCallback(async () => {
    await signOut()
    push('info', 'Signed out', 'See you soon!')
    onNavigate('home')
  }, [signOut, push, onNavigate])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const linkItems: { label: string; icon: typeof User; screen: ScreenName }[] = [
    { label: 'Edit Profile', icon: User, screen: 'avatar' },
    { label: 'Privacy & Security', icon: Shield, screen: 'profile' },
    { label: 'Help & Support', icon: HelpCircle, screen: 'home' },
  ]

  return (
    <>
      <ScreenShell title="Settings" subtitle="App preferences" icon={<Settings size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-5">
          {/* Profile card */}
          <div className="card-premium p-4 flex items-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: profile?.avatar_color ?? '#10b981' }}>
              {(profile?.username ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-900">{profile?.username ?? 'Explorer'}</p>
              <p className="text-xs text-ink-400">Level {profile?.level ?? 1} - {profile?.xp ?? 0} XP</p>
            </div>
            <ChevronRight size={18} className="text-ink-400" />
          </div>

          {/* Toggles */}
          <div>
            <p className="section-label">Preferences</p>
            <div className="space-y-2">
              <Toggle label="Notifications" description="Adventure and reward alerts" icon={Bell} value={notifications} onChange={setNotifications} />
              <Toggle label="Location Services" description="GPS for adventures" icon={MapPin} value={location} onChange={setLocation} />
              <Toggle label="Sound Effects" description="Audio feedback" icon={Volume2} value={sound} onChange={setSound} />
              <Toggle label="Dark Mode" description="Easier on the eyes at night" icon={Moon} value={darkMode} onChange={setDarkMode} />
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="section-label">Account</p>
            <div className="space-y-2">
              {linkItems.map((item, i) => {
                const Icon = item.icon
                return (
                  <button key={i} onClick={() => onNavigate(item.screen)} className="w-full card-premium p-3.5 flex items-center gap-3 text-left hover:border-brand-400 transition btn-press animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-ink-600" />
                    </div>
                    <p className="flex-1 text-sm font-bold text-ink-900">{item.label}</p>
                    <ChevronRight size={18} className="text-ink-400" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Language */}
          <div className="card-premium p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
              <Globe size={18} className="text-ink-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-900">Language</p>
              <p className="text-xs text-ink-400">English</p>
            </div>
            <button onClick={() => push('info', 'Language', 'More languages coming soon')} className="text-xs font-bold text-brand-600">Change</button>
          </div>

          {/* Sign out */}
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-error-300 bg-error-50 text-error-600 text-sm font-bold btn-press hover:bg-error-100 transition">
            <LogOut size={16} /> Sign Out
          </button>

          <p className="text-center text-xs text-ink-400">Zeviqo v1.0.0</p>
        </div>
      </ScreenShell>
      <BottomNav active="settings" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const SettingsScreen = memo(SettingsScreenInner)
