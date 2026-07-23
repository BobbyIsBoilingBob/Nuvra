import { useState, useCallback } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
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
import type { Adventure, ScreenName } from '@/types/adventure'

function AppContent() {
  const { session, loading } = useAuth()
  const [screen, setScreen] = useState<ScreenName>('home')
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [previewAdventure, setPreviewAdventure] = useState<Adventure | null>(null)
  const [activeAdventure, setActiveAdventure] = useState<Adventure | null>(null)
  const navigate = useCallback((s: string) => setScreen(s as ScreenName), [])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface-0"><LoadingSpinner size="lg" /></div>
  if (!session) return authView === 'login' ? <LoginScreen onSignup={() => setAuthView('signup')} /> : <SignupScreen onLogin={() => setAuthView('login')} />
  if (activeAdventure) return <MapScreen adventure={activeAdventure} onExit={() => { setActiveAdventure(null); setScreen('home') }} />
  if (previewAdventure) return <PreviewScreen adventure={previewAdventure} onStart={() => setActiveAdventure(previewAdventure)} onBack={() => { setPreviewAdventure(null); setScreen('generator') }} />

  switch (screen) {
    case 'home': return <HomeScreen onNavigate={navigate} />
    case 'generator': return <AIGeneratorScreen onPreview={(a) => setPreviewAdventure(a)} onNavigate={navigate} />
    case 'profile': return <ProfileScreen onNavigate={navigate} />
    case 'community': return <CommunityScreen onNavigate={navigate} />
    case 'friends': return <FriendsScreen onNavigate={navigate} />
    case 'party': return <PartyScreen onNavigate={navigate} />
    case 'leaderboard': return <LeaderboardScreen onNavigate={navigate} />
    case 'challenges': return <ChallengesScreen onNavigate={navigate} />
    case 'quests': return <QuestsScreen onNavigate={navigate} />
    case 'history': return <HistoryScreen onNavigate={navigate} />
    case 'rewards': return <RewardsScreen onNavigate={navigate} />
    case 'inventory': return <InventoryScreen onNavigate={navigate} />
    case 'avatar': return <AvatarScreen onNavigate={navigate} />
    case 'seasonal': return <SeasonalScreen onNavigate={navigate} />
    case 'shop': return <ShopScreen onNavigate={navigate} />
    case 'settings': return <SettingsScreen onNavigate={navigate} />
    case 'creator': return <CreatorScreen onNavigate={navigate} />
    case 'notifications': return <NotificationsScreen onNavigate={navigate} />
    default: return <HomeScreen onNavigate={navigate} />
  }
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
