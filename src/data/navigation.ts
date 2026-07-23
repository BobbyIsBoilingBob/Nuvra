import { Chrome as Home, Bot, User, Users, UserPlus, Trophy, Target, ScrollText, Gift, Backpack, ShoppingBag, Mountain, Brain, Camera, Compass, Footprints, CircleHelp as HelpCircle, Star, Zap, Feather } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ScreenName, ChallengeCategory, Difficulty } from '@/types/adventure'

interface NavItem { id: ScreenName; label: string; icon: LucideIcon; gradient: string }

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

export const categoryIcons: Record<ChallengeCategory, LucideIcon> = {
  trivia: Brain, photo: Camera, puzzle: Mountain, fitness: Footprints,
  exploration: Compass, riddle: HelpCircle, compass: Compass, speed: Zap,
}

export const difficultyIcons: Record<Difficulty, LucideIcon> = {
  easy: Feather, medium: Star, hard: Mountain, extreme: Zap,
}

export const achievementIcons: Record<string, LucideIcon> = {
  trophy: Trophy, star: Star, mountain: Mountain, compass: Compass,
  fire: Zap, footprints: Footprints, camera: Camera, brain: Brain,
}
