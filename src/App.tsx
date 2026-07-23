import { lazy, Suspense, useState, useCallback, useEffect, type ComponentType } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import { SkeletonList } from '@/components/Skeleton'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { prefetchData } from '@/lib/cache'
import { getNotifications, getDailyReward, getAchievements, getAdventureHistory } from '@/lib/db'
import type { ScreenName, Adventure } from '@/types/adventure'

const LoginScreen = lazy(() => import('@/screens/LoginScreen').then(m => ({ default: m.LoginScreen })))
const SignupScreen = lazy(() => import('@/screens/SignupScreen').then(m => ({ default: m.SignupScreen })))
const HomeScreen = lazy(() => import('@/screens/HomeScreen').then(m => ({ default: m.HomeScreen })))
const AIGeneratorScreen = lazy(() => import('@/screens/AIGeneratorScreen').then(m => ({ default: m.AIGeneratorScreen })))
const PreviewScreen = lazy(() => import('@/screens/PreviewScreen').then(m => ({ default: m.PreviewScreen })))
const MapScreen = lazy(() => import('@/screens/MapScreen').then(m => ({ default: m.MapScreen })))
const ProfileScreen = lazy(() => import('@/screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })))
const CommunityScreen = lazy(() => import('@/screens/CommunityScreen').then(m => ({ default: m.CommunityScreen })))
const FriendsScreen = lazy(() => import('@/screens/FriendsScreen').then(m => ({ default: m.FriendsScreen })))
const PartyScreen = lazy(() => import('@/screens/PartyScreen').then(m => ({ default: m.PartyScreen })))
const LeaderboardScreen = lazy(() => import('@/screens/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })))
const ChallengesScreen = lazy(() => import('@/screens/ChallengesScreen').then(m => ({ default: m.ChallengesScreen })))
const QuestsScreen = lazy(() => import('@/screens/QuestsScreen').then(m => ({ default: m.QuestsScreen })))
const HistoryScreen = lazy(() => import('@/screens/HistoryScreen').then(m => ({ default: m.HistoryScreen })))
const RewardsScreen = lazy(() => import('@/screens/RewardsScreen').then(m => ({ default: m.RewardsScreen })))
const InventoryScreen = lazy(() => import('@/screens/InventoryScreen').then(m => ({ default: m.InventoryScreen })))
const AvatarScreen = lazy(() => import('@/screens/AvatarScreen').then(m => ({ default: m.AvatarScreen })))
const SeasonalScreen = lazy(() => import('@/screens/SeasonalScreen').then(m => ({ default: m.SeasonalScreen })))
const ShopScreen = lazy(() => import('@/screens/ShopScreen').then(m => ({ default: m.ShopScreen })))
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })))
const CreatorScreen = lazy(() => import('@/screens/CreatorScreen').then(m => ({ default: m.CreatorScreen })))
const NotificationsScreen = lazy(() => import('@/screens/NotificationsScreen').then(m => ({ default: m.NotificationsScreen })))

type AppScreen = ScreenName | 'login' | 'signup' | 'preview' | 'map'

interface NavProps { onNavigate: (s: ScreenName) => void }
interface PreviewProps { adventure: Adventure; onNavigate: (s: ScreenName) => void; onStart: (adv: Adventure) => void; onBack: () => void }
interface MapProps { adventure: Adventure; onNavigate: (s: ScreenName) => void; onComplete: () => void }
interface GeneratorProps { onNavigate: (s: ScreenName) => void; onPreview: (adv: Adventure) => void }

const screenFallback = <SkeletonList />

function prefetchAdjacent(screen: AppScreen) {
  switch (screen) {
    case 'home':
      prefetchData('notifications', getNotifications)
      prefetchData('daily-reward', getDailyReward)
      break
    case 'profile':
      prefetchData('achievements', getAchievements)
      prefetchData('adventure-history', getAdventureHistory)
      break
    case 'history':
      prefetchData('adventure-history', getAdventureHistory)
      break
    case 'rewards':
      prefetchData('daily-reward', getDailyReward)
      break
  }
}

function AppRouter() {
  const { profile, loading } = useAuth()
  const [screen, setScreen] = useState<AppScreen>('home')
  const [pendingAdventure, setPendingAdventure] = useState<Adventure | null>(null)
  const [activeAdventure, setActiveAdventure] = useState<Adventure | null>(null)

  useEffect(() => { prefetchAdjacent(screen) }, [screen])

  const navigate = useCallback((s: ScreenName) => {
    setScreen(s)
    prefetchAdjacent(s)
  }, [])

  const handlePreview = useCallback((adv: Adventure) => {
    setPendingAdventure(adv)
    setScreen('preview')
  }, [])

  const handleStartAdventure = useCallback((adv: Adventure) => {
    setActiveAdventure(adv)
    setScreen('map')
  }, [])

  const handleAdventureComplete = useCallback(() => {
    setActiveAdventure(null)
    setScreen('home')
  }, [])

  const handleBackFromPreview = useCallback(() => {
    setPendingAdventure(null)
    setScreen('generator')
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile && screen !== 'login' && screen !== 'signup') {
    return (
      <Suspense fallback={screenFallback}>
        <LoginScreen onNavigate={() => setScreen('home')} />
      </Suspense>
    )
  }

  switch (screen) {
    case 'login':
      return (
        <Suspense fallback={screenFallback}>
          <LoginScreen onNavigate={() => setScreen('home')} />
        </Suspense>
      )
    case 'signup':
      return (
        <Suspense fallback={screenFallback}>
          <SignupScreen onNavigate={() => setScreen('home')} />
        </Suspense>
      )
    case 'preview':
      if (!pendingAdventure) { setScreen('home'); return null }
      return (
        <Suspense fallback={screenFallback}>
          <PreviewScreen adventure={pendingAdventure} onNavigate={navigate} onStart={handleStartAdventure} onBack={handleBackFromPreview} />
        </Suspense>
      )
    case 'map':
      if (!activeAdventure) { setScreen('home'); return null }
      return (
        <Suspense fallback={screenFallback}>
          <MapScreen adventure={activeAdventure} onNavigate={navigate} onComplete={handleAdventureComplete} />
        </Suspense>
      )
    case 'home':
      return (
        <Suspense fallback={screenFallback}>
          <HomeScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'generator':
      return (
        <Suspense fallback={screenFallback}>
          <AIGeneratorScreen onNavigate={navigate} onPreview={handlePreview} />
        </Suspense>
      )
    case 'creator':
      return (
        <Suspense fallback={screenFallback}>
          <CreatorScreen onNavigate={navigate} onPreview={handlePreview} />
        </Suspense>
      )
    case 'profile':
      return (
        <Suspense fallback={screenFallback}>
          <ProfileScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'community':
      return (
        <Suspense fallback={screenFallback}>
          <CommunityScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'friends':
      return (
        <Suspense fallback={screenFallback}>
          <FriendsScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'party':
      return (
        <Suspense fallback={screenFallback}>
          <PartyScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'leaderboard':
      return (
        <Suspense fallback={screenFallback}>
          <LeaderboardScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'challenges':
      return (
        <Suspense fallback={screenFallback}>
          <ChallengesScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'quests':
      return (
        <Suspense fallback={screenFallback}>
          <QuestsScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'history':
      return (
        <Suspense fallback={screenFallback}>
          <HistoryScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'rewards':
      return (
        <Suspense fallback={screenFallback}>
          <RewardsScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'inventory':
      return (
        <Suspense fallback={screenFallback}>
          <InventoryScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'avatar':
      return (
        <Suspense fallback={screenFallback}>
          <AvatarScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'seasonal':
      return (
        <Suspense fallback={screenFallback}>
          <SeasonalScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'shop':
      return (
        <Suspense fallback={screenFallback}>
          <ShopScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'settings':
      return (
        <Suspense fallback={screenFallback}>
          <SettingsScreen onNavigate={navigate} />
        </Suspense>
      )
    case 'notifications':
      return (
        <Suspense fallback={screenFallback}>
          <NotificationsScreen onNavigate={navigate} />
        </Suspense>
      )
    default:
      return (
        <Suspense fallback={screenFallback}>
          <HomeScreen onNavigate={navigate} />
        </Suspense>
      )
  }
}

export default function App() {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto min-h-screen bg-surface-50 shadow-xl">
        <AppRouter />
      </div>
    </AuthProvider>
  )
}
