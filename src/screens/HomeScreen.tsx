import { useEffect, useState } from 'react'
import { NAV_ITEMS } from '@/data/navigation'
import { useAuth } from '@/lib/auth'
import { getNotifications } from '@/lib/db'
import { levelFromXp } from '@/lib/geo'
import type { ScreenName } from '@/types/adventure'

interface Props {
  onNavigate: (screen: ScreenName) => void
}

export default function HomeScreen({ onNavigate }: Props) {
  const { profile } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getNotifications().then(notifs => {
      setUnreadCount(notifs.filter(n => !n.read).length)
    })
  }, [])

  const level = profile ? levelFromXp(profile.xp) : 1

  return (
    <div className="min-h-screen bg-ink-950 animate-fade-in">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{profile?.avatar_emoji ?? '🧭'}</span>
          <div>
            <h1 className="text-2xl font-bold text-ink-100">Zeviqo</h1>
            <p className="text-xs text-ink-400">Adventure System</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('notifications')}
          className="relative w-10 h-10 bg-ink-900 rounded-xl flex items-center justify-center text-xl active:scale-95 transition border border-ink-800"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="px-4 pb-24 max-w-md mx-auto">
        <div className="bg-gradient-to-br from-brand-500/20 to-brand-700/10 rounded-2xl p-5 border border-brand-500/20 mb-5">
          <h2 className="text-lg font-bold text-ink-100 mb-1">Welcome back, {profile?.username ?? 'Adventurer'}!</h2>
          <div className="flex gap-4 text-sm text-ink-400">
            <span>Level {level}</span>
            <span>{profile?.xp ?? 0} XP</span>
            <span>🪙 {profile?.coins ?? 0}</span>
            <span>💎 {profile?.gems ?? 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-left transition hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
