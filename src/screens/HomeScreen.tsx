import { Sparkles, Bell, ChevronRight } from 'lucide-react'
import { NAV_ITEMS } from '@/data/navigation'
import { useAuth } from '@/lib/auth'
import { xpProgressInLevel } from '@/lib/geo'
import type { ScreenName } from '@/types/adventure'

interface Props {
  unreadNotifications: number
  onNavigate: (screen: ScreenName) => void
}

export default function HomeScreen({ unreadNotifications, onNavigate }: Props) {
  const { profile } = useAuth()
  const xpInfo = profile ? xpProgressInLevel(profile.xp) : null

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-30 bg-ink-900/95 backdrop-blur-lg border-b border-ink-800/80 safe-top">
        <div className="px-4 py-3 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Sparkles size={20} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-ink-100 leading-tight">Zeviqo</h1>
              <p className="text-xs text-ink-500 leading-tight">Adventure System</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('notifications')}
            className="relative p-2.5 text-ink-400 hover:text-ink-100 transition active:scale-90 rounded-xl hover:bg-ink-800"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error-500 rounded-full border-2 border-ink-900" />
            )}
          </button>
        </div>
      </header>

      <main className="px-4 py-5 pb-24 max-w-md mx-auto">
        {profile && (
          <div className="bg-gradient-to-br from-brand-500/15 via-brand-600/10 to-accent-500/10 border border-brand-500/25 rounded-2xl p-4 mb-5">
            <p className="text-xs text-ink-400">Welcome back,</p>
            <h2 className="text-xl font-bold text-ink-100 mt-0.5">{profile.username}</h2>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-ink-500">Lvl</span>
                <span className="text-lg font-bold text-brand-400">{profile.level}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-ink-500 mb-1">
                  <span>{xpInfo?.current ?? 0} XP</span>
                  <span>{xpInfo?.needed ?? 0} XP</span>
                </div>
                <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${xpInfo?.percent ?? 0}%` }} />
                </div>
              </div>
              <span className="text-sm text-accent-400 font-semibold">{profile.coins}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group relative overflow-hidden rounded-2xl p-4 bg-ink-900 border border-ink-800 hover:border-ink-700 transition active:scale-95 text-left"
              >
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${item.color}`} />
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} mb-2.5 shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink-100 flex items-center justify-between">
                    {item.label}
                    <ChevronRight size={14} className="text-ink-600 group-hover:text-ink-400 transition" />
                  </h3>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
