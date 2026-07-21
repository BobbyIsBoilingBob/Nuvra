import { useCallback, useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import ToastContainer, { type ToastData } from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Adventure, ScreenName } from '@/types/adventure'
import { getNotifications } from '@/lib/db'

import LoginScreen from '@/screens/LoginScreen'
import SignupScreen from '@/screens/SignupScreen'
import HomeScreen from '@/screens/HomeScreen'
import AIGeneratorScreen from '@/screens/AIGeneratorScreen'
import PreviewScreen from '@/screens/PreviewScreen'
import MapScreen from '@/screens/MapScreen'
import ProfileScreen from '@/screens/ProfileScreen'
import CommunityScreen from '@/screens/CommunityScreen'
import FriendsScreen from '@/screens/FriendsScreen'
import PartyScreen from '@/screens/PartyScreen'
import LeaderboardScreen from '@/screens/LeaderboardScreen'
import ChallengesScreen from '@/screens/ChallengesScreen'
import QuestsScreen from '@/screens/QuestsScreen'
import HistoryScreen from '@/screens/HistoryScreen'
import RewardsScreen from '@/screens/RewardsScreen'
import InventoryScreen from '@/screens/InventoryScreen'
import AvatarScreen from '@/screens/AvatarScreen'
import SeasonalScreen from '@/screens/SeasonalScreen'
import ShopScreen from '@/screens/ShopScreen'
import SettingsScreen from '@/screens/SettingsScreen'
import CreatorScreen from '@/screens/CreatorScreen'
import NotificationsScreen from '@/screens/NotificationsScreen'

function AppInner() {
  const { session, loading } = useAuth()
  const [screen, setScreen] = useState<ScreenName>('home')
  const [previewAdventure, setPreviewAdventure] = useState<Adventure | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addToast = useCallback((type: ToastData['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, title, message }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const navigate = (s: ScreenName) => setScreen(s)
  const goHome = () => setScreen('home')

  const handlePreview = (a: Adventure) => { setPreviewAdventure(a); setScreen('preview') }
  const handleStartAdventure = () => { if (previewAdventure) setScreen('map') }

  useEffect(() => {
    if (session) {
      getNotifications().then(n => setUnreadCount(n.filter(x => !x.read).length))
    }
  }, [session, screen])

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Zeviqo..." />
      </div>
    )
  }

  if (!session) {
    return (
      <>
        {screen === 'signup' ? (
          <SignupScreen onNavigate={navigate} onToast={addToast} />
        ) : (
          <LoginScreen onNavigate={navigate} onToast={addToast} />
        )}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    )
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen profile={null} unreadNotifications={unreadCount} onNavigate={navigate} />
      case 'generator': return <AIGeneratorScreen onBack={goHome} onPreview={handlePreview} onToast={addToast} />
      case 'preview': return previewAdventure ? <PreviewScreen adventure={previewAdventure} onBack={goHome} onStart={handleStartAdventure} onToast={addToast} /> : <HomeScreen profile={null} unreadNotifications={unreadCount} onNavigate={navigate} />
      case 'map': return previewAdventure ? <MapScreen adventure={previewAdventure} onBack={() => setScreen('preview')} onComplete={goHome} onToast={addToast} /> : <HomeScreen profile={null} unreadNotifications={unreadCount} onNavigate={navigate} />
      case 'profile': return <ProfileScreen onBack={goHome} onNavigate={navigate} onToast={addToast} />
      case 'community': return <CommunityScreen onBack={goHome} />
      case 'friends': return <FriendsScreen onBack={goHome} onToast={addToast} />
      case 'party': return <PartyScreen onBack={goHome} onToast={addToast} />
      case 'leaderboard': return <LeaderboardScreen onBack={goHome} />
      case 'challenges': return <ChallengesScreen onBack={goHome} />
      case 'quests': return <QuestsScreen onBack={goHome} onToast={addToast} />
      case 'history': return <HistoryScreen onBack={goHome} />
      case 'rewards': return <RewardsScreen onBack={goHome} onToast={addToast} />
      case 'inventory': return <InventoryScreen onBack={goHome} />
      case 'avatar': return <AvatarScreen onBack={goHome} onToast={addToast} />
      case 'seasonal': return <SeasonalScreen onBack={goHome} />
      case 'shop': return <ShopScreen onBack={goHome} onToast={addToast} />
      case 'settings': return <SettingsScreen onBack={goHome} onToast={addToast} />
      case 'creator': return <CreatorScreen onBack={goHome} onToast={addToast} />
      case 'notifications': return <NotificationsScreen onBack={goHome} />
      default: return <HomeScreen profile={null} unreadNotifications={unreadCount} onNavigate={navigate} />
    }
  }

  return (
    <>
      {renderScreen()}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
