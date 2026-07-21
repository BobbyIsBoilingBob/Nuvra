import type { ScreenName } from '@/types/adventure'
import { screenIcons } from './icons'
import type { LucideIcon } from 'lucide-react'

interface NavItem { id: ScreenName; label: string; icon: LucideIcon; gradient: string; description: string }

export const NAV_ITEMS: NavItem[] = [
  { id: 'generator', label: 'AI Generator', icon: screenIcons.generator, gradient: 'from-emerald-500 to-teal-600', description: 'Create adventures' },
  { id: 'challenges', label: 'Challenges', icon: screenIcons.challenges, gradient: 'from-amber-500 to-orange-600', description: 'Browse 71 challenges' },
  { id: 'quests', label: 'Quests', icon: screenIcons.quests, gradient: 'from-sky-500 to-blue-600', description: 'Daily missions' },
  { id: 'leaderboard', label: 'Leaderboard', icon: screenIcons.leaderboard, gradient: 'from-yellow-500 to-amber-600', description: 'Top adventurers' },
  { id: 'community', label: 'Community', icon: screenIcons.community, gradient: 'from-cyan-500 to-teal-600', description: 'Activity feed' },
  { id: 'friends', label: 'Friends', icon: screenIcons.friends, gradient: 'from-teal-500 to-emerald-600', description: 'Connect' },
  { id: 'party', label: 'Party', icon: screenIcons.party, gradient: 'from-pink-500 to-rose-600', description: 'Adventure together' },
  { id: 'profile', label: 'Profile', icon: screenIcons.profile, gradient: 'from-emerald-500 to-green-600', description: 'Your stats' },
  { id: 'avatar', label: 'Avatar', icon: screenIcons.avatar, gradient: 'from-rose-500 to-pink-600', description: 'Customize' },
  { id: 'history', label: 'History', icon: screenIcons.history, gradient: 'from-indigo-500 to-violet-600', description: 'Past adventures' },
  { id: 'rewards', label: 'Rewards', icon: screenIcons.rewards, gradient: 'from-emerald-500 to-teal-600', description: 'Daily bonuses' },
  { id: 'inventory', label: 'Inventory', icon: screenIcons.inventory, gradient: 'from-lime-500 to-green-600', description: 'Your items' },
  { id: 'seasonal', label: 'Seasonal', icon: screenIcons.seasonal, gradient: 'from-orange-500 to-red-600', description: 'Season events' },
  { id: 'shop', label: 'Shop', icon: screenIcons.shop, gradient: 'from-red-500 to-rose-600', description: 'Spend coins' },
  { id: 'notifications', label: 'Alerts', icon: screenIcons.notifications, gradient: 'from-sky-500 to-cyan-600', description: 'Updates' },
  { id: 'settings', label: 'Settings', icon: screenIcons.settings, gradient: 'from-slate-500 to-slate-600', description: 'Preferences' },
  { id: 'creator', label: 'Creator Studio', icon: screenIcons.creator, gradient: 'from-violet-500 to-purple-600', description: 'Custom adventures' },
]
