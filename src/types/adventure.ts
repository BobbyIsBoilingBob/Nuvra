export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'

export type LocationSource = 'gps' | 'manual' | 'suggested'

export type ChallengeCategory =
  | 'observation' | 'photography' | 'fitness' | 'puzzle' | 'memory'
  | 'navigation' | 'compass' | 'landmarks' | 'nature' | 'collection'
  | 'trivia' | 'timed' | 'team' | 'exploration' | 'balance' | 'reaction'

export type SensorType = 'compass' | 'accelerometer' | 'gyroscope' | 'camera' | 'gps' | 'none'

export interface GeoPoint { lat: number; lng: number }

export interface Checkpoint {
  index: number
  position: GeoPoint
  label: string
  challenge?: ChallengeAssignment
}

export interface ChallengeAssignment {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  difficulty: Difficulty
  sensorType: SensorType
  sensorConfig?: Record<string, unknown>
  data?: Record<string, unknown>
  xp: number
  coins: number
}

export interface AdventureRoute {
  center: GeoPoint
  checkpoints: Checkpoint[]
  path: GeoPoint[]
  totalDistanceKm: number
  estimatedDurationMin: number
}

export interface AdventurePreferences {
  location?: string
  maxDistanceKm?: number
  minDistanceKm?: number
  approxDistanceKm?: number
  difficulty: Difficulty
  durationMin: number
  categories: ChallengeCategory[]
}

export interface Adventure {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  durationMin: number
  distanceKm: number
  locationName: string
  locationSource: LocationSource
  center: GeoPoint
  checkpoints: Checkpoint[]
  path: GeoPoint[]
  preferences: AdventurePreferences
  isSuggested?: boolean
  createdAt: string
}

export interface SuggestedAdventure {
  adventure: Adventure
  travelTimeMin: number
  travelDistanceKm: number
  isNearby: boolean
}

export interface SensorAvailability {
  compass: boolean
  accelerometer: boolean
  gyroscope: boolean
  camera: boolean
  gps: boolean
}

export interface GpsPosition {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

export type GpsStatus = 'idle' | 'locating' | 'located' | 'denied' | 'unavailable'

export type ScreenName =
  | 'home' | 'profile' | 'community' | 'friends' | 'party'
  | 'leaderboard' | 'challenges' | 'quests' | 'history' | 'rewards'
  | 'inventory' | 'avatar' | 'seasonal' | 'shop' | 'settings'
  | 'creator' | 'generator' | 'preview' | 'map'
