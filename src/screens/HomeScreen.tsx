import { Sparkles, Bell, ChevronRight } from 'lucide-react'
import { NAV_ITEMS } from '@/data/navigation'
import type { ScreenName, UserProfile } from '@/types/adventure'

interface Props {
  profile: UserProfile | null
  unreadNotifications: number
  onNavigate: (screen: ScreenName) => void
}

export default function HomeScreen({ profile, unreadNotifications, onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-20 bg-ink-900/90 backdrop-blur-md border-b border-ink-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-ink-100">Zeviqo</h1>
            <p className="text-xs text-ink-500">Adventure System</p>
          </div>
        </div>
        <button onClick={() => onNavigate('notifications')} className="relative p-2 text-ink-400 hover:text-ink-100 transition active:scale-95">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
          )}
        </button>
      </header>

      <main className="px-4 py-5 pb-24 max-w-md mx-auto">
        {profile && (
          <div className="bg-gradient-to-br from-brand-500/20 to-accent-500/10 border border-brand-500/30 rounded-2xl p-4 mb-5">
            <p className="text-sm text-ink-300">Welcome back,</p>
            <h2 className="text-xl font-bold text-ink-100">{profile.username}</h2>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="text-ink-300">Level <span className="text-brand-400 font-semibold">{profile.level}</span></span>
              <span className="text-ink-300">{profile.xp} XP</span>
              <span className="text-accent-400 font-semibold flex items-center gap-1">{profile.coins} coins</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className="group relative overflow-hidden rounded-2xl p-4 bg-ink-900 border border-ink-800 hover:border-ink-700 transition active:scale-95 text-left">
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${item.color}`} />
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} mb-2`}>
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
