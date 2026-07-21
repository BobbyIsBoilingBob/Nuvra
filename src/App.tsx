import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import type { ScreenName, Adventure } from '@/types/adventure'
import LoadingSpinner from '@/components/LoadingSpinner'
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

export default function App() {
  const { session, loading } = useAuth()
  const [screen, setScreen] = useState<ScreenName>('home')
  const [previewAdventure, setPreviewAdventure] = useState<Adventure | null>(null)
  const [activeAdventure, setActiveAdventure] = useState<Adventure | null>(null)

  const navigate = useCallback((s: string) => {
    setScreen(s as ScreenName)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace('#/', '')
      if (hash === 'signup' || hash === 'login') setScreen(hash as ScreenName)
    }
    handler()
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>

  if (!session) {
    return screen === 'signup' ? <SignupScreen onLogin={() => setScreen('login')} /> : <LoginScreen onSignup={() => setScreen('signup')} />
  }

  if (activeAdventure) return <MapScreen adventure={activeAdventure} onExit={() => { setActiveAdventure(null); setScreen('home') }} />
  if (previewAdventure) return <PreviewScreen adventure={previewAdventure} onStart={() => { setActiveAdventure(previewAdventure); setPreviewAdventure(null) }} onBack={() => setPreviewAdventure(null)} />

  switch (screen) {
    case 'home': return <HomeScreen onNavigate={navigate} />
    case 'generator': return <AIGeneratorScreen onPreview={setPreviewAdventure} />
    case 'creator': return <CreatorScreen onPreview={setPreviewAdventure} />
    case 'profile': return <ProfileScreen onNavigate={navigate} />
    case 'community': return <CommunityScreen />
    case 'friends': return <FriendsScreen />
    case 'party': return <PartyScreen />
    case 'leaderboard': return <LeaderboardScreen />
    case 'challenges': return <ChallengesScreen />
    case 'quests': return <QuestsScreen />
    case 'history': return <HistoryScreen onNavigate={navigate} />
    case 'rewards': return <RewardsScreen />
    case 'inventory': return <InventoryScreen />
    case 'avatar': return <AvatarScreen />
    case 'seasonal': return <SeasonalScreen />
    case 'shop': return <ShopScreen />
    case 'settings': return <SettingsScreen />
    case 'notifications': return <NotificationsScreen />
    default: return <HomeScreen onNavigate={navigate} />
  }
}
