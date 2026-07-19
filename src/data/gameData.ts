import type {
  Adventure, ShopItem, Achievement, DailyReward, Challenge, Quest,
  ChallengeKind, ChallengeSpec, SensorType, GeneratorOptions, NearbyAdventure, GeoPoint,
} from '../types';
import { geocodeLocation, haversineKm, travelMinutes } from '../lib/geo';

export const ADVENTURES: Adventure[] = [
  {
    id: 'adv-riverside',
    title: 'Riverside Ramble',
    description: 'A gentle stroll along the river, taking in the sights and sounds of the waterfront.',
    difficulty: 'easy', durationMin: 30, distanceKm: 2.5,
    startLat: 51.5074, startLng: -0.1278,
    imageUrl: 'https://images.pexels.com/photos/103871/pexels-photo-103871.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['nature', 'waterfront', 'beginner'],
    locationName: 'Riverside Walk',
    quests: [
      { id: 'q1', type: 'checkpoint', title: 'Reach the boathouse', description: 'Walk to the old boathouse by the pier.', lat: 51.508, lng: -0.128, adventureId: 'adv-riverside', adventureTitle: 'Riverside Ramble' },
      { id: 'q2', type: 'challenge', title: 'Photo: water reflection', description: 'Snap a photo of the light reflecting on the water.', challenge: { kind: 'photography', title: 'Water Reflection', description: 'Capture the light dancing on the river.', sensor: 'camera' }, adventureId: 'adv-riverside', adventureTitle: 'Riverside Ramble' },
      { id: 'q3', type: 'distance', title: 'Walk 2 km', description: 'Cover at least 2 km on foot.', target: 2000, adventureId: 'adv-riverside', adventureTitle: 'Riverside Ramble' },
      { id: 'q4', type: 'challenge', title: 'Spot a waterbird', description: 'Find and identify a waterbird.', challenge: { kind: 'observation', title: 'Waterbird Watch', description: 'Spot a duck, heron, or swan along the river.' }, adventureId: 'adv-riverside', adventureTitle: 'Riverside Ramble' },
      { id: 'q5', type: 'checkpoint', title: 'Find the willow tree', description: 'Locate the ancient willow at the bend.', lat: 51.509, lng: -0.13, adventureId: 'adv-riverside', adventureTitle: 'Riverside Ramble' },
    ],
    rewards: { xp: 150, coins: 80, items: ['river-badge'], achievements: ['first-steps'] },
  },
  {
    id: 'adv-urban',
    title: 'Urban Explorer',
    description: 'Discover hidden street art and historic landmarks across the city centre.',
    difficulty: 'medium', durationMin: 60, distanceKm: 5,
    startLat: 51.5074, startLng: -0.1278,
    imageUrl: 'https://images.pexels.com/photos/1486577/pexels-photo-1486577.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['city', 'art', 'landmarks'],
    locationName: 'City Centre',
    quests: [
      { id: 'q1', type: 'checkpoint', title: 'Reach the mural', description: 'Find the giant mural on Bridge Street.', lat: 51.51, lng: -0.125, adventureId: 'adv-urban', adventureTitle: 'Urban Explorer' },
      { id: 'q2', type: 'challenge', title: 'Photo: street art', description: 'Photograph your favourite piece of street art.', challenge: { kind: 'photography', title: 'Street Art Snap', description: 'Capture a mural or graffiti piece.', sensor: 'camera' }, adventureId: 'adv-urban', adventureTitle: 'Urban Explorer' },
      { id: 'q3', type: 'distance', title: 'Walk 4 km', description: 'Cover at least 4 km.', target: 4000, adventureId: 'adv-urban', adventureTitle: 'Urban Explorer' },
      { id: 'q4', type: 'challenge', title: 'Landmark trivia', description: 'Answer a trivia question about a landmark you pass.', challenge: { kind: 'trivia', title: 'Landmark Trivia', description: 'When was the oldest building here constructed?' }, adventureId: 'adv-urban', adventureTitle: 'Urban Explorer' },
      { id: 'q5', type: 'challenge', title: 'Memory: street signs', description: 'Memorise the street names you cross.', challenge: { kind: 'memory', title: 'Street Sign Memory', description: 'Recall the last 3 street names you walked past.' }, adventureId: 'adv-urban', adventureTitle: 'Urban Explorer' },
      { id: 'q6', type: 'checkpoint', title: 'Historic square', description: 'Reach the old town square.', lat: 51.512, lng: -0.128, adventureId: 'adv-urban', adventureTitle: 'Urban Explorer' },
    ],
    rewards: { xp: 300, coins: 150, items: ['urban-badge'], achievements: ['explorer'] },
  },
  {
    id: 'adv-forest',
    title: 'Forest Trail Trek',
    description: 'A challenging trek through ancient woodland with rewarding summit views.',
    difficulty: 'hard', durationMin: 120, distanceKm: 10,
    startLat: 51.5074, startLng: -0.1278,
    imageUrl: 'https://images.pexels.com/photos/12715946/pexels-photo-12715946.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['nature', 'hiking', 'summit'],
    locationName: 'Ancient Forest',
    quests: [
      { id: 'q1', type: 'checkpoint', title: 'Reach the trailhead', description: 'Start at the marked trailhead.', lat: 51.51, lng: -0.13, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
      { id: 'q2', type: 'challenge', title: 'Identify a tree', description: 'Identify three different tree species.', challenge: { kind: 'nature', title: 'Tree ID', description: 'Find an oak, a birch, and a pine.' }, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
      { id: 'q3', type: 'distance', title: 'Walk 8 km', description: 'Cover at least 8 km of trail.', target: 8000, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
      { id: 'q4', type: 'challenge', title: 'Fitness: uphill power walk', description: 'Power-walk up the steepest section.', challenge: { kind: 'fitness', title: 'Uphill Power Walk', description: 'Maintain a brisk pace up the incline.' }, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
      { id: 'q5', type: 'checkpoint', title: 'Summit viewpoint', description: 'Reach the summit viewpoint.', lat: 51.515, lng: -0.135, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
      { id: 'q6', type: 'challenge', title: 'Puzzle: cairn count', description: 'Count the stone cairns along the trail.', challenge: { kind: 'puzzle', title: 'Cairn Count', description: 'How many stone cairns can you spot?' }, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
      { id: 'q7', type: 'challenge', title: 'Compass: find north', description: 'Use your phone compass to find north.', challenge: { kind: 'compass', title: 'Find North', description: 'Point your phone toward magnetic north.', sensor: 'compass' }, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
      { id: 'q8', type: 'challenge', title: 'Wildlife spot', description: 'Spot and log three types of wildlife.', challenge: { kind: 'observation', title: 'Wildlife Log', description: 'Record three different animals or birds.' }, adventureId: 'adv-forest', adventureTitle: 'Forest Trail Trek' },
    ],
    rewards: { xp: 600, coins: 300, items: ['forest-badge', 'trail-compass'], achievements: ['trailblazer'] },
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'cosmetic-1', name: 'Neon Trail', description: 'Glowing neon route line on the map.', price: 200, type: 'cosmetic' },
  { id: 'cosmetic-2', name: 'Golden Avatar Frame', description: 'A shiny gold frame for your avatar.', price: 350, type: 'cosmetic' },
  { id: 'boost-1', name: 'XP Booster', description: 'Double XP for your next adventure.', price: 150, type: 'boost' },
  { id: 'boost-2', name: 'Coin Magnet', description: '1.5x coins on your next adventure.', price: 180, type: 'boost' },
  { id: 'consumable-1', name: 'Lucky Charm', description: 'Reveals nearby checkpoints for 10 minutes.', price: 100, type: 'consumable' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', title: 'First Steps', description: 'Complete your first adventure.', icon: 'Footprints', unlocked: false },
  { id: 'explorer', title: 'Explorer', description: 'Complete 5 different adventures.', icon: 'Compass', unlocked: false, progress: 0, target: 5 },
  { id: 'trailblazer', title: 'Trailblazer', description: 'Complete a hard difficulty adventure.', icon: 'Mountain', unlocked: false },
  { id: 'social-walker', title: 'Social Walker', description: 'Complete an adventure with a party.', icon: 'Users', unlocked: false },
  { id: 'marathon', title: 'Marathon', description: 'Walk 42 km in total.', icon: 'Medal', unlocked: false, progress: 0, target: 42000 },
  { id: 'early-bird', title: 'Early Bird', description: 'Start an adventure before 7 AM.', icon: 'Sunrise', unlocked: false },
];

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, claimed: false, reward: { coins: 20 } },
  { day: 2, claimed: false, reward: { coins: 30 } },
  { day: 3, claimed: false, reward: { coins: 40, xp: 50 } },
  { day: 4, claimed: false, reward: { coins: 50 } },
  { day: 5, claimed: false, reward: { coins: 60, xp: 100 } },
  { day: 6, claimed: false, reward: { coins: 80 } },
  { day: 7, claimed: false, reward: { coins: 100, item: 'lucky-charm' } },
];

export const CHALLENGES: Challenge[] = [
  { id: 'ch1', title: 'Weekend Warrior', description: 'Complete 3 adventures this weekend.', progress: 0, target: 3, reward: { xp: 200, coins: 100 }, type: 'adventure_count', status: 'active' },
  { id: 'ch2', title: 'Distance Demon', description: 'Walk 20 km this week.', progress: 0, target: 20000, reward: { xp: 300, coins: 150 }, type: 'distance', status: 'active' },
  { id: 'ch3', title: 'Social Butterfly', description: 'Complete an adventure with 3 friends.', progress: 0, target: 3, reward: { xp: 250, coins: 120 }, type: 'social', status: 'active' },
];

export const AVATAR_EMOJIS = ['🧭', '🚶', '🏃', '🚴', '🏔️', '🌲', '🌊', '🌅', '🦊', '🦉', '🐢', '🦅'];
export const AVATAR_COLORS = ['#1c7af5', '#22d3ee', '#f59e0b', '#22c55e', '#ef4444', '#a855f7', '#ec4899', '#14b8a6'];

export const CHALLENGE_KINDS: ChallengeKind[] = [
  'observation', 'photography', 'fitness', 'puzzle', 'memory',
  'navigation', 'compass', 'landmark', 'nature', 'collection',
  'trivia', 'timed', 'team', 'exploration', 'balance', 'reaction',
  'motion', 'rotation', 'altitude', 'location', 'direction',
];

export const CHALLENGE_LABELS: Record<ChallengeKind, string> = {
  observation: 'Observation',
  photography: 'Photography',
  fitness: 'Fitness',
  puzzle: 'Puzzle',
  memory: 'Memory',
  navigation: 'Navigation',
  compass: 'Compass',
  landmark: 'Landmarks',
  nature: 'Nature',
  collection: 'Collection',
  trivia: 'Trivia',
  timed: 'Timed',
  team: 'Team',
  exploration: 'Exploration',
  balance: 'Balance',
  reaction: 'Reaction',
  motion: 'Motion',
  rotation: 'Rotation',
  altitude: 'Altitude',
  location: 'Location',
  direction: 'Direction',
};

export const SENSOR_LABELS: Record<SensorType, string> = {
  none: 'No sensor',
  accelerometer: 'Accelerometer',
  gyroscope: 'Gyroscope',
  compass: 'Compass',
  gps: 'GPS',
  camera: 'Camera',
  altitude: 'Barometer',
};

interface ChallengeTemplate {
  kind: ChallengeKind;
  sensor: SensorType;
  titles: string[];
  descs: string[];
  difficulties: Adventure['difficulty'][];
}

const CHALLENGE_LIBRARY: ChallengeTemplate[] = [
  { kind: 'observation', sensor: 'none', difficulties: ['easy', 'medium', 'hard', 'extreme'],
    titles: ['Spot the Detail', 'Eagle Eye', 'Keen Watch', 'Find the Unusual', 'Wildlife Log', 'Pattern Hunt'],
    descs: ['Find and identify something most people walk past.', 'Spot three details others would miss.', 'Observe your surroundings for 60 seconds and note what moves.', 'Locate something out of the ordinary on this stretch.', 'Record three different animals or birds you see.', 'Find a repeating pattern in the environment.'] },
  { kind: 'trivia', sensor: 'none', difficulties: ['easy', 'medium', 'hard', 'extreme'],
    titles: ['Local Trivia', 'History Question', 'Landmark Quiz', 'Fun Fact Check', 'Name That Tree', 'Date Detective'],
    descs: ['Answer a trivia question about this area.', 'When was the oldest nearby building constructed?', 'Name the landmark visible from here.', 'Find a plaque and answer: what year is on it?', 'Identify the tree species common in this area.', 'Find the date on the oldest sign you can spot.'] },
  { kind: 'photography', sensor: 'camera', difficulties: ['easy', 'medium', 'hard', 'extreme'],
    titles: ['Photo Stop', 'Snap the Scene', 'Capture the Moment', 'Frame It', 'Light & Shadow', 'Texture Shot', 'Colour Hunt'],
    descs: ['Take a photo of something that catches your eye.', 'Capture the best view from this point.', 'Photograph a texture or pattern in nature.', 'Frame a shot using natural surroundings.', 'Find an interesting play of light and shadow.', 'Photograph three different textures.', 'Capture five different colours in one photo.'] },
  { kind: 'puzzle', sensor: 'none', difficulties: ['medium', 'hard', 'extreme'],
    titles: ['Cairn Count', 'Step Estimate', 'Pattern Puzzle', 'Count the Windows', 'Estimate the Height', 'Logic Riddle', 'Multi-Stage Puzzle'],
    descs: ['Count the stone cairns along this section.', 'Estimate your step count to the next marker.', 'Find a repeating pattern and predict the next element.', 'Count the windows on the tallest nearby building.', 'Estimate the height of the tallest nearby tree.', 'Solve a riddle based on your surroundings.', 'Complete a three-stage puzzle using clues along the route.'] },
  { kind: 'memory', sensor: 'none', difficulties: ['medium', 'hard', 'extreme'],
    titles: ['Street Sign Memory', 'Recall the Route', 'Name Remember', 'Sequence Recall', 'Landmark Memory', 'Detail Recall'],
    descs: ['Recall the last 3 street names you walked past.', 'Remember the turns you took to get here.', 'Memorise names on plaques along the way.', 'Recall the order of landmarks you passed.', 'List the landmarks you saw in order.', 'Recall five details from the last 200 metres.'] },
  { kind: 'navigation', sensor: 'gps', difficulties: ['easy', 'medium', 'hard', 'extreme'],
    titles: ['Which Way', 'Route Plan', 'Orient Yourself', 'Shortest Path', 'Checkpoint Nav', 'Dead Reckoning'],
    descs: ['Identify which direction you are now facing.', 'Plan the shortest route to the next checkpoint.', 'Point toward your starting location.', 'Find the shortest path to the finish without backtracking.', 'Navigate to the next GPS checkpoint.', 'Estimate your position without looking at the map.'] },
  { kind: 'compass', sensor: 'compass', difficulties: ['medium', 'hard', 'extreme'],
    titles: ['Find North', 'Compass Check', 'Face a Heading', 'Turn 180°', 'Cardinal Directions', 'Bearing Match'],
    descs: ['Use your phone compass to find north.', 'Check your compass heading and report it.', 'Face exactly 45° on your compass.', 'Turn exactly 180° from your current heading.', 'Identify all four cardinal directions using your compass.', 'Walk on a bearing of 90° for 100 metres.'] },
  { kind: 'landmark', sensor: 'none', difficulties: ['easy', 'medium', 'hard', 'extreme'],
    titles: ['Find the Plaque', 'Oldest Building', 'Statue Spot', 'Bridge Hunt', 'Monument Visit', 'Hidden Marker'],
    descs: ['Locate and read a historical plaque.', 'Find the oldest building in view.', 'Spot a statue or sculpture nearby.', 'Find the nearest bridge or crossing.', 'Visit a monument or memorial.', 'Find a survey marker or boundary stone.'] },
  { kind: 'nature', sensor: 'none', difficulties: ['easy', 'medium', 'hard', 'extreme'],
    titles: ['Tree ID', 'Bird Call', 'Plant Spot', 'Insect Hunt', 'Leaf Collection', 'Ecosystem Survey'],
    descs: ['Identify three different tree species.', 'Listen for and identify two bird calls.', 'Find three different wild plant species.', 'Spot three different types of insect.', 'Collect three different leaf shapes.', 'Identify five species in this ecosystem.'] },
  { kind: 'collection', sensor: 'none', difficulties: ['easy', 'medium', 'hard'],
    titles: ['Leaf Collection', 'Photo Collection', 'Stone Shapes', 'Colour Hunt', 'Texture Gather', 'Sound Map'],
    descs: ['Collect five different leaves along the way.', 'Photograph five different textures.', 'Find stones in three different shapes.', 'Spot five different colours in nature.', 'Gather photos of three different surfaces.', 'Record five different sounds you hear.'] },
  { kind: 'timed', sensor: 'none', difficulties: ['medium', 'hard', 'extreme'],
    titles: ['Speed Section', 'Beat the Clock', 'Quick March', 'Timed Checkpoint', 'Sprint Goal', 'Rapid Transit'],
    descs: ['Reach the next checkpoint in under 5 minutes.', 'Complete this section before the timer runs out.', 'Walk briskly for the next 3 minutes.', 'Beat your best time to the next marker.', 'Sprint the final 100 metres.', 'Complete two checkpoints in under 10 minutes.'] },
  { kind: 'team', sensor: 'none', difficulties: ['medium', 'hard', 'extreme'],
    titles: ['Group Photo', 'Team Trivia', 'Sync Walk', 'Shared Discovery', 'Party Challenge', 'Group Decision'],
    descs: ['Take a group selfie at this point.', 'Answer a team trivia question together.', 'Walk in sync for 100 metres.', 'Find something everyone in the group agrees is interesting.', 'Complete a challenge as a team.', 'Reach consensus on the best view along this section.'] },
  { kind: 'exploration', sensor: 'none', difficulties: ['easy', 'medium', 'hard'],
    titles: ['Side Path', 'Hidden Corner', 'Off the Beaten Track', 'Secret Garden', 'Alley Adventure', 'Unknown Route'],
    descs: ['Take a side path you have not tried before.', 'Explore a corner others might skip.', 'Find a spot off the main route.', 'Discover a hidden garden or green space.', 'Wander down an interesting alley or lane.', 'Take a route you have never walked before.'] },
  { kind: 'balance', sensor: 'accelerometer', difficulties: ['hard', 'extreme'],
    titles: ['Balance Beam', 'Level Walk', 'Steady Phone', 'Tightrope Walk', 'Plank Hold'],
    descs: ['Keep your phone approximately vertical while walking 100 metres.', 'Keep your phone level while walking this section.', 'Hold your phone steady at 90° for 30 seconds while walking.', 'Walk a straight line keeping the phone vertical.', 'Walk with the phone flat for 50 metres without tilting.'] },
  { kind: 'reaction', sensor: 'accelerometer', difficulties: ['hard', 'extreme'],
    titles: ['Quick Stop', 'Sudden Turn', 'Reaction Test', 'Pace Change', 'Direction Switch'],
    descs: ['Walk briskly then stop immediately when prompted.', 'Make a sharp 90° turn without slowing first.', 'React to a signal by changing direction instantly.', 'Double your pace for 20 metres on signal.', 'Reverse direction in under 2 seconds when prompted.'] },
  { kind: 'motion', sensor: 'accelerometer', difficulties: ['medium', 'hard', 'extreme'],
    titles: ['Steady Pace', 'No Stopping', 'Smooth Walk', 'Constant Motion', 'Pace Keeper'],
    descs: ['Walk without stopping for the next 200 metres.', 'Maintain a walking pace for 3 minutes without pausing.', 'Walk smoothly avoiding sudden movements.', 'Keep moving continuously for 5 minutes.', 'Maintain a consistent pace for 300 metres.'] },
  { kind: 'rotation', sensor: 'gyroscope', difficulties: ['hard', 'extreme'],
    titles: ['Phone Rotation', 'Target Orientation', 'Spin and Walk', 'Angle Match', 'Rotation Sequence'],
    descs: ['Rotate your phone to match the target orientation shown.', 'Match your phone angle to three target orientations.', 'Rotate 360° while walking forward.', 'Tilt your phone to exactly 45° while walking.', 'Complete a sequence of three phone rotations in order.'] },
  { kind: 'altitude', sensor: 'altitude', difficulties: ['extreme'],
    titles: ['Climb Higher', 'Summit Push', 'Elevation Gain', 'Altitude Check', 'Descent Control'],
    descs: ['Reach a higher elevation than your starting point.', 'Gain at least 30 metres of elevation on this section.', 'Climb to a point 50 metres above your start.', 'Check and report your current altitude.', 'Descend 20 metres while keeping a steady pace.'] },
  { kind: 'location', sensor: 'gps', difficulties: ['easy', 'medium', 'hard', 'extreme'],
    titles: ['GPS Checkpoint', 'Precise Arrival', 'Location Lock', 'Waypoint Reach', 'Coordinate Match'],
    descs: ['Visit the precise GPS checkpoint shown on your map.', 'Arrive within 10 metres of the target coordinate.', 'Lock your GPS position at the marked waypoint.', 'Reach the next waypoint on your route.', 'Stand on the exact coordinate shown.'] },
  { kind: 'direction', sensor: 'compass', difficulties: ['medium', 'hard', 'extreme'],
    titles: ['Walk North', 'Eastward Bound', 'South Stretch', 'West Walk', 'Heading Hold'],
    descs: ['Walk north for 100 metres using your compass.', 'Walk east for 2 minutes maintaining heading.', 'Walk south until you reach the next landmark.', 'Walk west for 150 metres on a constant heading.', 'Maintain a heading of 180° for 100 metres.'] },
];

const DIFFICULTY_POOLS: Record<Adventure['difficulty'], ChallengeKind[]> = {
  easy: ['observation', 'trivia', 'navigation', 'landmark', 'nature', 'collection', 'exploration', 'location', 'photography'],
  medium: ['observation', 'trivia', 'photography', 'memory', 'navigation', 'compass', 'landmark', 'nature', 'collection', 'timed', 'team', 'exploration', 'motion', 'location', 'direction'],
  hard: ['photography', 'puzzle', 'memory', 'navigation', 'compass', 'timed', 'team', 'balance', 'reaction', 'motion', 'rotation', 'location', 'direction', 'landmark', 'nature'],
  extreme: ['puzzle', 'memory', 'compass', 'timed', 'team', 'balance', 'reaction', 'motion', 'rotation', 'altitude', 'location', 'direction', 'navigation', 'photography'],
};

const ADJECTIVES = ['Hidden', 'Secret', 'Mystic', 'Golden', 'Forgotten', 'Winding', 'Ancient', 'Crystal', 'Silver', 'Emerald', 'Whispering', 'Sunlit', 'Misty', 'Wildflower'];
const NOUNS = ['Garden Path', 'Canal Walk', 'Castle Trail', 'Park Loop', 'Hillside Stroll', 'Bridge Route', 'Market Mile', 'Lakeside Ramble', 'Forest Wander', 'Coastal Path', 'Meadow Walk', 'Ridge Trek', 'Cliff Walk', 'Valley Loop'];
const TAGS = ['nature', 'city', 'historic', 'waterfront', 'park', 'hills', 'market', 'relaxed', 'forest', 'coastal', 'garden', 'scenic'];

const POI_TYPES = [
  { type: 'Park', emoji: '🌳', tags: ['park', 'nature'] },
  { type: 'Riverside Walk', emoji: '🌊', tags: ['waterfront', 'nature'] },
  { type: 'Heritage Trail', emoji: '🏛️', tags: ['historic', 'landmark'] },
  { type: 'Lakeside Loop', emoji: '🏞️', tags: ['nature', 'waterfront'] },
  { type: 'Botanic Garden', emoji: '🌷', tags: ['garden', 'nature'] },
  { type: 'Coastal Path', emoji: '🏖️', tags: ['coastal', 'scenic'] },
  { type: 'Forest Reserve', emoji: '🌲', tags: ['forest', 'nature'] },
  { type: 'Hilltop Lookout', emoji: '⛰️', tags: ['scenic', 'hills'] },
  { type: 'Market Square', emoji: '🏪', tags: ['market', 'city'] },
  { type: 'Old Town Walk', emoji: '🏰', tags: ['historic', 'city'] },
  { type: 'Canal Towpath', emoji: '🚣', tags: ['waterfront', 'nature'] },
  { type: 'Cliff Walk', emoji: '🪨', tags: ['coastal', 'scenic'] },
  { type: 'Nature Reserve', emoji: '🦋', tags: ['nature', 'reserve'] },
  { type: 'Garden Estate', emoji: '🌹', tags: ['garden', 'scenic'] },
];

function pick<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)]; }
function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}
function round(n: number, dp = 5): number { const f = 10 ** dp; return Math.round(n * f) / f; }
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function challengeForKind(kind: ChallengeKind, rand: () => number): ChallengeSpec {
  const tmpl = CHALLENGE_LIBRARY.find((t) => t.kind === kind) ?? CHALLENGE_LIBRARY[0];
  const ti = Math.floor(rand() * tmpl.titles.length);
  const di = Math.floor(rand() * tmpl.descs.length);
  return { kind, title: tmpl.titles[ti], description: tmpl.descs[di], sensor: tmpl.sensor };
}

function buildChallengeSequence(
  kinds: ChallengeKind[], count: number, rand: () => number, difficulty: Adventure['difficulty'],
): ChallengeSpec[] {
  const pool = kinds.length
    ? kinds
    : DIFFICULTY_POOLS[difficulty];
  const out: ChallengeSpec[] = [];
  let lastKind: ChallengeKind | null = null;
  for (let i = 0; i < count; i++) {
    let choice = pick(pool, rand);
    let guard = 0;
    while (choice === lastKind && pool.length > 1 && guard < 10) { choice = pick(pool, rand); guard++; }
    lastKind = choice;
    out.push(challengeForKind(choice, rand));
  }
  return out;
}

function routePoints(startLat: number, startLng: number, count: number, rand: () => number): { lat: number; lng: number }[] {
  const pts: { lat: number; lng: number }[] = [];
  let lat = startLat, lng = startLng;
  let heading = rand() * Math.PI * 2;
  for (let i = 0; i < count; i++) {
    heading += (rand() - 0.5) * 1.2;
    const step = 0.003 + rand() * 0.004;
    lat += Math.cos(heading) * step;
    lng += Math.sin(heading) * step;
    pts.push({ lat: round(lat), lng: round(lng) });
  }
  return pts;
}

function difficultyMultiplier(d: Adventure['difficulty']): number {
  return d === 'easy' ? 1 : d === 'medium' ? 1.5 : d === 'hard' ? 2.2 : 3.2;
}

function chooseDifficulty(opts: GeneratorOptions, rand: () => number): Adventure['difficulty'] {
  if (opts.difficulty) return opts.difficulty;
  const roll = rand();
  return roll < 0.4 ? 'easy' : roll < 0.75 ? 'medium' : roll < 0.93 ? 'hard' : 'extreme';
}

function chooseDuration(opts: GeneratorOptions, rand: () => number): number {
  if (opts.durationMin) return opts.durationMin;
  const choices = [20, 30, 45, 60, 90, 120];
  return choices[Math.floor(rand() * choices.length)];
}

function chooseDistanceKm(opts: GeneratorOptions, durationMin: number, rand: () => number): number {
  if (opts.approxDistanceKm) return Math.max(0.5, round(opts.approxDistanceKm, 1));
  const baseKm = durationMin / 12;
  const jitter = 0.7 + rand() * 0.6;
  let km = round(baseKm * jitter, 1);
  if (opts.maxDistanceKm && km > opts.maxDistanceKm) km = Math.max(0.5, round(opts.maxDistanceKm, 1));
  if (opts.minDistanceKm && km < opts.minDistanceKm) km = round(opts.minDistanceKm + 0.5, 1);
  return Math.max(0.5, km);
}

function challengeCountForDuration(durationMin: number, diff: Adventure['difficulty']): number {
  const base = Math.max(3, Math.round(durationMin / 10));
  return Math.max(3, Math.round(base * (0.8 + difficultyMultiplier(diff) * 0.25)));
}

export async function resolveCenter(opts: GeneratorOptions, fallback: GeoPoint | null): Promise<{ center: GeoPoint; locationName: string; usedGPS: boolean }> {
  if (opts.center) {
    return { center: opts.center, locationName: 'Current location', usedGPS: true };
  }
  if (opts.location && opts.location.trim() && opts.location.trim().toLowerCase() !== 'near me') {
    const geo = await geocodeLocation(opts.location.trim());
    if (geo) {
      return { center: { lat: geo.lat, lng: geo.lng }, locationName: geo.displayName.split(',')[0], usedGPS: false };
    }
    return { center: fallback ?? { lat: 0, lng: 0 }, locationName: opts.location.trim(), usedGPS: false };
  }
  if (fallback) {
    return { center: fallback, locationName: 'Near you', usedGPS: true };
  }
  return { center: { lat: 0, lng: 0 }, locationName: 'Unknown', usedGPS: false };
}

export function generateAIAdventure(opts: GeneratorOptions, seed?: number): Adventure {
  const rand = rng(seed ?? Date.now());
  const id = `adv-ai-${Date.now()}-${Math.floor(rand() * 10000)}`;
  const title = `${pick(ADJECTIVES, rand)} ${pick(NOUNS, rand)}`;
  const difficulty = chooseDifficulty(opts, rand);
  const durationMin = chooseDuration(opts, rand);
  const distanceKm = chooseDistanceKm(opts, durationMin, rand);
  const diffMult = difficultyMultiplier(difficulty);

  const baseLat = opts.center?.lat ?? 0;
  const baseLng = opts.center?.lng ?? 0;

  const numCheckpoints = Math.max(2, Math.round(distanceKm / 1.5));
  const numChallenges = challengeCountForDuration(durationMin, difficulty);
  const route = routePoints(baseLat, baseLng, numCheckpoints + 1, rand);

  const preferredKinds = opts.challengeTypes && opts.challengeTypes.length ? opts.challengeTypes : DIFFICULTY_POOLS[difficulty];
  const challengeSpecs = buildChallengeSequence(preferredKinds, numChallenges, rand, difficulty);

  const quests: Quest[] = [];
  quests.push({
    id: 'q-start', type: 'checkpoint', title: 'Start here', description: 'Begin your adventure at this point.',
    lat: route[0].lat, lng: route[0].lng, adventureId: id, adventureTitle: title,
  });

  const totalSlots = route.length - 1;
  const challengeSlots = new Set<number>();
  if (numChallenges <= totalSlots) {
    const spacing = totalSlots / numChallenges;
    for (let i = 0; i < numChallenges; i++) {
      const slot = Math.min(totalSlots - 1, Math.round((i + 0.5) * spacing));
      challengeSlots.add(slot);
    }
  } else {
    for (let i = 0; i < numChallenges; i++) challengeSlots.add(i % totalSlots);
  }

  let chIdx = 0;
  for (let i = 1; i < route.length; i++) {
    const isFinish = i === route.length - 1;
    quests.push({
      id: `q-cp-${i}`, type: 'checkpoint',
      title: isFinish ? 'Finish point' : `Checkpoint ${i}`,
      description: isFinish ? 'You made it! End of the adventure.' : `Reach checkpoint ${i} on your route.`,
      lat: route[i].lat, lng: route[i].lng, adventureId: id, adventureTitle: title,
    });
    if (challengeSlots.has(i) && chIdx < challengeSpecs.length) {
      const spec = challengeSpecs[chIdx++];
      quests.push({
        id: `q-ch-${chIdx}`, type: 'challenge', title: spec.title, description: spec.description,
        challenge: spec, lat: route[i].lat, lng: route[i].lng, adventureId: id, adventureTitle: title,
      });
    }
  }

  while (chIdx < challengeSpecs.length) {
    const spec = challengeSpecs[chIdx];
    const anchor = route[Math.floor(rand() * route.length)];
    quests.push({
      id: `q-ch-${chIdx + 1}`, type: 'challenge', title: spec.title, description: spec.description,
      challenge: spec, lat: anchor.lat, lng: anchor.lng, adventureId: id, adventureTitle: title,
    });
    chIdx++;
  }

  quests.push({
    id: 'q-dist', type: 'distance', title: `Walk ${distanceKm} km`, description: `Cover at least ${distanceKm} km on foot.`,
    target: Math.round(distanceKm * 1000), adventureId: id, adventureTitle: title,
  });

  const xp = Math.round(distanceKm * 60 * diffMult);
  const coins = Math.round(distanceKm * 30 * diffMult);
  const items = [`${difficulty}-badge`];

  const locationName = opts.location?.trim() && opts.location.trim().toLowerCase() !== 'near me'
    ? opts.location.trim()
    : (opts.center ? 'Near you' : pick(POI_TYPES, rand).type);

  return {
    id, title,
    description: opts.prompt?.trim() || `A ${difficulty} walking adventure near ${locationName} with ${numChallenges} varied challenges and ${numCheckpoints} checkpoints.`,
    difficulty, durationMin, distanceKm, startLat: round(baseLat), startLng: round(baseLng),
    quests, rewards: { xp, coins, items },
    imageUrl: 'https://images.pexels.com/photos/3752878/pexels-photo-3752878.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: [pick(TAGS, rand), 'ai-generated', difficulty], creator: 'Zeviqo AI', aiGenerated: true,
    locationName,
  };
}

export function routePointsForAdventure(a: Adventure): GeoPoint[] {
  return a.quests.filter((q) => q.lat != null && q.lng != null).map((q) => ({ lat: q.lat!, lng: q.lng! }));
}

export function checkpointsForAdventure(a: Adventure): GeoPoint[] {
  return a.quests.filter((q) => q.type === 'checkpoint' && q.lat != null).map((q) => ({ lat: q.lat!, lng: q.lng! }));
}

export function challengesForAdventure(a: Adventure): { point: GeoPoint; kind: ChallengeKind; title: string; sensor?: SensorType }[] {
  return a.quests
    .filter((q) => q.type === 'challenge' && q.lat != null && q.challenge)
    .map((q) => ({ point: { lat: q.lat!, lng: q.lng! }, kind: q.challenge!.kind, title: q.challenge!.title, sensor: q.challenge!.sensor }));
}

export function suggestNearbyAdventures(userLocation: GeoPoint, count = 8): NearbyAdventure[] {
  const rand = rng(Math.floor(userLocation.lat * 1000 + userLocation.lng * 100) + 1);
  const out: NearbyAdventure[] = [];

  const tierCounts = {
    near: Math.round(count * 0.7),
    mid: Math.round(count * 0.2),
    far: Math.max(0, count - Math.round(count * 0.7) - Math.round(count * 0.2)),
  };

  const tiers = [
    { key: 'near', min: 0.3, max: 2.5, count: tierCounts.near },
    { key: 'mid', min: 2.5, max: 7.5, count: tierCounts.mid },
    { key: 'far', min: 7.5, max: 15.0, count: tierCounts.far },
  ];

  let idx = 0;
  for (const tier of tiers) {
    for (let i = 0; i < tier.count; i++) {
      const travelKm = round(tier.min + rand() * (tier.max - tier.min), 1);
      const travelMin = travelMinutes(travelKm);
      const bearing = rand() * Math.PI * 2;
      const latOffset = (travelKm / 111) * Math.cos(bearing);
      const lngOffset = (travelKm / (111 * Math.cos((userLocation.lat * Math.PI) / 180))) * Math.sin(bearing);
      const startLat = round(userLocation.lat + latOffset, 5);
      const startLng = round(userLocation.lng + lngOffset, 5);
      const poi = POI_TYPES[Math.floor(rand() * POI_TYPES.length)];
      const difficulty = rand() < 0.5 ? 'easy' : rand() < 0.8 ? 'medium' : rand() < 0.95 ? 'hard' : 'extreme';
      const durationMin = [20, 30, 45, 60, 90, 120][Math.floor(rand() * 6)];
      const distanceKm = round((durationMin / 12) * (0.8 + rand() * 0.4), 1);
      const diffMult = difficultyMultiplier(difficulty as Adventure['difficulty']);

      const numCheckpoints = Math.max(2, Math.round(distanceKm / 1.5));
      const numChallenges = challengeCountForDuration(durationMin, difficulty as Adventure['difficulty']);
      const route = routePoints(startLat, startLng, numCheckpoints + 1, rand);
      const preferredKinds = DIFFICULTY_POOLS[difficulty as Adventure['difficulty']];
      const challengeSpecs = buildChallengeSequence(preferredKinds, numChallenges, rand, difficulty as Adventure['difficulty']);

      const quests: Quest[] = [];
      quests.push({ id: `q-start-${idx}`, type: 'checkpoint', title: 'Start here', description: 'Begin at this point.', lat: route[0].lat, lng: route[0].lng });
      let chIdx = 0;
      for (let j = 1; j < route.length; j++) {
        const isFinish = j === route.length - 1;
        quests.push({ id: `q-cp-${idx}-${j}`, type: 'checkpoint', title: isFinish ? 'Finish point' : `Checkpoint ${j}`, description: isFinish ? 'End of the adventure.' : `Reach checkpoint ${j}.`, lat: route[j].lat, lng: route[j].lng });
        if (chIdx < challengeSpecs.length && (j === 1 || j === Math.floor(route.length / 2) || j === route.length - 1 || rand() < 0.4)) {
          const spec = challengeSpecs[chIdx++];
          quests.push({ id: `q-ch-${idx}-${chIdx}`, type: 'challenge', title: spec.title, description: spec.description, challenge: spec, lat: route[j].lat, lng: route[j].lng });
        }
      }
      while (chIdx < challengeSpecs.length) {
        const spec = challengeSpecs[chIdx];
        const anchor = route[Math.floor(rand() * route.length)];
        quests.push({ id: `q-ch-${idx}-${chIdx + 1}`, type: 'challenge', title: spec.title, description: spec.description, challenge: spec, lat: anchor.lat, lng: anchor.lng });
        chIdx++;
      }
      quests.push({ id: `q-dist-${idx}`, type: 'distance', title: `Walk ${distanceKm} km`, description: `Cover at least ${distanceKm} km.`, target: Math.round(distanceKm * 1000) });

      out.push({
        id: `nearby-${idx}-${Date.now()}`,
        title: `${poi.emoji} ${poi.type} ${pick(['Walk', 'Loop', 'Trail', 'Stroll', 'Ramble'], rand)}`,
        description: `A ${difficulty} ${durationMin}-minute walking adventure at ${poi.type}, about ${travelMin} minutes away.`,
        difficulty: difficulty as Adventure['difficulty'], durationMin, distanceKm,
        startLat, startLng, travelMin,
        imageUrl: 'https://images.pexels.com/photos/3752878/pexels-photo-3752878.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: poi.tags, quests,
        rewards: { xp: Math.round(distanceKm * 60 * diffMult), coins: Math.round(distanceKm * 30 * diffMult), items: [`${difficulty}-badge`] },
        locationName: poi.type,
      });
      idx++;
    }
  }
  return out.sort((a, b) => a.travelMin - b.travelMin);
}

export function nearbyToAdventure(n: NearbyAdventure): Adventure {
  return {
    id: n.id, title: n.title, description: n.description,
    difficulty: n.difficulty, durationMin: n.durationMin, distanceKm: n.distanceKm,
    startLat: n.startLat, startLng: n.startLng,
    quests: n.quests.map((q) => ({ ...q, adventureId: n.id, adventureTitle: n.title })),
    rewards: n.rewards, imageUrl: n.imageUrl, tags: n.tags,
    creator: 'Zeviqo', aiGenerated: false, locationName: n.locationName,
  };
}
