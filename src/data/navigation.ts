import type { ScreenName } from '@/types/adventure'
import { screenIcons } from './icons'
import type { LucideIcon } from 'lucide-react'

interface NavItem { id: ScreenName; label: string; icon: LucideIcon; gradient: string }

export const NAV_ITEMS: NavItem[] = [
  { id: 'generator', label: 'AI Generator', icon: screenIcons.generator, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'challenges', label: 'Challenges', icon: screenIcons.challenges, gradient: 'from-amber-500 to-orange-600' },
  { id: 'quests', label: 'Quests', icon: screenIcons.quests, gradient: 'from-sky-500 to-blue-600' },
  { id: 'leaderboard', label: 'Leaderboard', icon: screenIcons.leaderboard, gradient: 'from-yellow-500 to-amber-600' },
  { id: 'community', label: 'Community', icon: screenIcons.community, gradient: 'from-cyan-500 to-teal-600' },
  { id: 'friends', label: 'Friends', icon: screenIcons.friends, gradient: 'from-teal-500 to-emerald-600' },
  { id: 'party', label: 'Party', icon: screenIcons.party, gradient: 'from-pink-500 to-rose-600' },
  { id: 'profile', label: 'Profile', icon: screenIcons.profile, gradient: 'from-emerald-500 to-green-600' },
  { id: 'avatar', label: 'Avatar', icon: screenIcons.avatar, gradient: 'from-rose-500 to-pink-600' },
  { id: 'history', label: 'History', icon: screenIcons.history, gradient: 'from-indigo-500 to-violet-600' },
  { id: 'rewards', label: 'Rewards', icon: screenIcons.rewards, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'inventory', label: 'Inventory', icon: screenIcons.inventory, gradient: 'from-lime-500 to-green-600' },
  { id: 'seasonal', label: 'Seasonal', icon: screenIcons.seasonal, gradient: 'from-orange-500 to-red-600' },
  { id: 'shop', label: 'Shop', icon: screenIcons.shop, gradient: 'from-red-500 to-rose-600' },
  { id: 'notifications', label: 'Alerts', icon: screenIcons.notifications, gradient: 'from-sky-500 to-cyan-600' },
  { id: 'settings', label: 'Settings', icon: screenIcons.settings, gradient: 'from-slate-500 to-slate-600' },
  { id: 'creator', label: 'Creator Studio', icon: screenIcons.creator, gradient: 'from-violet-500 to-purple-600' },
]
