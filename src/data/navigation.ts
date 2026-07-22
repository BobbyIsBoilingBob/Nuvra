import { Chrome as Home, Bot, User, Users, UserPlus, Trophy, Target, ScrollText, Gift, Backpack, ShoppingBag, Mountain } from 'lucide-react'
import type { ScreenName } from '@/types/adventure'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  id: ScreenName; label: string; icon: LucideIcon; gradient: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'generator', label: 'AI Generator', icon: Bot, gradient: 'from-brand-500 to-brand-600' },
  { id: 'community', label: 'Community', icon: Users, gradient: 'from-accent-500 to-accent-600' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, gradient: 'from-ink-500 to-ink-600' },
  { id: 'challenges', label: 'Challenges', icon: Target, gradient: 'from-success-500 to-success-600' },
  { id: 'quests', label: 'Quests', icon: ScrollText, gradient: 'from-warning-500 to-warning-600' },
  { id: 'rewards', label: 'Rewards', icon: Gift, gradient: 'from-accent-500 to-accent-600' },
  { id: 'inventory', label: 'Inventory', icon: Backpack, gradient: 'from-brand-500 to-brand-600' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, gradient: 'from-accent-500 to-accent-600' },
]

export const BOTTOM_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, gradient: 'from-brand-500 to-brand-600' },
  { id: 'generator', label: 'Create', icon: Bot, gradient: 'from-brand-500 to-brand-600' },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy, gradient: 'from-ink-500 to-ink-600' },
  { id: 'friends', label: 'Friends', icon: UserPlus, gradient: 'from-accent-500 to-accent-600' },
  { id: 'profile', label: 'Profile', icon: User, gradient: 'from-ink-500 to-ink-600' },
]
