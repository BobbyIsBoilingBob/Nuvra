import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import type { Adventure, ScreenName } from '@/types/adventure'
import LoadingSpinner from '@/components/LoadingSpinner'
import ToastContainer, { type ToastData } from '@/components/Toast'

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
import LoginScreen from '@/screens/LoginScreen'
import SignupScreen from '@/screens/SignupScreen'

function AppContent() {
  const { session, loading } = useAuth()
  const [screen, setScreen] = useState<ScreenName>('home')
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login')
  const [adventure, setAdventure] = useState<Adventure | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = (type: ToastData['type'], title: string, message?: string) => {
    setToasts(prev => [...prev, { id: `toast-${Date.now()}-${Math.random()}`, type, title, message }])
  }

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Zeviqo..." />
      </div>
    )
  }

  if (!session) {
    if (authScreen === 'signup') {
      return <SignupScreen onAuthed={() => setScreen('home')} onSwitchToLogin={() => setAuthScreen('login')} />
    }
    return <LoginScreen onAuthed={() => setScreen('home')} onSwitchToSignup={() => setAuthScreen('signup')} />
  }

  const goHome = () => setScreen('home')

  const handlePreview = (adv: Adventure) => {
    setAdventure(adv)
    setScreen('preview')
  }

  const handleAdventureComplete = () => {
    showToast('success', 'Adventure Complete!', 'Your stats have been saved.')
    goHome()
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onNavigate={setScreen} />

      case 'generator':
        return <AIGeneratorScreen onBack={goHome} onPreview={handlePreview} />

      case 'preview':
        return adventure
          ? <PreviewScreen adventure={adventure} onBack={() => setScreen('generator')} onStart={() => setScreen('map')} />
          : <AIGeneratorScreen onBack={goHome} onPreview={handlePreview} />

      case 'map':
        return adventure
          ? <MapScreen adventure={adventure} onBack={() => setScreen('preview')} onComplete={handleAdventureComplete} />
          : <AIGeneratorScreen onBack={goHome} onPreview={handlePreview} />

      case 'profile': return <ProfileScreen onBack={goHome} />
      case 'community': return <CommunityScreen onBack={goHome} />
      case 'friends': return <FriendsScreen onBack={goHome} />
      case 'party': return <PartyScreen onBack={goHome} />
      case 'leaderboard': return <LeaderboardScreen onBack={goHome} />
      case 'challenges': return <ChallengesScreen onBack={goHome} />
      case 'quests': return <QuestsScreen onBack={goHome} />
      case 'history': return <HistoryScreen onBack={goHome} />
      case 'rewards': return <RewardsScreen onBack={goHome} />
      case 'inventory': return <InventoryScreen onBack={goHome} />
      case 'avatar': return <AvatarScreen onBack={goHome} />
      case 'seasonal': return <SeasonalScreen onBack={goHome} />
      case 'shop': return <ShopScreen onBack={goHome} />
      case 'settings': return <SettingsScreen onBack={goHome} />
      case 'creator': return <CreatorScreen onBack={goHome} />
      case 'notifications': return <NotificationsScreen onBack={goHome} />

      default: return <HomeScreen onNavigate={setScreen} />
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
      <AppContent />
    </AuthProvider>
  )
}
