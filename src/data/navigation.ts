import type { ScreenName } from '@/types/adventure'
import { screenIcons } from './icons'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  id: ScreenName
  label: string
  icon: LucideIcon
  color: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'generator', label: 'AI Adventure Generator', icon: screenIcons.generator, color: 'from-brand-500 to-brand-700' },
  { id: 'challenges', label: 'Challenges', icon: screenIcons.challenges, color: 'from-accent-500 to-accent-700' },
  { id: 'quests', label: 'Quests', icon: screenIcons.quests, color: 'from-blue-500 to-blue-700' },
  { id: 'leaderboard', label: 'Leaderboard', icon: screenIcons.leaderboard, color: 'from-yellow-500 to-yellow-700' },
  { id: 'community', label: 'Community', icon: screenIcons.community, color: 'from-cyan-500 to-cyan-700' },
  { id: 'friends', label: 'Friends', icon: screenIcons.friends, color: 'from-teal-500 to-teal-700' },
  { id: 'party', label: 'Party', icon: screenIcons.party, color: 'from-pink-500 to-pink-700' },
  { id: 'profile', label: 'Profile', icon: screenIcons.profile, color: 'from-emerald-500 to-emerald-700' },
  { id: 'avatar', label: 'Avatar / Customise', icon: screenIcons.avatar, color: 'from-rose-500 to-rose-700' },
  { id: 'history', label: 'History', icon: screenIcons.history, color: 'from-indigo-500 to-indigo-700' },
  { id: 'rewards', label: 'Rewards', icon: screenIcons.rewards, color: 'from-emerald-500 to-emerald-700' },
  { id: 'inventory', label: 'Inventory', icon: screenIcons.inventory, color: 'from-lime-500 to-lime-700' },
  { id: 'seasonal', label: 'Seasonal', icon: screenIcons.seasonal, color: 'from-orange-500 to-orange-700' },
  { id: 'shop', label: 'Shop', icon: screenIcons.shop, color: 'from-red-500 to-red-700' },
  { id: 'notifications', label: 'Notifications', icon: screenIcons.notifications, color: 'from-sky-500 to-sky-700' },
  { id: 'settings', label: 'Settings', icon: screenIcons.settings, color: 'from-gray-500 to-gray-700' },
  { id: 'creator', label: 'Creator Studio', icon: screenIcons.creator, color: 'from-violet-500 to-violet-700' },
]
