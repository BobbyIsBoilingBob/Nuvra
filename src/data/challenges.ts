import type { Challenge, ChallengeCategory, Difficulty, Adventure, SuggestedAdventure, AdventurePreferences } from '@/types/adventure'

const templates: Omit<Challenge, 'id'>[] = [
  { title: 'Local Trivia', description: 'Answer a question about this area', category: 'trivia', xp: 50, coins: 20, question: 'What is the capital of this region?', options: ['Option A','Option B','Option C','Option D'], answerIndex: 0 },
  { title: 'Photo Challenge', description: 'Capture something interesting', category: 'photo', xp: 80, coins: 30, photoPrompt: 'Take a photo of a unique landmark' },
  { title: 'Step Counter', description: 'Walk to earn rewards', category: 'fitness', xp: 60, coins: 25, targetSteps: 50 },
  { title: 'Compass Navigation', description: 'Find north using your compass', category: 'compass', xp: 70, coins: 25, targetHeading: 0 },
  { title: 'Riddle Me This', description: 'Solve a riddle to proceed', category: 'riddle', xp: 90, coins: 40, riddleText: 'I have cities but no houses, forests but no trees, water but no fish. What am I?', riddleAnswer: 'map' },
  { title: 'Speed Challenge', description: 'Reach the next checkpoint quickly', category: 'speed', xp: 100, coins: 50, timeLimitSec: 120 },
  { title: 'Exploration Task', description: 'Explore the surroundings', category: 'exploration', xp: 55, coins: 20 },
  { title: 'Puzzle Breaker', description: 'Solve a quick puzzle', category: 'puzzle', xp: 75, coins: 35, question: 'Which shape has the most sides?', options: ['Triangle','Square','Hexagon','Pentagon'], answerIndex: 2 },
]

export function generateChallenges(count: number, categories: ChallengeCategory[]): Challenge[] {
  const filtered = categories.length > 0 ? templates.filter(c => categories.includes(c.category)) : templates
  const pool = filtered.length > 0 ? filtered : templates
  const result: Challenge[] = []
  for (let i = 0; i < count; i++) { const t = pool[i % pool.length]; result.push({ ...t, id: 'ch-' + i + '-' + Date.now() }) }
  return result
}

const diffCfg: Record<Difficulty, { radius: number; cpCount: number; duration: number; distance: number }> = {
  easy: { radius: 300, cpCount: 3, duration: 20, distance: 1.5 },
  medium: { radius: 500, cpCount: 4, duration: 35, distance: 2.5 },
  hard: { radius: 800, cpCount: 5, duration: 50, distance: 4 },
  extreme: { radius: 1200, cpCount: 6, duration: 75, distance: 6 },
}

export function generateAdventure(params: { center: { lat: number; lng: number }; locationName: string; locationSource: 'gps'|'manual'|'suggested'; preferences: AdventurePreferences; sensorAvail: { gps: boolean; compass: boolean; accelerometer: boolean } }): Adventure {
  const { center, locationName, locationSource, preferences } = params
  const cfg = diffCfg[preferences.difficulty]
  const cpCount = preferences.checkpointCount || cfg.cpCount
  const challenges = generateChallenges(cpCount, preferences.categories)
  const checkpoints = challenges.map((ch, i) => {
    const angle = (i / cpCount) * Math.PI * 2
    const dist = cfg.radius * (0.5 + Math.random() * 0.5)
    return { position: { lat: center.lat + (dist * Math.cos(angle)) / 111000, lng: center.lng + (dist * Math.sin(angle)) / (111000 * Math.cos(center.lat * Math.PI / 180)) }, challenge: ch, title: ch.title }
  })
  return { id: 'adv-' + Date.now(), locationName, description: 'A ' + preferences.difficulty + ' adventure with ' + cpCount + ' checkpoints around ' + locationName + '.', center, checkpoints, difficulty: preferences.difficulty, durationMin: preferences.durationMin || cfg.duration, distanceKm: cfg.distance, locationSource, createdAt: new Date().toISOString() }
}

export function generateSuggestedAdventures(center: { lat: number; lng: number }, _sensorAvail: { gps: boolean; compass: boolean; accelerometer: boolean }): SuggestedAdventure[] {
  const suggestions = [
    { name: 'Riverside Walk', difficulty: 'easy' as Difficulty, duration: 25, distance: 1.8, travel: 5 },
    { name: 'City Center Quest', difficulty: 'medium' as Difficulty, duration: 40, distance: 2.8, travel: 10 },
    { name: 'Hilltop Challenge', difficulty: 'hard' as Difficulty, duration: 55, distance: 3.8, travel: 15 },
    { name: 'Extreme Explorer', difficulty: 'extreme' as Difficulty, duration: 80, distance: 5.5, travel: 20 },
  ]
  return suggestions.map((s, i) => {
    const advCenter = { lat: center.lat + (i - 1.5) * 0.005, lng: center.lng + (i - 1.5) * 0.005 }
    const cfg = diffCfg[s.difficulty]
    const challenges = generateChallenges(cfg.cpCount, [])
    const checkpoints = challenges.map((ch, j) => {
      const angle = (j / cfg.cpCount) * Math.PI * 2
      const dist = cfg.radius * 0.7
      return { position: { lat: advCenter.lat + (dist * Math.cos(angle)) / 111000, lng: advCenter.lng + (dist * Math.sin(angle)) / (111000 * Math.cos(advCenter.lat * Math.PI / 180)) }, challenge: ch, title: ch.title }
    })
    const adventure: Adventure = { id: 'sug-' + i + '-' + Date.now(), locationName: s.name, description: 'A ' + s.difficulty + ' adventure near you with ' + cfg.cpCount + ' checkpoints.', center: advCenter, checkpoints, difficulty: s.difficulty, durationMin: s.duration, distanceKm: s.distance, locationSource: 'suggested', createdAt: new Date().toISOString() }
    return { adventure, travelTimeMin: s.travel }
  })
}

export const challengeCategories: { id: ChallengeCategory; label: string; icon: string }[] = [
  { id: 'trivia', label: 'Trivia', icon: 'Brain' }, { id: 'photo', label: 'Photo', icon: 'Camera' },
  { id: 'fitness', label: 'Fitness', icon: 'Footprints' }, { id: 'compass', label: 'Compass', icon: 'Compass' },
  { id: 'riddle', label: 'Riddle', icon: 'HelpCircle' }, { id: 'speed', label: 'Speed', icon: 'Zap' },
  { id: 'exploration', label: 'Explore', icon: 'Compass' }, { id: 'puzzle', label: 'Puzzle', icon: 'Mountain' },
]
