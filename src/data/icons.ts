import { Brain, Camera, Compass, Footprints, CircleHelp as HelpCircle, Mountain, Star, Trophy, Zap, Feather, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ChallengeCategory, Difficulty } from '@/types/adventure'

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

export { Users }
