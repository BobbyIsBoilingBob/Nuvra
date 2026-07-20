import { useState } from 'react'
import type { Adventure, ScreenName } from '@/types/adventure'
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

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home')
  const [adventure, setAdventure] = useState<Adventure | null>(null)

  const goHome = () => setScreen('home')

  const handlePreview = (adv: Adventure) => {
    setAdventure(adv)
    setScreen('preview')
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
          ? <MapScreen adventure={adventure} onBack={() => setScreen('preview')} onComplete={goHome} />
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

      default: return <HomeScreen onNavigate={setScreen} />
    }
  }

  return renderScreen()
}
