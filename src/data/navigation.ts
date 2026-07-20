import type { ScreenName } from '@/types/adventure'

interface NavItem {
  id: ScreenName
  label: string
  icon: string
  color: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'generator', label: 'AI Adventure Generator', icon: '🤖', color: 'from-brand-500 to-brand-700' },
  { id: 'challenges', label: 'Challenges', icon: '⚔️', color: 'from-accent-500 to-accent-700' },
  { id: 'quests', label: 'Quests', icon: '📜', color: 'from-blue-500 to-blue-700' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', color: 'from-yellow-500 to-yellow-700' },
  { id: 'community', label: 'Community', icon: '🌐', color: 'from-cyan-500 to-cyan-700' },
  { id: 'friends', label: 'Friends', icon: '👥', color: 'from-teal-500 to-teal-700' },
  { id: 'party', label: 'Party', icon: '🎉', color: 'from-pink-500 to-pink-700' },
  { id: 'profile', label: 'Profile', icon: '👤', color: 'from-purple-500 to-purple-700' },
  { id: 'avatar', label: 'Avatar / Customise', icon: '🎨', color: 'from-rose-500 to-rose-700' },
  { id: 'history', label: 'History', icon: '📊', color: 'from-indigo-500 to-indigo-700' },
  { id: 'rewards', label: 'Rewards', icon: '🎁', color: 'from-emerald-500 to-emerald-700' },
  { id: 'inventory', label: 'Inventory', icon: '🎒', color: 'from-lime-500 to-lime-700' },
  { id: 'seasonal', label: 'Seasonal', icon: '🍂', color: 'from-orange-500 to-orange-700' },
  { id: 'shop', label: 'Shop', icon: '🛒', color: 'from-red-500 to-red-700' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', color: 'from-sky-500 to-sky-700' },
  { id: 'settings', label: 'Settings', icon: '⚙️', color: 'from-gray-500 to-gray-700' },
  { id: 'creator', label: 'Creator Studio', icon: '✏️', color: 'from-violet-500 to-violet-700' },
]
