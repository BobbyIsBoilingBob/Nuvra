import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useNotificationsStore } from '../stores/notificationsStore'
import { useEffect } from 'react'

const NAV_ITEMS = [
  { path: '/', label: 'Map', icon: '🗺️' },
  { path: '/adventures', label: 'Adventures', icon: '🧭' },
  { path: '/challenges', label: 'Challenges', icon: '🎯' },
  { path: '/inventory', label: 'Inventory', icon: '🎒' },
  { path: '/profile', label: 'Profile', icon: '👤' },
]

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuthStore()
  const { unreadCount, initialize } = useNotificationsStore()

  useEffect(() => { initialize() }, [initialize])

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-neutral-200 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 no-select">
            <span className="text-2xl">🧭</span>
            <span className="font-display font-extrabold text-lg text-neutral-900">Nuvra</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-accent-50 border border-accent-200 px-3 py-1.5">
              <span className="text-sm">🪙</span>
              <span className="text-sm font-semibold text-accent-700">{profile?.coins ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1.5">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-semibold text-primary-700">Lv {profile?.level ?? 1}</span>
            </div>
            <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors" aria-label="Notifications">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-40 bg-white/90 backdrop-blur-lg border-t border-neutral-200 safe-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive ? 'text-primary-600' : 'text-neutral-400'}`}>
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </button>
            )
          })}
          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-neutral-400 hover:text-neutral-600 transition-colors">
            <span className="text-xl">⋯</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
