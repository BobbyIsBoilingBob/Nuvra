import type {
  Adventure,
  AdventurePreferences,
  AdventureRoute,
  ChallengeAssignment,
  Checkpoint,
  Difficulty,
  GeoPoint,
  LocationSource,
} from '@/types/adventure'
import {
  destinationPoint,
  distanceMeters,
  pathLengthMeters,
  bearingDeg,
  WALKING_SPEED_MPS,
} from './geo'
import { challengesForGeneration, type ChallengeTemplate } from '@/data/challenges'
import { detectSensors, isSensorAvailable } from './sensors'
import type { SensorAvailability } from '@/types/adventure'

// ── Adventure titles and descriptions ──────────────────────────────────

const TITLE_TEMPLATES = [
  'The {place} Expedition',
  '{place} Hidden Trail',
  'Mystery of {place}',
  '{place} Discovery Walk',
  'The {place} Quest',
  '{place} Adventure Loop',
  'Secrets of {place}',
  '{place} Explorer',
  'The {place} Challenge',
  '{place} Wander',
]

const DESC_TEMPLATES = [
  'A {difficulty} adventure weaving through {place}. Complete {count} challenges along the route.',
  'Explore {place} on this {difficulty} route with {count} challenges. {tag} meets exploration.',
  'A handcrafted {difficulty} journey through {place} with {count} checkpoints of discovery.',
  'Discover {place} through {count} {difficulty} challenges. Every step reveals something new.',
]

const TAG_WORDS = ['Nature', 'History', 'Mystery', 'Fitness', 'Photography', 'Puzzle', 'Navigation', 'Observation']
const EMOJIS = ['🧭', '🗺️', '🌲', '🏔️', '🌊', '🏛️', '🦜', '🌸', '🪨', '🌿', '🌅', '🚶', '📍', '🌟', '🍃']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function titleFor(place: string): string {
  const short = place.split(',')[0].trim() || 'the Area'
  return pick(TITLE_TEMPLATES).replace('{place}', short)
}

function descriptionFor(place: string, difficulty: Difficulty, count: number, tag: string): string {
  const short = place.split(',')[0].trim() || 'the area'
  return pick(DESC_TEMPLATES)
    .replace('{place}', short)
    .replace('{difficulty}', difficulty)
    .replace('{count}', String(count))
    .replace('{tag}', tag)
}

// ── Route generation ───────────────────────────────────────────────────

/**
 * Generate a walking route around a centre point.
 * Creates a loop or out-and-back with the requested approximate length.
 * No hard-coded cities — purely geometric from the given centre.
 */
export function generateRoute(
  center: GeoPoint,
  targetDistanceKm: number,
  numCheckpoints: number,
): { points: GeoPoint[]; checkpoints: GeoPoint[] } {
  const targetMeters = targetDistanceKm * 1000
  // Segment length between checkpoints
  const segLen = targetMeters / numCheckpoints

  // Generate a meandering path: start at center, head out, loop back
  const points: GeoPoint[] = [{ ...center }]
  const checkpoints: GeoPoint[] = [{ ...center }]

  // First half: head outward with varied bearings
  const half = Math.ceil(numCheckpoints / 2)
  let current = { ...center }
  let baseBearing = Math.floor(Math.random() * 360)

  for (let i = 0; i < half; i++) {
    // Vary bearing by ±35° for natural meandering
    const bearing = (baseBearing + (Math.random() - 0.5) * 70 + 360) % 360
    // Slightly vary segment length
    const len = segLen * (0.85 + Math.random() * 0.3)
    current = destinationPoint(current, bearing, len)
    points.push({ ...current })
    if (i < half) checkpoints.push({ ...current })
  }

  // Second half: curve back toward start to form a loop
  const returnBearing = (bearingDeg(current, center) + (Math.random() - 0.5) * 40 + 360) % 360
  let returnCurrent = { ...current }

  for (let i = half; i < numCheckpoints - 1; i++) {
    const toCenter = bearingDeg(returnCurrent, center)
    const bearing = (toCenter + (Math.random() - 0.5) * 50 + 360) % 360
    const len = segLen * (0.85 + Math.random() * 0.3)
    returnCurrent = destinationPoint(returnCurrent, bearing, len)
    points.push({ ...returnCurrent })
    checkpoints.push({ ...returnCurrent })
  }

  // Close the loop back to center
  points.push({ ...center })

  return { points, checkpoints }
}

// ── Challenge assignment ──────────────────────────────────────────────

function templateToAssignment(t: ChallengeTemplate): ChallengeAssignment {
  return {
    id: t.id,
    category: t.category,
    title: t.title,
    description: t.description,
    difficulty: t.difficulty,
    sensorType: t.sensorType,
    sensorConfig: t.sensorConfig,
    data: t.data,
    rewardXp: t.rewardXp,
    rewardCoins: t.rewardCoins,
  }
}

/** Shuffle array in place. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Assign challenges to checkpoints, avoiding repetition. */
function assignChallenges(
  numCheckpoints: number,
  difficulty: Difficulty,
  categories: ChallengeCategoryInput,
  sensorAvailability: SensorAvailability,
): ChallengeAssignment[] {
  const pool = shuffle(
    challengesForGeneration(difficulty, categories.length > 0 ? categories : undefined),
  )
  // Filter out challenges whose sensor is unavailable
  const usable = pool.filter((c) => isSensorAvailable(c.sensorType, sensorAvailability))
  const finalPool = usable.length >= 3 ? usable : pool // fall back to all if too few sensor-suitable

  const assignments: ChallengeAssignment[] = []
  const used = new Set<string>()

  for (let i = 0; i < numCheckpoints; i++) {
    // Try to find an unused challenge
    let chosen = finalPool.find((c) => !used.has(c.id))
    if (!chosen) {
      // Reset used set if we've exhausted the pool
      used.clear()
      chosen = finalPool[0] ?? pool[0]
    }
    if (chosen) {
      used.add(chosen.id)
      assignments.push(templateToAssignment(chosen))
    }
  }

  return assignments
}

type ChallengeCategoryInput = import('@/types/adventure').ChallengeCategory[]

// ── Main generator ────────────────────────────────────────────────────

export interface GenerateOptions {
  center: GeoPoint
  locationName: string
  locationSource: LocationSource
  preferences: AdventurePreferences
  sensorAvailability: SensorAvailability
}

/**
 * Generate a complete adventure.
 *
 * ROOT CAUSE FIX for "always generates in London":
 * This function takes `center` as an explicit argument — it NEVER uses a
 * hard-coded default city. The caller is responsible for resolving the
 * location (GPS or geocoded user input) before calling this. If no center
 * is provided, the generator throws rather than silently using a default.
 */
export function generateAdventure(opts: GenerateOptions): Adventure {
  if (opts.center.lat === 0 && opts.center.lng === 0) {
    throw new Error('No location provided — cannot generate adventure without a centre point.')
  }

  const { center, locationName, locationSource, preferences, sensorAvailability } = opts

  // Determine target distance from preferences
  const targetDistanceKm = resolveTargetDistance(preferences)
  // Determine number of checkpoints from duration
  const numCheckpoints = resolveCheckpointCount(preferences.durationMin)

  // Generate route
  const { points, checkpoints: cpPoints } = generateRoute(center, targetDistanceKm, numCheckpoints)

  // Assign challenges to checkpoints
  const challengeAssignments = assignChallenges(
    numCheckpoints,
    preferences.difficulty,
    preferences.challengeTypes,
    sensorAvailability,
  )

  // Build checkpoints with challenges
  const checkpoints: Checkpoint[] = cpPoints.map((pos, i) => ({
    index: i,
    position: pos,
    label: i === 0 ? 'Start' : i === cpPoints.length - 1 ? 'Finish' : `Checkpoint ${i + 1}`,
    challenge: challengeAssignments[i] ?? challengeAssignments[0],
    isStart: i === 0,
    isFinish: i === cpPoints.length - 1,
  }))

  // Compute actual route metrics
  const distanceM = pathLengthMeters(points)
  const durationMin = Math.max(10, Math.round((distanceM / WALKING_SPEED_MPS) / 60))

  // Build GeoJSON LineString [lng, lat]
  const geojson = {
    type: 'LineString' as const,
    coordinates: points.map((p) => [p.lng, p.lat] as [number, number]),
  }

  const route: AdventureRoute = {
    geojson,
    checkpoints,
    distanceKm: distanceM / 1000,
    durationMin,
  }

  // Compute rewards
  const totalXp = checkpoints.reduce((sum, cp) => sum + cp.challenge.rewardXp, 0)
  const totalCoins = checkpoints.reduce((sum, cp) => sum + cp.challenge.rewardCoins, 0)

  // Tags from challenge categories
  const tags = Array.from(new Set(checkpoints.map((cp) => cp.challenge.category)))
  const tagWord = tags.length > 0 ? TAG_WORDS[Math.min(tags.length - 1, TAG_WORDS.length - 1)] : 'Exploration'

  const title = titleFor(locationName)
  const description = descriptionFor(locationName, preferences.difficulty, checkpoints.length, tagWord)

  return {
    id: crypto.randomUUID(),
    title,
    description,
    difficulty: preferences.difficulty,
    locationName,
    locationSource,
    center,
    route,
    preferences,
    rewardXp: totalXp,
    rewardCoins: totalCoins,
    rewardItem: pickRewardItem(preferences.difficulty),
    tags: tags.map(String),
    imageEmoji: pick(EMOJIS),
    createdAt: new Date().toISOString(),
    isSuggested: false,
  }
}

function resolveTargetDistance(prefs: AdventurePreferences): number {
  // Priority: approxDistance > maxDistance > duration-based
  if (prefs.approxDistanceKm && prefs.approxDistanceKm > 0) {
    return prefs.approxDistanceKm
  }
  if (prefs.maxDistanceKm && prefs.maxDistanceKm > 0) {
    // Use 80% of max as target to stay within bounds
    return Math.max(0.5, prefs.maxDistanceKm * 0.8)
  }
  // Default from duration: ~1.35 m/s walking speed
  const meters = prefs.durationMin * 60 * WALKING_SPEED_MPS
  return Math.max(0.5, meters / 1000)
}

function resolveCheckpointCount(durationMin: number): number {
  // More checkpoints for longer adventures — ensures frequent gameplay
  if (durationMin <= 20) return 3
  if (durationMin <= 45) return 4
  if (durationMin <= 90) return 6
  if (durationMin <= 120) return 8
  return 10
}

function pickRewardItem(difficulty: Difficulty): string | undefined {
  const items: Record<Difficulty, string[]> = {
    easy: ['Trail Badge', 'Explorer Coin', 'Leaf Token'],
    medium: ['Pathfinder Medal', 'Compass Charm', 'Nature Token'],
    hard: ['Explorer Crest', 'Trail Master Badge', 'Discovery Gem'],
    extreme: ['Legendary Compass', 'Master Explorer Crown', 'Mythic Trail Token'],
  }
  return pick(items[difficulty])
}

// ── Suggested adventures ──────────────────────────────────────────────

export interface SuggestedOptions {
  center: GeoPoint
  sensorAvailability: SensorAvailability
}

/**
 * Generate suggested adventures near the user with the 70/20/10 distribution:
 * 70% within 30 min, 20% between 30-90 min, 10% up to 2 hours.
 */
export function generateSuggestedAdventures(opts: SuggestedOptions): SuggestedAdventureList {
  const { center, sensorAvailability } = opts
  const suggestions: SuggestedAdventureList = []

  // 70% nearby (within ~30 min drive ≈ 25km)
  const nearbyCount = 7
  for (let i = 0; i < nearbyCount; i++) {
    const distance = 1000 + Math.random() * 25000 // 1-26 km
    const bearing = Math.floor(Math.random() * 360)
    const point = destinationPoint(center, bearing, distance)
    const travelMin = Math.round((distance / 1000) / 50 * 60) // ~50 km/h drive
    suggestions.push(makeSuggestion(point, 'nearby', travelMin, sensorAvailability))
  }

  // 20% medium (30-90 min drive ≈ 25-75km)
  const mediumCount = 2
  for (let i = 0; i < mediumCount; i++) {
    const distance = 25000 + Math.random() * 50000
    const bearing = Math.floor(Math.random() * 360)
    const point = destinationPoint(center, bearing, distance)
    const travelMin = Math.round((distance / 1000) / 50 * 60)
    suggestions.push(makeSuggestion(point, 'medium', travelMin, sensorAvailability))
  }

  // 10% far (up to 2 hours ≈ 100km)
  const farCount = 1
  for (let i = 0; i < farCount; i++) {
    const distance = 75000 + Math.random() * 25000
    const bearing = Math.floor(Math.random() * 360)
    const point = destinationPoint(center, bearing, distance)
    const travelMin = Math.round((distance / 1000) / 50 * 60)
    suggestions.push(makeSuggestion(point, 'far', travelMin, sensorAvailability))
  }

  return suggestions
}

type SuggestedAdventureList = import('@/types/adventure').SuggestedAdventure[]

const SUGGESTED_PLACES = [
  { name: 'Riverside Park', emoji: '🌊', cat: 'nature' },
  { name: 'Hilltop Lookout', emoji: '🏔️', cat: 'exploration' },
  { name: 'Heritage Trail', emoji: '🏛️', cat: 'landmarks' },
  { name: 'Lakeside Walk', emoji: '🪨', cat: 'nature' },
  { name: 'Forest Loop', emoji: '🌲', cat: 'exploration' },
  { name: 'Garden Path', emoji: '🌸', cat: 'nature' },
  { name: 'Coastal Trail', emoji: '🌅', cat: 'exploration' },
  { name: 'City Discovery', emoji: '🏛️', cat: 'landmarks' },
  { name: 'Creek Path', emoji: '🌿', cat: 'nature' },
  { name: 'Valley Walk', emoji: '🦜', cat: 'exploration' },
]

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']

function makeSuggestion(
  point: GeoPoint,
  tier: 'nearby' | 'medium' | 'far',
  travelMin: number,
  _sensorAvailability: SensorAvailability,
): SuggestedAdventureList[number] {
  const place = pick(SUGGESTED_PLACES)
  const difficulty: Difficulty = tier === 'nearby' ? pick<Difficulty>(['easy', 'easy', 'medium']) : tier === 'medium' ? pick<Difficulty>(['medium', 'hard']) : pick<Difficulty>(['hard', 'extreme'])
  const duration = tier === 'nearby' ? pick([20, 30, 45]) : tier === 'medium' ? pick([45, 60, 90]) : pick([90, 120])
  const distanceKm = Math.round((duration * 60 * WALKING_SPEED_MPS) / 1000 * 10) / 10

  return {
    id: crypto.randomUUID(),
    title: `${place.name} Adventure`,
    emoji: place.emoji,
    difficulty,
    locationName: place.name,
    distanceKm,
    durationMin: duration,
    travelTimeMin: Math.min(travelMin, 120),
    category: place.cat,
    description: `A ${difficulty} ${duration}-minute adventure at ${place.name}. Perfect for ${place.cat} lovers.`,
    center: point,
  }
}
