import type { ChallengeCategory, Difficulty, SensorType } from '@/types/adventure'

export interface ChallengeTemplate {
  id: string; category: ChallengeCategory; title: string; description: string; difficulty: Difficulty; sensorType: SensorType; sensorConfig?: Record<string, unknown>; data: Record<string, unknown>; rewardXp: number; rewardCoins: number
}

const REWARD_SCALE: Record<Difficulty, { xp: number; coins: number }> = {
  easy: { xp: 15, coins: 10 }, medium: { xp: 30, coins: 20 }, hard: { xp: 60, coins: 40 }, extreme: { xp: 120, coins: 80 },
}
function reward(difficulty: Difficulty, mult = 1): { rewardXp: number; rewardCoins: number } {
  const s = REWARD_SCALE[difficulty]; return { rewardXp: Math.round(s.xp * mult), rewardCoins: Math.round(s.coins * mult) }
}

const EASY: ChallengeTemplate[] = [
  { id: 'obs-spot-color', category: 'observation', difficulty: 'easy', sensorType: 'none', title: 'Colour Hunter', description: 'Find and name three objects that are coloured red, blue, and green. Look around your current spot.', data: { target: 3, colors: ['red', 'blue', 'green'] }, ...reward('easy') },
  { id: 'obs-count-people', category: 'observation', difficulty: 'easy', sensorType: 'none', title: 'People Counter', description: 'Count how many people you can see right now. Report the number to continue.', data: { target: 1 }, ...reward('easy') },
  { id: 'obs-find-sign', category: 'observation', difficulty: 'easy', sensorType: 'none', title: 'Sign Spotter', description: 'Find a street sign or information board nearby and read the first word aloud.', data: { target: 1 }, ...reward('easy') },
  { id: 'obs-animal', category: 'observation', difficulty: 'easy', sensorType: 'none', title: 'Wildlife Watch', description: 'Spot a bird, insect, or small animal. Note what kind it is.', data: { target: 1 }, ...reward('easy') },
  { id: 'obs-cloud-shape', category: 'observation', difficulty: 'easy', sensorType: 'none', title: 'Cloud Shapes', description: 'Look up and describe the shape of a cloud you can see right now.', data: { target: 1 }, ...reward('easy') },
  { id: 'nav-walk-50', category: 'navigation', difficulty: 'easy', sensorType: 'geolocation', title: 'Short Stroll', description: 'Walk 50 metres in any direction. Your GPS will track your progress.', data: { targetMeters: 50 }, ...reward('easy') },
  { id: 'nav-walk-100', category: 'navigation', difficulty: 'easy', sensorType: 'geolocation', title: 'Hundred Steps', description: 'Walk at least 100 metres from this checkpoint to continue.', data: { targetMeters: 100 }, ...reward('easy') },
  { id: 'nav-find-intersection', category: 'navigation', difficulty: 'easy', sensorType: 'none', title: 'Crossroads', description: 'Walk to the nearest intersection or path junction and note the street names.', data: { target: 1 }, ...reward('easy') },
  { id: 'trivia-nature-e1', category: 'trivia', difficulty: 'easy', sensorType: 'none', title: 'Nature Trivia', description: 'What is the tallest tree species in the world?', data: { question: 'What is the tallest tree species?', options: ['Oak', 'Coast Redwood', 'Eucalyptus', 'Pine'], answer: 1 }, ...reward('easy') },
  { id: 'trivia-geo-e1', category: 'trivia', difficulty: 'easy', sensorType: 'none', title: 'Geography Trivia', description: 'How many continents are there on Earth?', data: { question: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2 }, ...reward('easy') },
  { id: 'trivia-space-e1', category: 'trivia', difficulty: 'easy', sensorType: 'none', title: 'Space Trivia', description: 'Which planet is closest to the Sun?', data: { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 2 }, ...reward('easy') },
  { id: 'trivia-animal-e1', category: 'trivia', difficulty: 'easy', sensorType: 'none', title: 'Animal Trivia', description: 'How many legs does a spider have?', data: { question: 'How many legs does a spider have?', options: ['6', '8', '10', '4'], answer: 1 }, ...reward('easy') },
  { id: 'walk-loop', category: 'fitness', difficulty: 'easy', sensorType: 'geolocation', title: 'Mini Loop', description: 'Complete a small loop by walking around a nearby feature and returning to this point.', data: { targetMeters: 80, loop: true }, ...reward('easy') },
  { id: 'lm-identify', category: 'landmarks', difficulty: 'easy', sensorType: 'none', title: 'Landmark ID', description: 'Find the nearest building or monument and identify its architectural style or age.', data: { target: 1 }, ...reward('easy') },
  { id: 'nature-tree-id', category: 'nature', difficulty: 'easy', sensorType: 'none', title: 'Tree ID', description: 'Identify the species of the nearest tree using its leaves, bark, or shape.', data: { target: 1 }, ...reward('easy') },
  { id: 'collect-leaves', category: 'collection', difficulty: 'easy', sensorType: 'none', title: 'Leaf Collector', description: 'Collect (or photograph) three different fallen leaves. Note their shapes.', data: { target: 3 }, ...reward('easy') },
  { id: 'explore-new-path', category: 'exploration', difficulty: 'easy', sensorType: 'geolocation', title: 'New Path', description: 'Take a path or street you have never walked before for at least 100 metres.', data: { targetMeters: 100 }, ...reward('easy') },
]

const MEDIUM: ChallengeTemplate[] = [
  { id: 'photo-nature', category: 'photography', difficulty: 'medium', sensorType: 'camera', title: 'Nature Shot', description: 'Take a photo of a natural element — a flower, leaf, tree bark, or rock formation — that catches your eye.', data: { subject: 'nature' }, ...reward('medium') },
  { id: 'photo-pattern', category: 'photography', difficulty: 'medium', sensorType: 'camera', title: 'Pattern Finder', description: 'Photograph a repeating pattern you find in the environment: bricks, tiles, ripples, or shadows.', data: { subject: 'pattern' }, ...reward('medium') },
  { id: 'photo-perspective', category: 'photography', difficulty: 'medium', sensorType: 'camera', title: 'Forced Perspective', description: 'Take a creative photo using forced perspective — make something small look large, or vice versa.', data: { subject: 'perspective' }, ...reward('medium') },
  { id: 'photo-texture', category: 'photography', difficulty: 'medium', sensorType: 'camera', title: 'Texture Hunt', description: 'Capture a close-up photo of an interesting texture: rough stone, smooth water, or furry bark.', data: { subject: 'texture' }, ...reward('medium') },
  { id: 'mem-observe-30', category: 'memory', difficulty: 'medium', sensorType: 'none', title: '30-Second Memory', description: 'Study your surroundings for 30 seconds. Then close your eyes and list five things you remember.', data: { studySeconds: 30, recallCount: 5 }, ...reward('medium') },
  { id: 'mem-sequence', category: 'memory', difficulty: 'medium', sensorType: 'none', title: 'Sequence Recall', description: 'Memorise this sequence: tree, bench, sign, path, bird. Walk 50 metres, then recite it in order.', data: { sequence: ['tree', 'bench', 'sign', 'path', 'bird'] }, ...reward('medium') },
  { id: 'mem-colors', category: 'memory', difficulty: 'medium', sensorType: 'none', title: 'Colour Memory', description: 'Look around for 15 seconds. Then list every blue and yellow object you saw.', data: { studySeconds: 15, colors: ['blue', 'yellow'] }, ...reward('medium') },
  { id: 'compass-face-north', category: 'compass', difficulty: 'medium', sensorType: 'compass', title: 'True North', description: 'Use your compass to face exactly north (0°). Hold steady for 3 seconds.', data: { targetHeading: 0, holdSeconds: 3 }, ...reward('medium') },
  { id: 'compass-face-east', category: 'compass', difficulty: 'medium', sensorType: 'compass', title: 'Face East', description: 'Turn to face east (90°). Hold the heading steady for 3 seconds.', data: { targetHeading: 90, holdSeconds: 3 }, ...reward('medium') },
  { id: 'compass-turn-180', category: 'compass', difficulty: 'medium', sensorType: 'compass', title: 'About Face', description: 'Note your current heading, then turn exactly 180° in either direction.', data: { turnDegrees: 180 }, ...reward('medium') },
  { id: 'compass-walk-north-50', category: 'compass', difficulty: 'medium', sensorType: 'compass', title: 'Walk North', description: 'Walk 50 metres heading as close to north as possible. Your compass tracks your heading.', data: { targetHeading: 0, targetMeters: 50 }, ...reward('medium') },
  { id: 'fit-step-count', category: 'fitness', difficulty: 'medium', sensorType: 'accelerometer', title: 'Step Counter', description: 'Walk 200 steps. Your phone accelerometer will count them.', data: { targetSteps: 200 }, ...reward('medium') },
  { id: 'fit-pace-walk', category: 'fitness', difficulty: 'medium', sensorType: 'geolocation', title: 'Pace Walk', description: 'Walk 300 metres at a steady pace without stopping.', data: { targetMeters: 300, noStop: true }, ...reward('medium') },
  { id: 'fit-climb', category: 'fitness', difficulty: 'medium', sensorType: 'geolocation', title: 'Elevation Gain', description: 'Walk to a point that is at least 5 metres higher in elevation than this checkpoint.', data: { elevationGain: 5 }, ...reward('medium') },
  { id: 'nav-walk-200', category: 'navigation', difficulty: 'medium', sensorType: 'geolocation', title: 'Direction March', description: 'Walk 200 metres from this checkpoint to the next waypoint.', data: { targetMeters: 200 }, ...reward('medium') },
  { id: 'nav-three-landmarks', category: 'navigation', difficulty: 'medium', sensorType: 'none', title: 'Three Landmarks', description: 'Identify three distinct landmarks visible from here and note their directions.', data: { target: 3 }, ...reward('medium') },
  { id: 'lm-historic', category: 'landmarks', difficulty: 'medium', sensorType: 'none', title: 'History Hunter', description: 'Find a historic plaque or marker. Read and summarise its text in one sentence.', data: { target: 1 }, ...reward('medium') },
  { id: 'nature-birdcall', category: 'nature', difficulty: 'medium', sensorType: 'none', title: 'Bird Call', description: 'Listen for 2 minutes and identify two different bird calls by description.', data: { listenSeconds: 120, target: 2 }, ...reward('medium') },
  { id: 'collect-stones', category: 'collection', difficulty: 'medium', sensorType: 'none', title: 'Stone Sampler', description: 'Find and photograph three stones of different colours or textures.', data: { target: 3 }, ...reward('medium') },
  { id: 'team-sync-walk', category: 'team', difficulty: 'medium', sensorType: 'geolocation', title: 'Sync Walk', description: 'Walk 100 metres while staying within 5 metres of your adventure partner.', data: { targetMeters: 100, maxSeparation: 5 }, ...reward('medium') },
  { id: 'reaction-quick-snap', category: 'reaction', difficulty: 'medium', sensorType: 'camera', title: 'Quick Snap', description: 'Within 10 seconds, spot and photograph a moving element (bird, cloud, person, car).', data: { timeLimit: 10 }, ...reward('medium') },
  { id: 'timed-photo-5', category: 'timed', difficulty: 'medium', sensorType: 'camera', title: 'Five in Five', description: 'Take five different photos in five minutes. Each must be a different subject.', data: { timeLimit: 300, target: 5 }, ...reward('medium') },
]

const HARD: ChallengeTemplate[] = [
  { id: 'puzzle-riddle-1', category: 'puzzle', difficulty: 'hard', sensorType: 'none', title: 'Path Riddle', description: 'I have no voice but I tell you the way. I have no feet but I travel all day. What am I? Walk to the answer.', data: { riddle: 'I have no voice but I tell you the way. I have no feet but I travel all day.', answer: 'sign' }, ...reward('hard') },
  { id: 'puzzle-cipher', category: 'puzzle', difficulty: 'hard', sensorType: 'none', title: 'Letter Shift', description: 'Decode this: each letter is shifted by 2. "UQOG" — what word is it? (Answer: SONG)', data: { cipher: 'UQOG', shift: 2, answer: 'SONG' }, ...reward('hard') },
  { id: 'puzzle-logic', category: 'puzzle', difficulty: 'hard', sensorType: 'none', title: 'Logic Gate', description: 'A man walks 3 km north, 4 km east, then 3 km south. How far is he from where he started? (Answer: 4 km)', data: { question: 'A man walks 3km north, 4km east, 3km south. Distance from start?', options: ['3 km', '4 km', '5 km', '10 km'], answer: 1 }, ...reward('hard') },
  { id: 'puzzle-word-scramble', category: 'puzzle', difficulty: 'hard', sensorType: 'none', title: 'Word Scramble', description: 'Unscramble these letters to find an outdoor word: T R E A W F L L E — (Answer: WATERFALL)', data: { scramble: 'TREAWFLLLE', answer: 'WATERFALL' }, ...reward('hard') },
  { id: 'nav-walk-500', category: 'navigation', difficulty: 'hard', sensorType: 'geolocation', title: 'Long Haul', description: 'Navigate 500 metres to the next checkpoint. Stay on safe paths.', data: { targetMeters: 500 }, ...reward('hard') },
  { id: 'nav-triangulate', category: 'navigation', difficulty: 'hard', sensorType: 'compass', title: 'Triangulate', description: 'Use your compass to take bearings on two visible landmarks. Note the intersection.', data: { target: 2 }, ...reward('hard') },
  { id: 'timed-quick-obs', category: 'timed', difficulty: 'hard', sensorType: 'none', title: 'Speed Observe', description: 'You have 60 seconds to find and photograph three different types of leaf. Go!', data: { timeLimit: 60, target: 3, subject: 'leaf' }, ...reward('hard') },
  { id: 'timed-sprint', category: 'timed', difficulty: 'hard', sensorType: 'geolocation', title: 'Speed Sprint', description: 'Reach the next checkpoint within 5 minutes. The clock starts now.', data: { timeLimit: 300 }, ...reward('hard') },
  { id: 'decision-route', category: 'exploration', difficulty: 'hard', sensorType: 'none', title: 'Crossroads Choice', description: 'You face two paths. The left is shorter but hilly; the right is longer but flat. Choose and commit.', data: { choices: ['left-hilly-short', 'right-flat-long'] }, ...reward('hard') },
  { id: 'obs-detailed-scan', category: 'observation', difficulty: 'hard', sensorType: 'none', title: 'Detail Scan', description: 'Find and describe five different plant species within 20 metres of this point.', data: { target: 5 }, ...reward('hard') },
  { id: 'obs-shadow', category: 'observation', difficulty: 'hard', sensorType: 'none', title: 'Shadow Reader', description: 'Determine the approximate time of day using only the direction and length of shadows.', data: { target: 1 }, ...reward('hard') },
  { id: 'photo-story', category: 'photography', difficulty: 'hard', sensorType: 'camera', title: 'Photo Story', description: 'Take a series of 3 photos that tell a story about this place: wide context, medium detail, close-up.', data: { subject: 'story', count: 3 }, ...reward('hard') },
  { id: 'photo-reflection', category: 'photography', difficulty: 'hard', sensorType: 'camera', title: 'Reflection Shot', description: 'Find water, glass, or another reflective surface and capture a creative reflection photo.', data: { subject: 'reflection' }, ...reward('hard') },
  { id: 'mem-map-study', category: 'memory', difficulty: 'hard', sensorType: 'none', title: 'Mental Map', description: 'Study the area for 60 seconds. Then draw a rough map from memory showing paths and landmarks.', data: { studySeconds: 60 }, ...reward('hard') },
  { id: 'lm-sketch', category: 'landmarks', difficulty: 'hard', sensorType: 'none', title: 'Quick Sketch', description: 'Choose a landmark and spend 2 minutes sketching its outline on paper or in your mind.', data: { timeLimit: 120 }, ...reward('hard') },
  { id: 'nature-ecosystem', category: 'nature', difficulty: 'hard', sensorType: 'none', title: 'Ecosystem Survey', description: 'Document the mini-ecosystem around you: identify a producer, consumer, and decomposer.', data: { target: 3 }, ...reward('hard') },
  { id: 'team-relay', category: 'team', difficulty: 'hard', sensorType: 'none', title: 'Memory Relay', description: 'One partner memorises a 5-item list, walks 50m, and recites it to the other. Then swap.', data: { sequence: ['tree', 'rock', 'path', 'sign', 'water'], targetMeters: 50 }, ...reward('hard') },
  { id: 'reaction-stop-on-cue', category: 'reaction', difficulty: 'hard', sensorType: 'accelerometer', title: 'Freeze Frame', description: 'Walk for 30 seconds. When the cue appears, stop immediately. Your accelerometer detects if you hold still.', data: { walkSeconds: 30, freezeSeconds: 3 }, ...reward('hard') },
  { id: 'explore-hidden', category: 'exploration', difficulty: 'hard', sensorType: 'none', title: 'Hidden Gem', description: 'Find something interesting that most people would walk past: a tiny garden, a mural, an unusual door.', data: { target: 1 }, ...reward('hard') },
]

const EXTREME: ChallengeTemplate[] = [
  { id: 'sensor-balance-beam', category: 'balance', difficulty: 'extreme', sensorType: 'accelerometer', title: 'Balance Beam', description: 'Keep your phone approximately vertical (tilt under 15°) while walking 100 metres. The accelerometer monitors your balance.', data: { targetMeters: 100, maxTilt: 15 }, sensorConfig: { maxTiltDeg: 15, targetMeters: 100 }, ...reward('extreme') },
  { id: 'sensor-level-walk', category: 'balance', difficulty: 'extreme', sensorType: 'accelerometer', title: 'Level Walk', description: 'Keep your phone level (tilt under 10°) while walking 80 metres. Any sharp tilt resets your progress.', data: { targetMeters: 80, maxTilt: 10 }, sensorConfig: { maxTiltDeg: 10, targetMeters: 80 }, ...reward('extreme') },
  { id: 'sensor-compass-precision', category: 'compass', difficulty: 'extreme', sensorType: 'compass', title: 'Precision Compass', description: 'Face heading 45° (north-east) and hold within ±3° for 5 seconds. Then walk 75 metres maintaining heading.', data: { targetHeading: 45, tolerance: 3, holdSeconds: 5, targetMeters: 75 }, ...reward('extreme') },
  { id: 'sensor-rotation-match', category: 'balance', difficulty: 'extreme', sensorType: 'gyroscope', title: 'Rotation Match', description: 'Rotate your phone to match three target orientations: 90°, 180°, then 270°. Hold each for 2 seconds.', data: { targets: [90, 180, 270], holdSeconds: 2 }, ...reward('extreme') },
  { id: 'sensor-motion-steady', category: 'fitness', difficulty: 'extreme', sensorType: 'accelerometer', title: 'Steady Motion', description: 'Walk 150 metres at a consistent pace without stopping or sudden movements. The accelerometer tracks your steadiness.', data: { targetMeters: 150, maxJerk: 3 }, ...reward('extreme') },
  { id: 'puzzle-chain', category: 'puzzle', difficulty: 'extreme', sensorType: 'none', title: 'Puzzle Chain', description: 'Solve three puzzles in sequence: 1) Unscramble K A E L (LAKE), 2) What has roots but never grows? (answer: route), 3) Decode X L I (shift 3 back = ULI... no — answer: RIVER from "ULYHU" shift 3).', data: { steps: ['LAKE', 'route', 'RIVER'] }, ...reward('extreme') },
  { id: 'puzzle-multi-stage', category: 'puzzle', difficulty: 'extreme', sensorType: 'none', title: 'Multi-Stage Mystery', description: 'Stage 1: Count the benches visible. Stage 2: Multiply by 3. Stage 3: Walk that many metres north. Report the number.', data: { stages: 3 }, ...reward('extreme') },
  { id: 'objective-multi', category: 'exploration', difficulty: 'extreme', sensorType: 'geolocation', title: 'Triple Objective', description: 'Complete three tasks in order: 1) Walk 200m north, 2) Photograph a landmark, 3) Walk 200m east to the finish.', data: { steps: ['walk-north-200', 'photo-landmark', 'walk-east-200'] }, ...reward('extreme') },
  { id: 'objective-collection', category: 'collection', difficulty: 'extreme', sensorType: 'camera', title: 'Complete Collection', description: 'Photograph five different natural items: a leaf, a stone, a flower, bark, and water. All five required.', data: { targets: ['leaf', 'stone', 'flower', 'bark', 'water'], count: 5 }, ...reward('extreme') },
  { id: 'mixed-nav-photo', category: 'exploration', difficulty: 'extreme', sensorType: 'camera', title: 'Navigate & Document', description: 'Walk 300 metres to a viewpoint, then take a panoramic photo showing the route you travelled.', data: { targetMeters: 300, photoType: 'panorama' }, ...reward('extreme') },
  { id: 'mixed-memory-nav', category: 'memory', difficulty: 'extreme', sensorType: 'geolocation', title: 'Memory Route', description: 'Memorise a 6-item sequence, walk 250 metres, then recite the sequence in order at the checkpoint.', data: { sequence: ['oak', 'bridge', 'fountain', 'bench', 'sign', 'gate'], targetMeters: 250 }, ...reward('extreme') },
  { id: 'mixed-compass-puzzle', category: 'compass', difficulty: 'extreme', sensorType: 'compass', title: 'Compass Cipher', description: 'Face north and decode: each letter shifts by the number of the nearest cardinal direction. "N B O O" → (N=0 shift) → "N B O O"... solve: LOOK.', data: { cipher: 'NBOO', answer: 'LOOK' }, ...reward('extreme') },
  { id: 'timed-landmark-rush', category: 'timed', difficulty: 'extreme', sensorType: 'geolocation', title: 'Landmark Rush', description: 'Visit three checkpoints within 10 minutes. GPS tracks your arrival at each.', data: { timeLimit: 600, targets: 3 }, ...reward('extreme') },
]

export const CHALLENGE_LIBRARY: ChallengeTemplate[] = [...EASY, ...MEDIUM, ...HARD, ...EXTREME]

export function challengesByDifficulty(difficulty: Difficulty): ChallengeTemplate[] {
  return CHALLENGE_LIBRARY.filter((c) => c.difficulty === difficulty)
}

export function challengesForGeneration(difficulty: Difficulty, categories?: ChallengeCategory[]): ChallengeTemplate[] {
  let pool = challengesByDifficulty(difficulty)
  if (pool.length < 4) {
    const order: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']
    const idx = order.indexOf(difficulty)
    const adjacent = [order[idx - 1], order[idx + 1]].filter(Boolean) as Difficulty[]
    for (const d of adjacent) pool = pool.concat(challengesByDifficulty(d))
  }
  if (categories && categories.length > 0) {
    const filtered = pool.filter((c) => categories.includes(c.category))
    if (filtered.length > 0) return filtered
  }
  return pool
}

export const TOTAL_CHALLENGES = CHALLENGE_LIBRARY.length

export const ALL_CATEGORIES: ChallengeCategory[] = [
  'observation', 'photography', 'fitness', 'puzzle', 'memory', 'navigation',
  'compass', 'landmarks', 'nature', 'collection', 'trivia', 'timed',
  'team', 'exploration', 'balance', 'reaction',
]
