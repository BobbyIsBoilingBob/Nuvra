import type { Adventure, AdventurePreferences, AdventureRoute, Checkpoint, ChallengeAssignment, Difficulty, GeoPoint, SuggestedAdventure, SensorAvailability } from '@/types/adventure'
import { challengesForGeneration, type ChallengeTemplate } from '@/data/challenges'
import { destinationPoint, distanceMeters, pathLengthMeters, WALKING_SPEED_MPS } from './geo'

const ADJ = ['Hidden', 'Secret', 'Lost', 'Forgotten', 'Golden', 'Wandering', 'Mystery', 'Urban', 'Wild', 'Riverside', 'Hilltop', 'Forest', 'Coastal', 'Twilight', 'Dawn']
const NOUN = ['Trail', 'Path', 'Quest', 'Loop', 'Discovery', 'Journey', 'Expedition', 'Adventure', 'Route', 'Walk', 'Trek', 'Voyage']
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

function resolveTargetDistance(p: AdventurePreferences): number {
  if (p.approxDistanceKm) return p.approxDistanceKm
  if (p.maxDistanceKm) return p.maxDistanceKm * 0.8
  if (p.minDistanceKm) return p.minDistanceKm * 1.5
  return (p.durationMin * WALKING_SPEED_MPS * 60) / 1000
}
function resolveCheckpointCount(d: number): number {
  if (d <= 20) return 3; if (d <= 45) return 4; if (d <= 90) return 6; if (d <= 120) return 8; return 10
}

export function generateRoute(center: GeoPoint, targetKm: number, numCp: number): AdventureRoute {
  if (center.lat === 0 && center.lng === 0) throw new Error('Location resolution failed')
  const radius = Math.max(200, (targetKm * 1000) / (2 * Math.PI) * 0.7)
  const startAngle = Math.random() * 360, angleStep = 360 / numCp
  const wobble = () => (Math.random() - 0.5) * radius * 0.3
  const checkpoints: Checkpoint[] = []
  for (let i = 0; i < numCp; i++) {
    const angle = (startAngle + i * angleStep) % 360
    const r = radius * (0.7 + Math.random() * 0.3)
    const pos = destinationPoint(center, angle, r)
    checkpoints.push({ index: i, position: { lat: pos.lat + wobble() / 111000, lng: pos.lng + wobble() / (111000 * Math.cos(pos.lat * Math.PI / 180)) }, label: i === 0 ? 'Start' : i === numCp - 1 ? 'Finish' : `Checkpoint ${i + 1}` })
  }
  const path: GeoPoint[] = [checkpoints[0].position]
  for (let i = 1; i < checkpoints.length; i++) {
    const prev = checkpoints[i - 1].position, curr = checkpoints[i].position
    const segDist = distanceMeters(prev, curr), steps = Math.max(3, Math.floor(segDist / 80))
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      const lat = prev.lat + (curr.lat - prev.lat) * t, lng = prev.lng + (curr.lng - prev.lng) * t
      path.push({ lat: lat + (Math.random() - 0.5) * 0.00015 * Math.sin(t * Math.PI), lng: lng + (Math.random() - 0.5) * 0.00015 * Math.sin(t * Math.PI) })
    }
  }
  return { center, checkpoints, path, totalDistanceKm: pathLengthMeters(path) / 1000, estimatedDurationMin: (pathLengthMeters(path) / 1000 * 1000) / WALKING_SPEED_MPS / 60 }
}

function assignChallenges(cps: Checkpoint[], prefs: AdventurePreferences, sa: SensorAvailability): Checkpoint[] {
  const pool = challengesForGeneration(prefs.difficulty, prefs.categories, sa)
  const fb = challengesForGeneration(prefs.difficulty, [], sa)
  const src = pool.length > 0 ? pool : fb
  if (src.length === 0) return cps
  const used = new Set<string>()
  return cps.map(cp => {
    let t: ChallengeTemplate | undefined
    const avail = src.filter(x => !used.has(x.id))
    t = avail.length > 0 ? avail[Math.floor(Math.random() * avail.length)] : src[Math.floor(Math.random() * src.length)]
    if (t) used.add(t.id)
    const a: ChallengeAssignment = { id: t.id, title: t.title, description: t.description, category: t.category, difficulty: t.difficulty, sensorType: t.sensorType, sensorConfig: t.sensorConfig, data: t.data, xp: t.xp, coins: t.coins }
    return { ...cp, challenge: a }
  })
}

export function generateAdventure(opts: { center: GeoPoint; locationName: string; locationSource: 'gps' | 'manual' | 'suggested'; preferences: AdventurePreferences; sensorAvail: SensorAvailability }): Adventure {
  const { center, locationName, locationSource, preferences, sensorAvail } = opts
  const route = generateRoute(center, resolveTargetDistance(preferences), resolveCheckpointCount(preferences.durationMin))
  const cps = assignChallenges(route.checkpoints, preferences, sensorAvail)
  return {
    id: `adv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title: `${locationName.split(',')[0].trim()} ${pick(ADJ)} ${pick(NOUN)}`,
    description: `A ${preferences.difficulty} journey through ${locationName} with ${cps.length} checkpoints of discovery.`,
    difficulty: preferences.difficulty, durationMin: Math.round(route.estimatedDurationMin), distanceKm: Math.round(route.totalDistanceKm * 10) / 10,
    locationName, locationSource, center, checkpoints: cps, path: route.path, preferences, createdAt: new Date().toISOString(),
  }
}

const SUGGESTED = [
  { name: 'Riverside Park', travelMin: 15, travelKm: 2 }, { name: 'Hilltop Lookout', travelMin: 20, travelKm: 4 },
  { name: 'Old Town Square', travelMin: 25, travelKm: 5 }, { name: 'Lakeside Trail', travelMin: 30, travelKm: 7 },
  { name: 'Forest Edge', travelMin: 35, travelKm: 9 }, { name: 'Coastal Path', travelMin: 45, travelKm: 12 },
  { name: 'Botanic Gardens', travelMin: 50, travelKm: 15 }, { name: 'Canyon Viewpoint', travelMin: 75, travelKm: 35 },
  { name: 'Mountain Pass', travelMin: 90, travelKm: 50 }, { name: 'Distant Summit', travelMin: 110, travelKm: 80 },
]

export function generateSuggestedAdventures(center: GeoPoint, sa: SensorAvailability): SuggestedAdventure[] {
  const diffs: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']
  const durs = [20, 30, 45, 60, 90, 120]
  return SUGGESTED.map((loc, i) => {
    const offset = destinationPoint(center, (i * 36) % 360, loc.travelKm * 1000)
    const prefs: AdventurePreferences = { difficulty: diffs[i % 4], durationMin: durs[i % durs.length], categories: [] }
    const adv = generateAdventure({ center: offset, locationName: loc.name, locationSource: 'suggested', preferences: prefs, sensorAvail: sa })
    adv.isSuggested = true
    return { adventure: adv, travelTimeMin: loc.travelMin, travelDistanceKm: loc.travelKm, isNearby: i < 7 }
  })
}
