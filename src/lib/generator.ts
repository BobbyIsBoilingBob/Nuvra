import type {
  Adventure, AdventurePreferences, AdventureRoute, Checkpoint, ChallengeAssignment,
  Difficulty, GeoPoint, SuggestedAdventure, SensorAvailability,
} from '@/types/adventure'
import { challengesForGeneration, type ChallengeTemplate } from '@/data/challenges'
import { destinationPoint, distanceMeters, pathLengthMeters, WALKING_SPEED_MPS } from './geo'

const ADJECTIVES = ['Hidden', 'Secret', 'Lost', 'Forgotten', 'Golden', 'Wandering', 'Mystery', 'Urban', 'Wild', 'Riverside', 'Hilltop', 'Forest', 'Coastal', 'Twilight', 'Dawn']
const NOUNS = ['Trail', 'Path', 'Quest', 'Loop', 'Discovery', 'Journey', 'Expedition', 'Adventure', 'Route', 'Walk', 'Trek', 'Voyage']

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function titleFor(locationName: string): string {
  const short = locationName.split(',')[0].trim()
  return `${short} ${pick(ADJECTIVES)} ${pick(NOUNS)}`
}

function descFor(difficulty: Difficulty, locationName: string, numCp: number): string {
  const adj = { easy: 'relaxed', medium: 'medium', hard: 'challenging', extreme: 'extreme' }[difficulty]
  return `A handcrafted ${adj} journey through ${locationName} with ${numCp} checkpoints of discovery.`
}

function resolveTargetDistance(prefs: AdventurePreferences): number {
  if (prefs.approxDistanceKm) return prefs.approxDistanceKm
  if (prefs.maxDistanceKm) return prefs.maxDistanceKm * 0.8
  if (prefs.minDistanceKm) return prefs.minDistanceKm * 1.5
  return (prefs.durationMin * WALKING_SPEED_MPS * 60) / 1000
}

function resolveCheckpointCount(durationMin: number): number {
  if (durationMin <= 20) return 3
  if (durationMin <= 45) return 4
  if (durationMin <= 90) return 6
  if (durationMin <= 120) return 8
  return 10
}

export function generateRoute(center: GeoPoint, targetDistanceKm: number, numCheckpoints: number): AdventureRoute {
  if (center.lat === 0 && center.lng === 0) throw new Error('Center point cannot be {0,0} — location resolution failed')

  const radius = Math.max(200, (targetDistanceKm * 1000) / (2 * Math.PI) * 0.7)
  const startAngle = Math.random() * 360
  const angleStep = 360 / numCheckpoints
  const wobble = () => (Math.random() - 0.5) * radius * 0.3

  const checkpoints: Checkpoint[] = []
  for (let i = 0; i < numCheckpoints; i++) {
    const angle = (startAngle + i * angleStep) % 360
    const r = radius * (0.7 + Math.random() * 0.3)
    const pos = destinationPoint(center, angle, r)
    checkpoints.push({
      index: i,
      position: { lat: pos.lat + wobble() / 111000, lng: pos.lng + wobble() / (111000 * Math.cos(pos.lat * Math.PI / 180)) },
      label: i === 0 ? 'Start' : i === numCheckpoints - 1 ? 'Finish' : `Checkpoint ${i + 1}`,
    })
  }

  const path: GeoPoint[] = [checkpoints[0].position]
  for (let i = 1; i < checkpoints.length; i++) {
    const prev = checkpoints[i - 1].position
    const curr = checkpoints[i].position
    const segDist = distanceMeters(prev, curr)
    const steps = Math.max(3, Math.floor(segDist / 80))
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      const lat = prev.lat + (curr.lat - prev.lat) * t
      const lng = prev.lng + (curr.lng - prev.lng) * t
      const jitter = (Math.random() - 0.5) * 0.00015 * Math.sin(t * Math.PI)
      path.push({ lat: lat + jitter, lng: lng + jitter })
    }
  }

  const totalDistKm = pathLengthMeters(path) / 1000
  const estDurationMin = (totalDistKm * 1000) / WALKING_SPEED_MPS / 60

  return { center, checkpoints, path, totalDistanceKm: totalDistKm, estimatedDurationMin: estDurationMin }
}

function assignChallenges(checkpoints: Checkpoint[], prefs: AdventurePreferences, sensorAvail: SensorAvailability): Checkpoint[] {
  const pool = challengesForGeneration(prefs.difficulty, prefs.categories, sensorAvail)
  const fallback = challengesForGeneration(prefs.difficulty, [], sensorAvail)
  const source = pool.length > 0 ? pool : fallback
  if (source.length === 0) return checkpoints

  const used = new Set<string>()
  return checkpoints.map((cp) => {
    let template: ChallengeTemplate | undefined
    const available = source.filter(t => !used.has(t.id))
    if (available.length > 0) {
      template = available[Math.floor(Math.random() * available.length)]
      used.add(template.id)
    } else {
      template = source[Math.floor(Math.random() * source.length)]
    }
    const assignment: ChallengeAssignment = {
      id: template.id, title: template.title, description: template.description,
      category: template.category, difficulty: template.difficulty,
      sensorType: template.sensorType, sensorConfig: template.sensorConfig,
      data: template.data, xp: template.xp, coins: template.coins,
    }
    return { ...cp, challenge: assignment }
  })
}

export function generateAdventure(opts: {
  center: GeoPoint; locationName: string; locationSource: 'gps' | 'manual' | 'suggested'
  preferences: AdventurePreferences; sensorAvail: SensorAvailability
}): Adventure {
  const { center, locationName, locationSource, preferences, sensorAvail } = opts
  const targetDist = resolveTargetDistance(preferences)
  const numCp = resolveCheckpointCount(preferences.durationMin)
  const route = generateRoute(center, targetDist, numCp)
  const withChallenges = assignChallenges(route.checkpoints, preferences, sensorAvail)
  return {
    id: `adv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title: titleFor(locationName),
    description: descFor(preferences.difficulty, locationName, withChallenges.length),
    difficulty: preferences.difficulty,
    durationMin: Math.round(route.estimatedDurationMin),
    distanceKm: Math.round(route.totalDistanceKm * 10) / 10,
    locationName, locationSource, center,
    checkpoints: withChallenges, path: route.path,
    preferences, createdAt: new Date().toISOString(),
  }
}

const SUGGESTED_LOCATIONS: { name: string; travelMin: number; travelKm: number }[] = [
  { name: 'Riverside Park', travelMin: 15, travelKm: 2 },
  { name: 'Hilltop Lookout', travelMin: 20, travelKm: 4 },
  { name: 'Old Town Square', travelMin: 25, travelKm: 5 },
  { name: 'Lakeside Trail', travelMin: 30, travelKm: 7 },
  { name: 'Forest Edge', travelMin: 35, travelKm: 9 },
  { name: 'Coastal Path', travelMin: 45, travelKm: 12 },
  { name: 'Botanic Gardens', travelMin: 50, travelKm: 15 },
  { name: 'Canyon Viewpoint', travelMin: 75, travelKm: 35 },
  { name: 'Mountain Pass', travelMin: 90, travelKm: 50 },
  { name: 'Distant Summit', travelMin: 110, travelKm: 80 },
]

export function generateSuggestedAdventures(center: GeoPoint, sensorAvail: SensorAvailability): SuggestedAdventure[] {
  const result: SuggestedAdventure[] = []
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']
  const durations = [20, 30, 45, 60, 90, 120]
  for (let i = 0; i < 10; i++) {
    const loc = SUGGESTED_LOCATIONS[i]
    const isNearby = i < 7
    const angle = (i * 36) % 360
    const offset = destinationPoint(center, angle, loc.travelKm * 1000)
    const prefs: AdventurePreferences = { difficulty: difficulties[i % 4], durationMin: durations[i % durations.length], categories: [] }
    const adv = generateAdventure({ center: offset, locationName: loc.name, locationSource: 'suggested', preferences: prefs, sensorAvail })
    adv.isSuggested = true
    result.push({ adventure: adv, travelTimeMin: loc.travelMin, travelDistanceKm: loc.travelKm, isNearby })
  }
  return result
}
