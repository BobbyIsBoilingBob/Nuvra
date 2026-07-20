import type { Adventure, AdventurePreferences, AdventureRoute, ChallengeAssignment, Checkpoint, Difficulty, GeoPoint, LocationSource, SuggestedAdventure } from '@/types/adventure'
import { destinationPoint, distanceMeters, pathLengthMeters, bearingDeg, WALKING_SPEED_MPS } from './geo'
import { challengesForGeneration, type ChallengeTemplate } from '@/data/challenges'
import { detectSensors, isSensorAvailable } from './sensors'
import type { SensorAvailability } from '@/types/adventure'

const TITLE_TEMPLATES = ['The {place} Expedition','{place} Hidden Trail','Mystery of {place}','{place} Discovery Walk','The {place} Quest','{place} Adventure Loop','Secrets of {place}','{place} Explorer','The {place} Challenge','{place} Wander']
const DESC_TEMPLATES = ['A {difficulty} adventure weaving through {place}. Complete {count} challenges along the route.','Explore {place} on this {difficulty} route with {count} challenges. {tag} meets exploration.','A handcrafted {difficulty} journey through {place} with {count} checkpoints of discovery.','Discover {place} through {count} {difficulty} challenges. Every step reveals something new.']
const TAG_WORDS = ['Nature','History','Mystery','Fitness','Photography','Puzzle','Navigation','Observation']
const EMOJIS = ['🧭','🗺️','🌲','🏔️','🌊','🏛️','🦜','🌸','🪨','🌿','🌅','🚶','📍','🌟','🍃']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function titleFor(place: string): string { return pick(TITLE_TEMPLATES).replace('{place}', place.split(',')[0].trim() || 'the Area') }
function descriptionFor(place: string, difficulty: Difficulty, count: number, tag: string): string {
  return pick(DESC_TEMPLATES).replace('{place}', place.split(',')[0].trim() || 'the area').replace('{difficulty}', difficulty).replace('{count}', String(count)).replace('{tag}', tag)
}

export function generateRoute(center: GeoPoint, targetDistanceKm: number, numCheckpoints: number): { points: GeoPoint[]; checkpoints: GeoPoint[] } {
  const targetMeters = targetDistanceKm * 1000
  const segLen = targetMeters / numCheckpoints
  const points: GeoPoint[] = [{ ...center }]
  const checkpoints: GeoPoint[] = [{ ...center }]
  const half = Math.ceil(numCheckpoints / 2)
  let current = { ...center }
  let baseBearing = Math.floor(Math.random() * 360)
  for (let i = 0; i < half; i++) {
    const bearing = (baseBearing + (Math.random() - 0.5) * 70 + 360) % 360
    const len = segLen * (0.85 + Math.random() * 0.3)
    current = destinationPoint(current, bearing, len)
    points.push({ ...current })
    checkpoints.push({ ...current })
  }
  let returnCurrent = { ...current }
  for (let i = half; i < numCheckpoints - 1; i++) {
    const toCenter = bearingDeg(returnCurrent, center)
    const bearing = (toCenter + (Math.random() - 0.5) * 50 + 360) % 360
    const len = segLen * (0.85 + Math.random() * 0.3)
    returnCurrent = destinationPoint(returnCurrent, bearing, len)
    points.push({ ...returnCurrent })
    checkpoints.push({ ...returnCurrent })
  }
  points.push({ ...center })
  return { points, checkpoints }
}

function templateToAssignment(t: ChallengeTemplate): ChallengeAssignment {
  return { id: t.id, category: t.category, title: t.title, description: t.description, difficulty: t.difficulty, sensorType: t.sensorType, sensorConfig: t.sensorConfig, data: t.data, rewardXp: t.rewardXp, rewardCoins: t.rewardCoins }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

function assignChallenges(numCheckpoints: number, difficulty: Difficulty, categories: ChallengeCategoryInput, sensorAvailability: SensorAvailability): ChallengeAssignment[] {
  const pool = shuffle(challengesForGeneration(difficulty, categories.length > 0 ? categories : undefined))
  const usable = pool.filter((c) => isSensorAvailable(c.sensorType, sensorAvailability))
  const finalPool = usable.length >= 3 ? usable : pool
  const assignments: ChallengeAssignment[] = []
  const used = new Set<string>()
  for (let i = 0; i < numCheckpoints; i++) {
    let chosen = finalPool.find((c) => !used.has(c.id))
    if (!chosen) { used.clear(); chosen = finalPool[0] ?? pool[0] }
    if (chosen) { used.add(chosen.id); assignments.push(templateToAssignment(chosen)) }
  }
  return assignments
}

type ChallengeCategoryInput = import('@/types/adventure').ChallengeCategory[]

export interface GenerateOptions { center: GeoPoint; locationName: string; locationSource: LocationSource; preferences: AdventurePreferences; sensorAvailability: SensorAvailability }

export function generateAdventure(opts: GenerateOptions): Adventure {
  if (opts.center.lat === 0 && opts.center.lng === 0) throw new Error('No location provided — cannot generate adventure without a centre point.')
  const { center, locationName, locationSource, preferences, sensorAvailability } = opts
  const targetDistanceKm = resolveTargetDistance(preferences)
  const numCheckpoints = resolveCheckpointCount(preferences.durationMin)
  const { points, checkpoints: cpPoints } = generateRoute(center, targetDistanceKm, numCheckpoints)
  const challengeAssignments = assignChallenges(numCheckpoints, preferences.difficulty, preferences.challengeTypes, sensorAvailability)
  const checkpoints: Checkpoint[] = cpPoints.map((pos, i) => ({
    index: i, position: pos, label: i === 0 ? 'Start' : i === cpPoints.length - 1 ? 'Finish' : `Checkpoint ${i + 1}`,
    challenge: challengeAssignments[i] ?? challengeAssignments[0], isStart: i === 0, isFinish: i === cpPoints.length - 1,
  }))
  const distanceM = pathLengthMeters(points)
  const durationMin = Math.max(10, Math.round((distanceM / WALKING_SPEED_MPS) / 60))
  const geojson = { type: 'LineString' as const, coordinates: points.map((p) => [p.lng, p.lat] as [number, number]) }
  const route: AdventureRoute = { geojson, checkpoints, distanceKm: distanceM / 1000, durationMin }
  const totalXp = checkpoints.reduce((sum, cp) => sum + cp.challenge.rewardXp, 0)
  const totalCoins = checkpoints.reduce((sum, cp) => sum + cp.challenge.rewardCoins, 0)
  const tags = Array.from(new Set(checkpoints.map((cp) => cp.challenge.category)))
  const tagWord = tags.length > 0 ? TAG_WORDS[Math.min(tags.length - 1, TAG_WORDS.length - 1)] : 'Exploration'
  return {
    id: crypto.randomUUID(), title: titleFor(locationName), description: descriptionFor(locationName, preferences.difficulty, checkpoints.length, tagWord),
    difficulty: preferences.difficulty, locationName, locationSource, center, route, preferences, rewardXp: totalXp, rewardCoins: totalCoins,
    rewardItem: pickRewardItem(preferences.difficulty), tags: tags.map(String), imageEmoji: pick(EMOJIS), createdAt: new Date().toISOString(), isSuggested: false,
  }
}

function resolveTargetDistance(prefs: AdventurePreferences): number {
  if (prefs.approxDistanceKm && prefs.approxDistanceKm > 0) return prefs.approxDistanceKm
  if (prefs.maxDistanceKm && prefs.maxDistanceKm > 0) return Math.max(0.5, prefs.maxDistanceKm * 0.8)
  const meters = prefs.durationMin * 60 * WALKING_SPEED_MPS
  return Math.max(0.5, meters / 1000)
}

function resolveCheckpointCount(durationMin: number): number {
  if (durationMin <= 20) return 3
  if (durationMin <= 45) return 4
  if (durationMin <= 90) return 6
  if (durationMin <= 120) return 8
  return 10
}

function pickRewardItem(difficulty: Difficulty): string | undefined {
  const items: Record<Difficulty, string[]> = {
    easy: ['Trail Badge','Explorer Coin','Leaf Token'], medium: ['Pathfinder Medal','Compass Charm','Nature Token'],
    hard: ['Explorer Crest','Trail Master Badge','Discovery Gem'], extreme: ['Legendary Compass','Master Explorer Crown','Mythic Trail Token'],
  }
  return pick(items[difficulty])
}

export interface SuggestedOptions { center: GeoPoint; sensorAvailability: SensorAvailability }

export function generateSuggestedAdventures(opts: SuggestedOptions): SuggestedAdventure[] {
  const { center } = opts
  const suggestions: SuggestedAdventure[] = []
  for (let i = 0; i < 7; i++) {
    const distance = 1000 + Math.random() * 25000
    const point = destinationPoint(center, Math.floor(Math.random() * 360), distance)
    suggestions.push(makeSuggestion(point, 'nearby', Math.round((distance / 1000) / 50 * 60)))
  }
  for (let i = 0; i < 2; i++) {
    const distance = 25000 + Math.random() * 50000
    const point = destinationPoint(center, Math.floor(Math.random() * 360), distance)
    suggestions.push(makeSuggestion(point, 'medium', Math.round((distance / 1000) / 50 * 60)))
  }
  const distance = 75000 + Math.random() * 25000
  suggestions.push(makeSuggestion(destinationPoint(center, Math.floor(Math.random() * 360), distance), 'far', Math.round((distance / 1000) / 50 * 60)))
  return suggestions
}

const SUGGESTED_PLACES = [
  { name: 'Riverside Park', emoji: '🌊', cat: 'nature' }, { name: 'Hilltop Lookout', emoji: '🏔️', cat: 'exploration' },
  { name: 'Heritage Trail', emoji: '🏛️', cat: 'landmarks' }, { name: 'Lakeside Walk', emoji: '🪨', cat: 'nature' },
  { name: 'Forest Loop', emoji: '🌲', cat: 'exploration' }, { name: 'Garden Path', emoji: '🌸', cat: 'nature' },
  { name: 'Coastal Trail', emoji: '🌅', cat: 'exploration' }, { name: 'City Discovery', emoji: '🏛️', cat: 'landmarks' },
  { name: 'Creek Path', emoji: '🌿', cat: 'nature' }, { name: 'Valley Walk', emoji: '🦜', cat: 'exploration' },
]
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']

function makeSuggestion(point: GeoPoint, tier: 'nearby' | 'medium' | 'far', travelMin: number): SuggestedAdventure {
  const place = pick(SUGGESTED_PLACES)
  const difficulty: Difficulty = tier === 'nearby' ? pick<Difficulty>(['easy', 'easy', 'medium']) : tier === 'medium' ? pick<Difficulty>(['medium', 'hard']) : pick<Difficulty>(['hard', 'extreme'])
  const duration = tier === 'nearby' ? pick([20, 30, 45]) : tier === 'medium' ? pick([45, 60, 90]) : pick([90, 120])
  const distanceKm = Math.round((duration * 60 * WALKING_SPEED_MPS) / 1000 * 10) / 10
  return { id: crypto.randomUUID(), title: `${place.name} Adventure`, emoji: place.emoji, difficulty, locationName: place.name, distanceKm, durationMin: duration, travelTimeMin: Math.min(travelMin, 120), category: place.cat, description: `A ${difficulty} ${duration}-minute adventure at ${place.name}. Perfect for ${place.cat} lovers.`, center: point }
}
