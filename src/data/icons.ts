import {
  Home, User, Users, Globe, PartyPopper, Trophy, Swords, ScrollText,
  History, Gift, Backpack, Palette, Leaf, ShoppingBag, Settings as SettingsIcon,
  PenTool, Bot, Map, Bell, Compass, Camera, Eye, Dumbbell, Puzzle, Brain,
  Navigation, Landmark, Flower2, Package, HelpCircle, Clock, UserPlus,
  Search, Check, X, Plus, ArrowLeft, ArrowRight, ChevronRight, Star,
  Flame, Zap, Gem, Crown, Medal, Target, Footprints, Mountain, Sparkles,
  Coins, Award, TrendingUp, MapPin, Clock3, Route, Flag, CircleCheck,
  TriangleAlert, Info, ShieldCheck, LogOut, Mail, Lock, UserCircle2,
  type LucideIcon,
} from 'lucide-react'
import type { ScreenName, ChallengeCategory, Difficulty } from '@/types/adventure'

export const screenIcons: Record<string, LucideIcon> = {
  home: Home, profile: User, community: Globe, friends: Users, party: PartyPopper,
  leaderboard: Trophy, challenges: Swords, quests: ScrollText, history: History,
  rewards: Gift, inventory: Backpack, avatar: Palette, seasonal: Leaf,
  shop: ShoppingBag, settings: SettingsIcon, creator: PenTool, generator: Bot,
  preview: Map, map: Map, notifications: Bell, login: LogOut, signup: UserPlus,
}

export const categoryIcons: Record<ChallengeCategory, LucideIcon> = {
  observation: Eye, photography: Camera, fitness: Dumbbell, puzzle: Puzzle, memory: Brain,
  navigation: Navigation, compass: Compass, landmarks: Landmark, nature: Flower2,
  collection: Package, trivia: HelpCircle, timed: Clock, team: Users,
  exploration: Route, balance: ShieldCheck, reaction: Zap,
}

export const difficultyIcons: Record<Difficulty, LucideIcon> = {
  easy: CircleCheck, medium: Star, hard: Flame, extreme: Crown,
}

export const achievementIcons: Record<string, LucideIcon> = {
  target: Target, footprints: Footprints, map: Map, trophy: Trophy,
  mountain: Mountain, medal: Medal, sword: Swords, star: Star,
  crown: Crown, flame: Flame, zap: Zap, gem: Gem,
}

export const uiIcons = {
  Home, User, Users, Globe, PartyPopper, Trophy, Swords, ScrollText,
  History, Gift, Backpack, Palette, Leaf, ShoppingBag, SettingsIcon,
  PenTool, Bot, Map, Bell, Compass, Camera, Eye, Dumbbell, Puzzle, Brain,
  Navigation, Landmark, Flower2, Package, HelpCircle, Clock, UserPlus,
  Search, Check, X, Plus, ArrowLeft, ArrowRight, ChevronRight, Star,
  Flame, Zap, Gem, Crown, Medal, Target, Footprints, Mountain, Sparkles,
  Coins, Award, TrendingUp, MapPin, Clock3, Route, Flag, CircleCheck,
  TriangleAlert, Info, ShieldCheck, LogOut, Mail, Lock, UserCircle2,
}
