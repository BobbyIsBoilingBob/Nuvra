import type { ChallengeCategory, Difficulty, SensorType, SensorAvailability } from '@/types/adventure'

export interface ChallengeTemplate {
  id: string; title: string; description: string; category: ChallengeCategory; difficulty: Difficulty;
  sensorType: SensorType; sensorConfig?: Record<string, unknown>; data?: Record<string, unknown>; xp: number; coins: number
}

const r = (d: Difficulty) => ({ easy: { xp: 15, coins: 10 }, medium: { xp: 35, coins: 25 }, hard: { xp: 70, coins: 50 }, extreme: { xp: 120, coins: 80 } }[d])
const mk = (id: string, title: string, desc: string, cat: ChallengeCategory, diff: Difficulty, st: SensorType = 'none', ex: Partial<ChallengeTemplate> = {}): ChallengeTemplate => ({ id, title, description: desc, category: cat, difficulty: diff, sensorType: st, ...r(diff), ...ex })

export const CHALLENGE_LIBRARY: ChallengeTemplate[] = [
  mk('obs-e1','Spot the Colour','Find 3 objects matching the colour of the sky today.','observation','easy'),
  mk('obs-e2','Cloud Shapes','Identify 3 different shapes in the clouds above.','observation','easy'),
  mk('obs-e3','Texture Hunt','Touch 4 different natural textures (bark, leaf, stone, grass).','observation','easy'),
  mk('photo-e1','Snap a Sign','Photograph a directional or street sign near you.','photography','easy'),
  mk('photo-e2','Nature Close-up','Take a close-up photo of a leaf or flower.','photography','easy'),
  mk('photo-e3','Shadow Shot','Capture an interesting shadow on the ground.','photography','easy'),
  mk('fit-e1','Pace Walk','Walk 300 metres at a steady pace without stopping.','fitness','easy'),
  mk('fit-e2','Step Counter','Count your steps for 2 minutes — aim for 200+.','fitness','easy'),
  mk('mem-e1','Recall 5','Memorise 5 items you pass, then recite them at the finish.','memory','easy'),
  mk('nav-e1','Left or Right','At the next junction, take the path less travelled.','navigation','easy'),
  mk('lm-e1','Find a Bench','Locate the nearest public bench or seat.','landmarks','easy'),
  mk('nature-e1','Bird Call','Listen for and identify 2 different bird calls.','nature','easy'),
  mk('nature-e2','Tree Count','Count the number of trees within 50 metres of you.','nature','easy'),
  mk('collect-e1','Gather 3 Leaves','Collect 3 different fallen leaves along the route.','collection','easy'),
  mk('trivia-e1','Local Trivia','Answer a simple trivia question about your area.','trivia','easy','none',{ data: { question: 'What is the capital of your country?', answers: ['Try your best!'], correct: 0 } }),
  mk('explore-e1','New Path','Take a route you have never walked before.','exploration','easy'),
  mk('reaction-e1','Quick Snap','When you see a dog, snap a photo within 5 seconds.','reaction','easy'),
  mk('obs-m1','Pattern Seeker','Find 3 repeating patterns in architecture or nature.','observation','medium'),
  mk('obs-m2','Count Windows','Count the total windows on a building you pass.','observation','medium'),
  mk('obs-m3','Wildlife Spotting','Spot 3 different types of animals or insects.','observation','medium'),
  mk('photo-m1','Perspective Shot','Take a photo from an unusual angle or perspective.','photography','medium'),
  mk('photo-m2','Reflection','Find and photograph a reflection in water or glass.','photography','medium'),
  mk('photo-m3','Golden Frame','Frame a shot using natural elements as a border.','photography','medium'),
  mk('fit-m1','Elevation Gain','Find and climb a hill or stairs — gain at least 10m elevation.','fitness','medium'),
  mk('fit-m2','Power Walk','Walk briskly for 500 metres without slowing down.','fitness','medium'),
  mk('fit-m3','Sprint Interval','Sprint for 30 seconds, walk for 60 — repeat 3 times.','fitness','medium'),
  mk('puzzle-m1','Word Scramble','Unscramble the letters from 3 street signs to form a word.','puzzle','medium'),
  mk('puzzle-m2','Number Logic','Find 3 consecutive house numbers and predict the next.','puzzle','medium'),
  mk('mem-m1','Memory Lane','Memorise the order of 7 landmarks along the route.','memory','medium'),
  mk('nav-m1','Compass Walk','Walk 200 metres north, then 200 metres east.','navigation','medium','compass',{ sensorConfig: { targetHeading: 0 } }),
  mk('nav-m2','Bearing Check','Check your compass bearing at each checkpoint.','navigation','medium','compass'),
  mk('lm-m1','Historical Marker','Find and read a historical plaque or monument.','landmarks','medium'),
  mk('lm-m2','Bridge Crossing','Find and cross a bridge along your route.','landmarks','medium'),
  mk('nature-m1','Plant ID','Identify 3 different plant species by leaf shape.','nature','medium'),
  mk('nature-m2','Insect Hunt','Find and photograph 3 different insect species.','nature','medium'),
  mk('collect-m1','Rock Collection','Collect 3 interesting rocks of different colours.','collection','medium'),
  mk('trivia-m1','Geography Quiz','Answer a geography question about your region.','trivia','medium','none',{ data: { question: 'Which river is closest to your current location?', answers: ['A','B','C','D'], correct: 0 } }),
  mk('team-m1','Sync Step','Walk in sync with a partner for 100 steps.','team','medium'),
  mk('explore-m1','Hidden Alley','Find a path or alley you have never noticed before.','exploration','medium'),
  mk('obs-h1','Architectural Era','Identify 3 buildings from different architectural periods.','observation','hard'),
  mk('obs-h2','Material Survey','Catalogue 5 different building materials used nearby.','observation','hard'),
  mk('photo-h1','Panorama','Take a 180-degree panorama photo from a high point.','photography','hard'),
  mk('photo-h2','Long Exposure','Capture motion blur of water or traffic.','photography','hard'),
  mk('fit-h1','Hill Repeats','Find a steep hill and climb it 3 times.','fitness','hard'),
  mk('fit-h2','Distance Push','Walk 1.5 km without stopping at a brisk pace.','fitness','hard'),
  mk('fit-h3','Step Master','Climb 200+ steps in a single session.','fitness','hard'),
  mk('puzzle-h1','Coordinate Clue','Use GPS coordinates to find a hidden checkpoint.','puzzle','hard','gps',{ sensorConfig: { targetRadius: 20 } }),
  mk('puzzle-h2','Cipher Decode','Decode a simple substitution cipher from clues.','puzzle','hard','none',{ data: { question: 'Decode: X J M F Q = ?', answers: ['WATER','WORLD','WHEAT','WORTH'], correct: 0 } }),
  mk('mem-h1','Map Memory','Study a route map for 30 seconds, then navigate from memory.','memory','hard'),
  mk('nav-h1','Precision Compass','Navigate to a specific bearing within 5 degrees accuracy.','navigation','hard','compass',{ sensorConfig: { targetHeading: 45, tolerance: 5 } }),
  mk('nav-h2','Triangulation','Use 3 landmarks to determine your position.','navigation','hard'),
  mk('lm-h1','Oldest Structure','Find the oldest building or structure on your route.','landmarks','hard'),
  mk('nature-h1','Ecosystem Survey','Document 5 species in a 10m radius — plant or animal.','nature','hard'),
  mk('nature-h2','Track Identification','Find and identify animal tracks or signs.','nature','hard'),
  mk('collect-h1','Seed Gathering','Collect seeds from 3 different tree species.','collection','hard'),
  mk('trivia-h1','History Challenge','Answer a hard history question about your city.','trivia','hard','none',{ data: { question: 'In what century was your city founded?', answers: ['16th','17th','18th','19th'], correct: 0 } }),
  mk('balance-h1','Balance Beam','Walk a narrow path or curb for 20 metres without stepping off.','balance','hard','accelerometer',{ sensorConfig: { threshold: 1.5 } }),
  mk('reaction-h1','Speed Snap','Photograph a moving object (bird, cyclist) within 3 seconds.','reaction','hard'),
  mk('obs-x1','Night Observer','At dusk, identify 5 constellations or night phenomena.','observation','extreme'),
  mk('photo-x1','Astrophotography','Capture a photo of the night sky with minimal light pollution.','photography','extreme'),
  mk('fit-x1','Endurance March','Walk 5 km without stopping at a fast pace.','fitness','extreme'),
  mk('fit-x2','Mountain Climb','Gain 100+ metres of elevation in a single climb.','fitness','extreme'),
  mk('puzzle-x1','Multi-Stage Riddle','Solve a 3-part riddle using clues from 3 different checkpoints.','puzzle','extreme'),
  mk('nav-x1','Dead Reckoning','Navigate 1 km using only compass and stride count — no GPS.','navigation','extreme','compass',{ sensorConfig: { targetHeading: 180, distance: 1000 } }),
  mk('nav-x2','Night Navigation','Navigate a route after dark using only a compass.','navigation','extreme','compass'),
  mk('lm-x1','Summit Marker','Reach the highest point visible from your start location.','landmarks','extreme'),
  mk('nature-x1','Biome Transition','Walk from one biome to another and document the change.','nature','extreme'),
  mk('balance-x1','Level Walk','Walk 50 metres on uneven terrain holding a balanced object.','balance','extreme','accelerometer',{ sensorConfig: { threshold: 2.0, duration: 50 } }),
  mk('balance-x2','Tightrope Challenge','Walk a fallen log or narrow beam for 30 metres.','balance','extreme','gyroscope',{ sensorConfig: { threshold: 1.0 } }),
  mk('reaction-x1','Lightning Strike','Photograph lightning or a sudden weather event.','reaction','extreme'),
  mk('team-x1','Relay Route','Complete a 2-stage relay with a partner, each walking 1 km.','team','extreme'),
]

export const challengesForGeneration = (d: Difficulty, cats: ChallengeCategory[], sa: SensorAvailability): ChallengeTemplate[] => {
  let pool = CHALLENGE_LIBRARY.filter(c => c.difficulty === d)
  if (cats.length > 0) pool = pool.filter(c => cats.includes(c.category))
  pool = pool.filter(c => c.sensorType === 'none' || (sa[c.sensorType] ?? false))
  return pool
}

export const ALL_CATEGORIES: { id: ChallengeCategory; label: string }[] = [
  { id: 'observation', label: 'Observation' }, { id: 'photography', label: 'Photography' }, { id: 'fitness', label: 'Fitness' },
  { id: 'puzzle', label: 'Puzzle' }, { id: 'memory', label: 'Memory' }, { id: 'navigation', label: 'Navigation' },
  { id: 'compass', label: 'Compass' }, { id: 'landmarks', label: 'Landmarks' }, { id: 'nature', label: 'Nature' },
  { id: 'collection', label: 'Collection' }, { id: 'trivia', label: 'Trivia' }, { id: 'timed', label: 'Timed' },
  { id: 'team', label: 'Team' }, { id: 'exploration', label: 'Exploration' }, { id: 'balance', label: 'Balance' },
  { id: 'reaction', label: 'Reaction' },
]

export const TOTAL_CHALLENGES = CHALLENGE_LIBRARY.length
