import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AuthPage } from './pages/AuthPage'
import { AppShell } from './components/AppShell'
import { MapPage } from './pages/MapPage'
import { AdventuresPage } from './pages/AdventuresPage'
import { ChallengesPage } from './pages/ChallengesPage'
import { InventoryPage } from './pages/InventoryPage'
import { ProfilePage } from './pages/ProfilePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { FriendsPage } from './pages/FriendsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SettingsPage } from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading Nuvra...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default function App() {
  const { initialize, session, loading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading Nuvra...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={session ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<MapPage />} />
        <Route path="/adventures" element={<AdventuresPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
