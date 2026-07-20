// ── Adventure System Types ──────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'

export type LocationSource = 'gps' | 'manual' | 'suggested'

export type ChallengeCategory =
  | 'observation'
  | 'photography'
  | 'fitness'
  | 'puzzle'
  | 'memory'
  | 'navigation'
  | 'compass'
  | 'landmarks'
  | 'nature'
  | 'collection'
  | 'trivia'
  | 'timed'
  | 'team'
  | 'exploration'
  | 'balance'
  | 'reaction'

export type SensorType =
  | 'compass'
  | 'accelerometer'
  | 'gyroscope'
  | 'geolocation'
  | 'camera'
  | 'none'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface Checkpoint {
  index: number
  position: GeoPoint
  label: string
  challenge: ChallengeAssignment
  isStart: boolean
  isFinish: boolean
}

export interface ChallengeAssignment {
  id: string
  category: ChallengeCategory
  title: string
  description: string
  difficulty: Difficulty
  sensorType: SensorType
  sensorConfig?: Record<string, unknown>
  data: Record<string, unknown>
  rewardXp: number
  rewardCoins: number
}

export interface AdventureRoute {
  geojson: GeoJSONLineString
  checkpoints: Checkpoint[]
  distanceKm: number
  durationMin: number
}

export interface GeoJSONLineString {
  type: 'LineString'
  coordinates: [number, number][] // [lng, lat]
}

export interface AdventurePreferences {
  location?: string
  maxDistanceKm?: number
  minDistanceKm?: number
  approxDistanceKm?: number
  difficulty: Difficulty
  durationMin: number
  challengeTypes: ChallengeCategory[]
}

export interface Adventure {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  locationName: string
  locationSource: LocationSource
  center: GeoPoint
  route: AdventureRoute
  preferences: AdventurePreferences
  rewardXp: number
  rewardCoins: number
  rewardItem?: string
  tags: string[]
  imageEmoji: string
  createdAt: string
  isSuggested: boolean
}

export interface SuggestedAdventure {
  id: string
  title: string
  emoji: string
  difficulty: Difficulty
  locationName: string
  distanceKm: number
  durationMin: number
  travelTimeMin: number
  category: string
  description: string
  center: GeoPoint
}

// ── Sensor Support ─────────────────────────────────────────────────────

export interface SensorAvailability {
  compass: boolean
  accelerometer: boolean
  gyroscope: boolean
  geolocation: boolean
  camera: boolean
}

export interface CompassReading {
  heading: number // degrees from north, 0-359
  accuracy: number
}

export interface AccelerometerReading {
  x: number
  y: number
  z: number
  tilt: number // degrees from vertical
}

// ── GPS ────────────────────────────────────────────────────────────────

export interface GpsPosition {
  lat: number
  lng: number
  accuracy: number
  heading: number | null
  speed: number | null
  timestamp: number
}

export type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'
