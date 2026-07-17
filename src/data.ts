// ============================================================
// Zeviqo Data Layer — Core Types, Game Data, Progression
// ============================================================

export const APP_NAME = 'Zeviqo';
export const APP_TAGLINE = 'Walking Adventures';

export type Screen =
  | 'landing' | 'onboarding' | 'home' | 'adventures' | 'adventure-detail'
  | 'adventure-preview' | 'adventure-map' | 'ai-generator' | 'challenges' | 'rewards' | 'community'
  | 'creator' | 'profile' | 'customise' | 'shop' | 'inventory' | 'seasonal'
  | 'settings' | 'friends' | 'party' | 'quests' | 'achievements' | 'daily-rewards' | 'history';

// --- Level / XP System ---
export interface LevelInfo {
  level: number; xp: number; xpForNext: number; xpIntoLevel: number; progress: number; title: string;
}

const LEVEL_TITLES = [
  'Wanderer','Explorer','Trailblazer','Pathfinder','Adventurer','Voyager','Pioneer','Trail Seeker','Journeyman','Cartographer',
  'Wayfinder','Nomad','Ranger','Scout','Guide','Trail Master','Expeditionist','Path Lord','Legend','Mythic Explorer',
];

export function getLevelInfo(totalXp: number): LevelInfo {
  const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
  const xpForCurrent = (level - 1) ** 2 * 100;
  const xpForNext = level ** 2 * 100;
  const xpIntoLevel = totalXp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  const progress = (xpIntoLevel / xpNeeded) * 100;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? 'Mythic Explorer';
  return { level, xp: totalXp, xpForNext, xpIntoLevel, progress, title };
}

export function xpForLevel(level: number): number { return (level - 1) ** 2 * 100; }

// --- Adventure Types ---
export type AdventureLength = '10-15' | '20-30' | '30-45' | '45-60' | '60+';
export type AdventureStylePref = 'explorer' | 'treasure_hunter' | 'relaxed' | 'fitness' | 'story' | 'challenge';
export type DifficultyPref = 'Relaxed' | 'Easy' | 'Medium' | 'Hard' | 'Extreme';
export type RewardPriority = 'xp' | 'coins' | 'exploration' | 'rare_items' | 'balanced';

export interface AdventurePreferences {
  length: AdventureLength; style: AdventureStylePref; difficulty: DifficultyPref; rewardPriority: RewardPriority;
}

export const LENGTH_OPTIONS = [
  { id: '10-15' as const, label: '10-15 min', icon: 'Zap' },
  { id: '20-30' as const, label: '20-30 min', icon: 'Clock' },
  { id: '30-45' as const, label: '30-45 min', icon: 'Clock' },
  { id: '45-60' as const, label: '45-60 min', icon: 'Clock' },
  { id: '60+' as const, label: '60+ min', icon: 'Mountain' },
];

export const STYLE_PREF_OPTIONS = [
  { id: 'explorer' as const, label: 'Explorer', icon: 'Compass', desc: 'Discover hidden routes' },
  { id: 'treasure_hunter' as const, label: 'Treasure Hunter', icon: 'Gem', desc: 'Find rare loot' },
  { id: 'relaxed' as const, label: 'Relaxed', icon: 'Leaf', desc: 'Easy-going walks' },
  { id: 'fitness' as const, label: 'Fitness', icon: 'Activity', desc: 'Push your limits' },
  { id: 'story' as const, label: 'Story', icon: 'BookOpen', desc: 'Narrative adventures' },
  { id: 'challenge' as const, label: 'Challenge', icon: 'Swords', desc: 'Test your skills' },
];

export const DIFFICULTY_PREF_OPTIONS = [
  { id: 'Relaxed' as const, label: 'Relaxed', icon: 'Leaf' },
  { id: 'Easy' as const, label: 'Easy', icon: 'Circle' },
  { id: 'Medium' as const, label: 'Medium', icon: 'Gauge' },
  { id: 'Hard' as const, label: 'Hard', icon: 'Flame' },
  { id: 'Extreme' as const, label: 'Extreme', icon: 'Zap' },
];

export const REWARD_PRIORITY_OPTIONS = [
  { id: 'xp' as const, label: 'XP', icon: 'Zap' },
  { id: 'coins' as const, label: 'Coins', icon: 'Coins' },
  { id: 'exploration' as const, label: 'Explore', icon: 'Compass' },
  { id: 'rare_items' as const, label: 'Rare', icon: 'Gem' },
  { id: 'balanced' as const, label: 'Balanced', icon: 'Scale' },
];

// --- Adventure Themes ---
export interface AdventureTheme {
  id: string; name: string; emoji: string; accent: string; terrain: string;
}

export const ADVENTURE_THEMES: AdventureTheme[] = [
  { id: 'forest', name: 'Forest Trail', emoji: '🌲', accent: '#22c55e', terrain: 'Forest' },
  { id: 'urban', name: 'Urban Explorer', emoji: '🏙️', accent: '#3b82f6', terrain: 'City Streets' },
  { id: 'coastal', name: 'Coastal Path', emoji: '🌊', accent: '#06b6d4', terrain: 'Coastline' },
  { id: 'mountain', name: 'Mountain Trek', emoji: '⛰️', accent: '#a78bfa', terrain: 'Mountain' },
  { id: 'park', name: 'Park Walk', emoji: '🌿', accent: '#84cc16', terrain: 'Park' },
  { id: 'mystery', name: 'Mystery Route', emoji: '🔍', accent: '#f59e0b', terrain: 'Unknown' },
  { id: 'night', name: 'Night Patrol', emoji: '🌙', accent: '#6366f1', terrain: 'Night City' },
  { id: 'riverside', name: 'Riverside Stroll', emoji: '🏞️', accent: '#0ea5e9', terrain: 'Riverside' },
  { id: 'historic', name: 'Historic Quarter', emoji: '🏛️', accent: '#d97706', terrain: 'Historic' },
  { id: 'sunset', name: 'Sunset Boulevard', emoji: '🌅', accent: '#f97316', terrain: 'Open Road' },
];

// --- Adventure Generation System ---
export type AdventureType =
  | 'treasure_hunt' | 'nature_walk' | 'mystery' | 'explorer_route'
  | 'speed_challenge' | 'scenic_walk' | 'fitness_adventure' | 'community_adventure';

export interface AdventureTypeMeta {
  id: AdventureType; label: string; emoji: string; icon: string; desc: string; baseXp: number; baseCoins: number;
}

export const ADVENTURE_TYPES: AdventureTypeMeta[] = [
  { id: 'treasure_hunt', label: 'Treasure Hunt', emoji: '💎', icon: 'Gem', desc: 'Find hidden treasures along the route', baseXp: 150, baseCoins: 80 },
  { id: 'nature_walk', label: 'Nature Walk', emoji: '🌿', icon: 'Leaf', desc: 'Enjoy the beauty of nature', baseXp: 100, baseCoins: 50 },
  { id: 'mystery', label: 'Mystery Adventure', emoji: '🔍', icon: 'Search', desc: 'An unpredictable journey awaits', baseXp: 200, baseCoins: 100 },
  { id: 'explorer_route', label: 'Explorer Route', emoji: '🧭', icon: 'Compass', desc: 'Discover new paths and landmarks', baseXp: 120, baseCoins: 60 },
  { id: 'speed_challenge', label: 'Speed Challenge', emoji: '⚡', icon: 'Zap', desc: 'Complete the route as fast as you can', baseXp: 180, baseCoins: 70 },
  { id: 'scenic_walk', label: 'Scenic Walk', emoji: '🌅', icon: 'Camera', desc: 'Take in beautiful views', baseXp: 110, baseCoins: 55 },
  { id: 'fitness_adventure', label: 'Fitness Adventure', emoji: '💪', icon: 'Activity', desc: 'Push your limits with tough terrain', baseXp: 250, baseCoins: 120 },
  { id: 'community_adventure', label: 'Community Adventure', emoji: '👥', icon: 'Users', desc: 'Walk together with friends', baseXp: 160, baseCoins: 90 },
];

// --- Adventure Definition ---
export interface AdventureObjective {
  id: string; label: string; icon: string; target: number; unit: string; type: 'distance' | 'time' | 'treasure' | 'speed' | 'landmark' | 'combo';
}

export interface RoutePoint { lat: number; lng: number }

export interface Adventure {
  id: string; name: string; emoji: string; difficulty: DifficultyPref;
  distanceKm: number; durationMin: number; theme: string; terrain: string;
  type: AdventureType; description: string;
  xpReward: number; coinReward: number; gemReward: number;
  caloriesEstimate: number; tags: string[];
  objectives: AdventureObjective[];
  isGenerated?: boolean; isFavorite?: boolean; createdAt?: number;
  routePreview?: RoutePoint[];
}

// --- Static Adventures (curated) ---
export const ADVENTURES: Adventure[] = [
  {
    id: 'forest-grove', name: 'Whispering Grove', emoji: '🌲', difficulty: 'Easy',
    distanceKm: 2.5, durationMin: 20, theme: 'forest', terrain: 'Forest', type: 'nature_walk',
    description: 'A gentle walk through ancient trees. Listen for the whispers of the forest.',
    xpReward: 120, coinReward: 50, gemReward: 0, caloriesEstimate: 120, tags: ['nature','relaxed'],
    objectives: [
      { id: 'obj1', label: 'Walk 2.5 km', icon: 'Footprints', target: 2500, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Find 3 forest treasures', icon: 'Gem', target: 3, unit: '', type: 'treasure' },
    ],
  },
  {
    id: 'urban-maze', name: 'Urban Maze', emoji: '🏙️', difficulty: 'Medium',
    distanceKm: 4.0, durationMin: 35, theme: 'urban', terrain: 'City Streets', type: 'explorer_route',
    description: 'Navigate the city streets and discover hidden urban gems.',
    xpReward: 200, coinReward: 80, gemReward: 1, caloriesEstimate: 200, tags: ['urban','exploration'],
    objectives: [
      { id: 'obj1', label: 'Walk 4 km', icon: 'Footprints', target: 4000, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Discover 5 landmarks', icon: 'MapPin', target: 5, unit: '', type: 'landmark' },
    ],
  },
  {
    id: 'coastal-breeze', name: 'Coastal Breeze', emoji: '🌊', difficulty: 'Easy',
    distanceKm: 3.0, durationMin: 25, theme: 'coastal', terrain: 'Coastline', type: 'scenic_walk',
    description: 'Feel the salty air as you walk along the scenic coastline.',
    xpReward: 150, coinReward: 60, gemReward: 0, caloriesEstimate: 150, tags: ['scenic','relaxed'],
    objectives: [
      { id: 'obj1', label: 'Walk 3 km', icon: 'Footprints', target: 3000, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Enjoy the view for 25 min', icon: 'Clock', target: 25, unit: 'min', type: 'time' },
    ],
  },
  {
    id: 'mountain-ascent', name: 'Mountain Ascent', emoji: '⛰️', difficulty: 'Hard',
    distanceKm: 6.5, durationMin: 55, theme: 'mountain', terrain: 'Mountain', type: 'fitness_adventure',
    description: 'Challenge yourself with a steep climb. The view is worth it.',
    xpReward: 350, coinReward: 150, gemReward: 2, caloriesEstimate: 400, tags: ['fitness','challenge'],
    objectives: [
      { id: 'obj1', label: 'Walk 6.5 km', icon: 'Footprints', target: 6500, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Reach the summit', icon: 'Mountain', target: 1, unit: '', type: 'landmark' },
      { id: 'obj3', label: 'Find 5 treasures', icon: 'Gem', target: 5, unit: '', type: 'treasure' },
    ],
  },
  {
    id: 'park-loop', name: 'Park Loop', emoji: '🌿', difficulty: 'Relaxed',
    distanceKm: 1.5, durationMin: 15, theme: 'park', terrain: 'Park', type: 'nature_walk',
    description: 'A peaceful loop through your local park. Perfect for a quick break.',
    xpReward: 80, coinReward: 30, gemReward: 0, caloriesEstimate: 75, tags: ['nature','quick'],
    objectives: [
      { id: 'obj1', label: 'Walk 1.5 km', icon: 'Footprints', target: 1500, unit: 'm', type: 'distance' },
    ],
  },
  {
    id: 'mystery-trail', name: 'Mystery Trail', emoji: '🔍', difficulty: 'Medium',
    distanceKm: 3.5, durationMin: 30, theme: 'mystery', terrain: 'Unknown', type: 'mystery',
    description: 'A route filled with hidden treasures and unexpected discoveries.',
    xpReward: 220, coinReward: 100, gemReward: 1, caloriesEstimate: 175, tags: ['treasure','exploration'],
    objectives: [
      { id: 'obj1', label: 'Walk 3.5 km', icon: 'Footprints', target: 3500, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Solve the mystery', icon: 'Search', target: 1, unit: '', type: 'landmark' },
      { id: 'obj3', label: 'Find 4 clues', icon: 'Gem', target: 4, unit: '', type: 'treasure' },
    ],
  },
  {
    id: 'night-patrol', name: 'Night Patrol', emoji: '🌙', difficulty: 'Hard',
    distanceKm: 5.0, durationMin: 45, theme: 'night', terrain: 'Night City', type: 'explorer_route',
    description: 'Explore the city after dark. Stay alert for rare nighttime treasures.',
    xpReward: 300, coinReward: 120, gemReward: 2, caloriesEstimate: 250, tags: ['night','challenge'],
    objectives: [
      { id: 'obj1', label: 'Walk 5 km', icon: 'Footprints', target: 5000, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Find 3 nighttime treasures', icon: 'Gem', target: 3, unit: '', type: 'treasure' },
      { id: 'obj3', label: 'Complete in under 45 min', icon: 'Zap', target: 45, unit: 'min', type: 'speed' },
    ],
  },
  {
    id: 'extreme-summit', name: 'Extreme Summit', emoji: '🏔️', difficulty: 'Extreme',
    distanceKm: 8.0, durationMin: 70, theme: 'mountain', terrain: 'Mountain', type: 'fitness_adventure',
    description: 'Only for the bravest explorers. A grueling trek to the peak.',
    xpReward: 500, coinReward: 250, gemReward: 3, caloriesEstimate: 500, tags: ['fitness','extreme'],
    objectives: [
      { id: 'obj1', label: 'Walk 8 km', icon: 'Footprints', target: 8000, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Reach the summit', icon: 'Mountain', target: 1, unit: '', type: 'landmark' },
      { id: 'obj3', label: 'Find 7 treasures', icon: 'Gem', target: 7, unit: '', type: 'treasure' },
      { id: 'obj4', label: 'Maintain 10x combo', icon: 'Zap', target: 10, unit: 'x', type: 'combo' },
    ],
  },
  {
    id: 'riverside-stroll', name: 'Riverside Stroll', emoji: '🏞️', difficulty: 'Relaxed',
    distanceKm: 2.0, durationMin: 20, theme: 'riverside', terrain: 'Riverside', type: 'scenic_walk',
    description: 'A calming walk along the river. Watch the water flow as you explore.',
    xpReward: 90, coinReward: 35, gemReward: 0, caloriesEstimate: 100, tags: ['scenic','relaxed'],
    objectives: [
      { id: 'obj1', label: 'Walk 2 km', icon: 'Footprints', target: 2000, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Find 2 riverside treasures', icon: 'Gem', target: 2, unit: '', type: 'treasure' },
    ],
  },
  {
    id: 'historic-quarter', name: 'Historic Quarter', emoji: '🏛️', difficulty: 'Medium',
    distanceKm: 3.0, durationMin: 30, theme: 'historic', terrain: 'Historic', type: 'explorer_route',
    description: 'Step back in time through the historic streets of the old quarter.',
    xpReward: 180, coinReward: 90, gemReward: 1, caloriesEstimate: 150, tags: ['historic','exploration'],
    objectives: [
      { id: 'obj1', label: 'Walk 3 km', icon: 'Footprints', target: 3000, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Discover 4 historic landmarks', icon: 'MapPin', target: 4, unit: '', type: 'landmark' },
    ],
  },
  {
    id: 'sunset-boulevard', name: 'Sunset Boulevard', emoji: '🌅', difficulty: 'Easy',
    distanceKm: 2.5, durationMin: 25, theme: 'sunset', terrain: 'Open Road', type: 'scenic_walk',
    description: 'Walk into the sunset along this scenic boulevard.',
    xpReward: 130, coinReward: 55, gemReward: 0, caloriesEstimate: 125, tags: ['scenic','sunset'],
    objectives: [
      { id: 'obj1', label: 'Walk 2.5 km', icon: 'Footprints', target: 2500, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Enjoy the sunset', icon: 'Sun', target: 1, unit: '', type: 'landmark' },
    ],
  },
  {
    id: 'speed-circuit', name: 'Speed Circuit', emoji: '⚡', difficulty: 'Hard',
    distanceKm: 4.5, durationMin: 30, theme: 'urban', terrain: 'City Streets', type: 'speed_challenge',
    description: 'A fast-paced circuit through the city. Beat the clock!',
    xpReward: 280, coinReward: 110, gemReward: 1, caloriesEstimate: 280, tags: ['fitness','speed'],
    objectives: [
      { id: 'obj1', label: 'Walk 4.5 km', icon: 'Footprints', target: 4500, unit: 'm', type: 'distance' },
      { id: 'obj2', label: 'Complete in under 30 min', icon: 'Zap', target: 30, unit: 'min', type: 'speed' },
      { id: 'obj3', label: 'Maintain 5x combo', icon: 'Zap', target: 5, unit: 'x', type: 'combo' },
    ],
  },
];

// --- Adventure Generator ---
export interface GenerationParams {
  playerLevel: number; walkingStreak: number; totalAdventures: number;
  recentTypes: AdventureType[]; playerCount: number; preferredDifficulty?: DifficultyPref;
  preferredLength?: AdventureLength; preferredStyle?: AdventureStylePref;
}

const ADJECTIVES = ['Hidden','Secret','Lost','Ancient','Golden','Mystic','Forgotten','Crystal','Emerald','Silver','Wandering','Endless','Twilight','Dawn','Midnight','Crimson','Azure','Radiant','Shadow','Frost','Silent','Roaring','Gentle','Wild','Sacred'];
const NOUNS = ['Path','Trail','Way','Route','Circuit','Loop','Journey','Quest','Expedition','Voyage','Trek','Hike','Walk','Stroll','Odyssey','Passage','Corridor','Labyrinth','Maze','Trail','Ridge','Valley','Canyon','Harbor','Garden'];

const OBJECTIVE_TEMPLATES: Record<AdventureType, Array<{ label: string; icon: string; type: AdventureObjective['type']; unit: string }>> = {
  treasure_hunt: [
    { label: 'Find {n} hidden treasures', icon: 'Gem', type: 'treasure', unit: '' },
    { label: 'Collect {n} rare gems', icon: 'Diamond', type: 'treasure', unit: '' },
    { label: 'Unlock {n} treasure chests', icon: 'Key', type: 'treasure', unit: '' },
    { label: 'Recover {n} lost artifacts', icon: 'Crown', type: 'treasure', unit: '' },
  ],
  nature_walk: [
    { label: 'Spot {n} wildlife species', icon: 'Bird', type: 'treasure', unit: '' },
    { label: 'Find {n} scenic viewpoints', icon: 'Mountain', type: 'landmark', unit: '' },
    { label: 'Identify {n} plant species', icon: 'Flower', type: 'treasure', unit: '' },
    { label: 'Reach {n} peaceful clearings', icon: 'Leaf', type: 'landmark', unit: '' },
  ],
  mystery: [
    { label: 'Solve the mystery', icon: 'Search', type: 'landmark', unit: '' },
    { label: 'Find {n} clues', icon: 'HelpCircle', type: 'treasure', unit: '' },
    { label: 'Uncover {n} secrets', icon: 'Eye', type: 'treasure', unit: '' },
    { label: 'Decode {n} cryptic messages', icon: 'MessageCircle', type: 'treasure', unit: '' },
  ],
  explorer_route: [
    { label: 'Discover {n} landmarks', icon: 'MapPin', type: 'landmark', unit: '' },
    { label: 'Explore {n} new areas', icon: 'Compass', type: 'landmark', unit: '' },
    { label: 'Uncover {n} hidden paths', icon: 'Route', type: 'landmark', unit: '' },
    { label: 'Map {n} uncharted zones', icon: 'Map', type: 'landmark', unit: '' },
  ],
  speed_challenge: [
    { label: 'Complete in under {n} minutes', icon: 'Zap', type: 'speed', unit: 'min' },
    { label: 'Maintain {n}x speed combo', icon: 'Activity', type: 'combo', unit: 'x' },
    { label: 'Beat the target pace of {n} min/km', icon: 'Gauge', type: 'speed', unit: 'min/km' },
    { label: 'Sprint {n} sections', icon: 'Wind', type: 'combo', unit: '' },
  ],
  scenic_walk: [
    { label: 'Capture {n} scenic photos', icon: 'Camera', type: 'treasure', unit: '' },
    { label: 'Visit {n} viewpoints', icon: 'Mountain', type: 'landmark', unit: '' },
    { label: 'Enjoy {n} peaceful moments', icon: 'Heart', type: 'landmark', unit: '' },
    { label: 'Find {n} hidden lookouts', icon: 'Eye', type: 'landmark', unit: '' },
  ],
  fitness_adventure: [
    { label: 'Reach the summit', icon: 'Mountain', type: 'landmark', unit: '' },
    { label: 'Maintain {n}x combo', icon: 'Zap', type: 'combo', unit: 'x' },
    { label: 'Complete {n} hill climbs', icon: 'TrendingUp', type: 'landmark', unit: '' },
    { label: 'Burn {n} calories', icon: 'Flame', type: 'combo', unit: '' },
  ],
  community_adventure: [
    { label: 'Walk together for {n} minutes', icon: 'Users', type: 'time', unit: 'min' },
    { label: 'Find {n} group treasures', icon: 'Gem', type: 'treasure', unit: '' },
    { label: 'Reach {n} meeting points', icon: 'MapPin', type: 'landmark', unit: '' },
    { label: 'Complete {n} team challenges', icon: 'Swords', type: 'landmark', unit: '' },
  ],
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function pick<T>(arr: T[], rng: () => number): T { return arr[Math.floor(rng() * arr.length)]; }

function difficultyMultiplier(diff: DifficultyPref): number {
  return { Relaxed: 0.8, Easy: 1.0, Medium: 1.3, Hard: 1.7, Extreme: 2.2 }[diff];
}

function lengthToMinutes(len: AdventureLength): number {
  return { '10-15': 12, '20-30': 25, '30-45': 37, '45-60': 52, '60+': 70 }[len];
}

function lengthToDistance(len: AdventureLength): number {
  return { '10-15': 1.5, '20-30': 2.5, '30-45': 4.0, '45-60': 5.5, '60+': 7.5 }[len];
}

function generateRoute(distanceKm: number, rng: () => number): RoutePoint[] {
  const points: RoutePoint[] = [];
  const numPoints = Math.max(6, Math.min(14, Math.floor(distanceKm * 1.8)));
  const baseLat = 51.5074 + (rng() - 0.5) * 0.05;
  const baseLng = -0.1278 + (rng() - 0.5) * 0.05;
  const angleStep = (Math.PI * 2) / numPoints;
  const radius = distanceKm * 0.004;

  for (let i = 0; i <= numPoints; i++) {
    const angle = angleStep * i;
    const wobble = (rng() - 0.5) * 0.35;
    const r = Math.max(0.001, radius * (1 + wobble));
    points.push({
      lat: baseLat + Math.sin(angle) * r,
      lng: baseLng + Math.cos(angle) * r,
    });
  }
  return points;
}

export function generateAdventure(params: GenerationParams): Adventure {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  const rng = seededRandom(seed);

  // Avoid repeating recent types
  const availableTypes = ADVENTURE_TYPES.filter(t => !params.recentTypes.includes(t.id));
  const typePool = availableTypes.length >= 3 ? availableTypes : ADVENTURE_TYPES;
  const typeMeta = pick(typePool, rng);

  // Difficulty: scale with player level + streak, allow override
  let difficulty: DifficultyPref;
  if (params.preferredDifficulty) {
    difficulty = params.preferredDifficulty;
  } else {
    const levelFactor = Math.min(params.playerLevel / 10, 1);
    const streakFactor = Math.min(params.walkingStreak / 20, 0.5);
    const score = levelFactor + streakFactor + rng() * 0.3;
    if (score < 0.3) difficulty = 'Relaxed';
    else if (score < 0.6) difficulty = 'Easy';
    else if (score < 0.9) difficulty = 'Medium';
    else if (score < 1.2) difficulty = 'Hard';
    else difficulty = 'Extreme';
  }

  // Length
  const length: AdventureLength = params.preferredLength ?? pick(LENGTH_OPTIONS, rng).id;
  const durationMin = lengthToMinutes(length);
  let distanceKm = lengthToDistance(length);
  distanceKm *= difficultyMultiplier(difficulty) * 0.85 + 0.15;
  distanceKm = Math.round(distanceKm * 10) / 10;

  // Theme
  const theme = pick(ADVENTURE_THEMES, rng);

  // Name
  const adj = pick(ADJECTIVES, rng);
  const noun = pick(NOUNS, rng);
  const name = `${adj} ${noun}`;

  // Rewards: scale with difficulty, distance, and player count
  const diffMult = difficultyMultiplier(difficulty);
  const distMult = distanceKm / 3;
  const playerBonus = 1 + (params.playerCount - 1) * 0.15;
  const xpReward = Math.round(typeMeta.baseXp * diffMult * distMult * playerBonus);
  const coinReward = Math.round(typeMeta.baseCoins * diffMult * distMult * playerBonus);
  const gemReward = Math.floor(diffMult * distMult * 0.5);

  // Calories
  const caloriesEstimate = Math.round(distanceKm * 50 * (difficulty === 'Hard' || difficulty === 'Extreme' ? 1.3 : 1.0));

  // Objectives: pick 2-3 unique templates
  const templates = OBJECTIVE_TEMPLATES[typeMeta.id];
  const numObjectives = Math.min(3, 2 + Math.floor(rng() * 2));
  const usedTemplates = new Set<number>();
  const objectives: AdventureObjective[] = [];

  objectives.push({
    id: 'obj-dist', label: `Walk ${distanceKm} km`, icon: 'Footprints',
    target: Math.round(distanceKm * 1000), unit: 'm', type: 'distance',
  });

  for (let i = 0; i < numObjectives - 1; i++) {
    let idx = Math.floor(rng() * templates.length);
    while (usedTemplates.has(idx) && usedTemplates.size < templates.length) {
      idx = (idx + 1) % templates.length;
    }
    usedTemplates.add(idx);
    const tmpl = templates[idx];
    const n = Math.max(1, Math.floor((2 + rng() * 4) * diffMult));
    objectives.push({
      id: `obj-${i}`, label: tmpl.label.replace('{n}', String(n)),
      icon: tmpl.icon, type: tmpl.type, unit: tmpl.unit, target: n,
    });
  }

  // Description
  const descriptions: Record<AdventureType, string[]> = {
    treasure_hunt: [
      'Search for hidden treasures scattered along this exciting route.',
      'Ancient treasures await discovery. Can you find them all?',
      'A legendary cache of treasures is rumored to be hidden along this path.',
      'Follow the clues to uncover a fortune in hidden gems.',
    ],
    nature_walk: [
      'Immerse yourself in nature. Breathe deep and enjoy the wild.',
      'A serene path through natural beauty. Listen to the birds.',
      'Connect with the outdoors on this refreshing nature walk.',
      'Wander through pristine wilderness on this tranquil trail.',
    ],
    mystery: [
      'An enigmatic route full of surprises. What will you uncover?',
      'Something strange is happening on this path. Investigate carefully.',
      'A mysterious adventure where nothing is quite as it seems.',
      'Decode the riddles and unravel the mystery of this route.',
    ],
    explorer_route: [
      'Chart unknown territory and discover what lies beyond the familiar.',
      'New landmarks await your discovery on this uncharted route.',
      'Explore the unexplored. Every corner holds something new.',
      'Blaze a trail through territory few have dared to explore.',
    ],
    speed_challenge: [
      'Push your pace and complete this circuit in record time!',
      'Race against the clock on this high-energy speed route.',
      'Fast feet, sharp focus. Beat your personal best!',
      'Every second counts on this thrilling speed challenge.',
    ],
    scenic_walk: [
      'Take in breathtaking views on this picturesque route.',
      'A visual feast awaits. Bring your camera and your sense of wonder.',
      'Stop and stare — this scenic walk is worth savoring.',
      'Beautiful vistas and stunning landscapes line this path.',
    ],
    fitness_adventure: [
      'Test your limits on this demanding course. Only the strong prevail.',
      'A grueling challenge for experienced explorers. Are you ready?',
      'Push through tough terrain and tough objectives. Prove yourself!',
      'Sweat, climb, and conquer on this intense fitness adventure.',
    ],
    community_adventure: [
      'Gather your friends and tackle this route together!',
      'A social adventure best enjoyed with company.',
      'Walk, talk, and explore together on this community route.',
      'Team up for shared treasures and group challenges.',
    ],
  };
  const desc = pick(descriptions[typeMeta.id], rng);

  const route = generateRoute(distanceKm, rng);

  return {
    id: `gen-${seed}`,
    name, emoji: typeMeta.emoji, difficulty,
    distanceKm, durationMin, theme: theme.id, terrain: theme.terrain,
    type: typeMeta.id, description: desc,
    xpReward, coinReward, gemReward, caloriesEstimate,
    tags: [theme.id, typeMeta.id, difficulty.toLowerCase()],
    objectives, isGenerated: true, createdAt: Date.now(),
    routePreview: route,
  };
}

// --- Quest System ---
export type QuestType = 'daily' | 'weekly';
export type QuestCategory = 'distance' | 'adventures' | 'coins' | 'xp' | 'streak' | 'challenges' | 'friends' | 'multiplayer';

export interface Quest {
  id: string; type: QuestType; category: QuestCategory;
  title: string; description: string; icon: string;
  target: number; unit: string; xpReward: number; coinReward: number; gemReward: number;
}

export const DAILY_QUESTS: Quest[] = [
  { id: 'd-walk-1km', type: 'daily', category: 'distance', title: 'Morning Walk', description: 'Walk 1 km today', icon: 'Footprints', target: 1000, unit: 'm', xpReward: 50, coinReward: 20, gemReward: 0 },
  { id: 'd-walk-3km', type: 'daily', category: 'distance', title: 'Distance Runner', description: 'Walk 3 km today', icon: 'Route', target: 3000, unit: 'm', xpReward: 100, coinReward: 40, gemReward: 1 },
  { id: 'd-adventure-1', type: 'daily', category: 'adventures', title: 'Daily Adventure', description: 'Complete 1 adventure', icon: 'Flag', target: 1, unit: '', xpReward: 80, coinReward: 30, gemReward: 0 },
  { id: 'd-coins-100', type: 'daily', category: 'coins', title: 'Coin Collector', description: 'Collect 100 coins today', icon: 'Coins', target: 100, unit: '', xpReward: 60, coinReward: 0, gemReward: 0 },
  { id: 'd-xp-200', type: 'daily', category: 'xp', title: 'XP Grinder', description: 'Earn 200 XP today', icon: 'Zap', target: 200, unit: '', xpReward: 0, coinReward: 50, gemReward: 1 },
  { id: 'd-challenge-1', type: 'daily', category: 'challenges', title: 'Challenge Taker', description: 'Complete 1 challenge', icon: 'Swords', target: 1, unit: '', xpReward: 70, coinReward: 25, gemReward: 0 },
];

export const WEEKLY_QUESTS: Quest[] = [
  { id: 'w-walk-15km', type: 'weekly', category: 'distance', title: 'Weekly Wanderer', description: 'Walk 15 km this week', icon: 'Footprints', target: 15000, unit: 'm', xpReward: 300, coinReward: 150, gemReward: 2 },
  { id: 'w-adventures-5', type: 'weekly', category: 'adventures', title: 'Adventure Seeker', description: 'Complete 5 adventures this week', icon: 'Compass', target: 5, unit: '', xpReward: 400, coinReward: 200, gemReward: 3 },
  { id: 'w-coins-500', type: 'weekly', category: 'coins', title: 'Treasure Hunter', description: 'Collect 500 coins this week', icon: 'Gem', target: 500, unit: '', xpReward: 250, coinReward: 0, gemReward: 2 },
  { id: 'w-streak-5', type: 'weekly', category: 'streak', title: 'Consistency King', description: 'Maintain a 5-day walking streak', icon: 'Flame', target: 5, unit: ' days', xpReward: 350, coinReward: 100, gemReward: 3 },
  { id: 'w-multiplayer-2', type: 'weekly', category: 'multiplayer', title: 'Party Animal', description: 'Complete 2 multiplayer adventures', icon: 'Users', target: 2, unit: '', xpReward: 300, coinReward: 150, gemReward: 2 },
  { id: 'w-friends-3', type: 'weekly', category: 'friends', title: 'Social Butterfly', description: 'Add 3 friends this week', icon: 'UserPlus', target: 3, unit: '', xpReward: 200, coinReward: 100, gemReward: 1 },
];

// --- Achievement System ---
export type AchievementCategory = 'distance' | 'adventures' | 'streaks' | 'friends' | 'multiplayer' | 'coins' | 'xp' | 'challenges';

export interface Achievement {
  id: string; category: AchievementCategory; title: string; description: string;
  icon: string; target: number; unit: string; xpReward: number; gemReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'dist-1km', category: 'distance', title: 'First Steps', description: 'Walk 1 km total', icon: 'Footprints', target: 1000, unit: 'm', xpReward: 50, gemReward: 1 },
  { id: 'dist-10km', category: 'distance', title: 'Trail Walker', description: 'Walk 10 km total', icon: 'Route', target: 10000, unit: 'm', xpReward: 150, gemReward: 2 },
  { id: 'dist-50km', category: 'distance', title: 'Pathfinder', description: 'Walk 50 km total', icon: 'MapPin', target: 50000, unit: 'm', xpReward: 400, gemReward: 5 },
  { id: 'dist-100km', category: 'distance', title: 'Cartographer', description: 'Walk 100 km total', icon: 'Map', target: 100000, unit: 'm', xpReward: 800, gemReward: 10 },
  { id: 'dist-500km', category: 'distance', title: 'Legend', description: 'Walk 500 km total', icon: 'Mountain', target: 500000, unit: 'm', xpReward: 2000, gemReward: 25 },
  { id: 'adv-1', category: 'adventures', title: 'Adventure Begins', description: 'Complete your first adventure', icon: 'Flag', target: 1, unit: '', xpReward: 50, gemReward: 1 },
  { id: 'adv-10', category: 'adventures', title: 'Seasoned Explorer', description: 'Complete 10 adventures', icon: 'Compass', target: 10, unit: '', xpReward: 200, gemReward: 3 },
  { id: 'adv-50', category: 'adventures', title: 'Adventure Veteran', description: 'Complete 50 adventures', icon: 'Award', target: 50, unit: '', xpReward: 600, gemReward: 8 },
  { id: 'adv-100', category: 'adventures', title: 'Centurion', description: 'Complete 100 adventures', icon: 'Trophy', target: 100, unit: '', xpReward: 1500, gemReward: 15 },
  { id: 'streak-3', category: 'streaks', title: 'Getting Started', description: 'Maintain a 3-day streak', icon: 'Flame', target: 3, unit: ' days', xpReward: 100, gemReward: 2 },
  { id: 'streak-7', category: 'streaks', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'Flame', target: 7, unit: ' days', xpReward: 250, gemReward: 4 },
  { id: 'streak-30', category: 'streaks', title: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'Zap', target: 30, unit: ' days', xpReward: 1000, gemReward: 12 },
  { id: 'streak-100', category: 'streaks', title: 'Eternal Flame', description: 'Maintain a 100-day streak', icon: 'Crown', target: 100, unit: ' days', xpReward: 5000, gemReward: 50 },
  { id: 'friends-1', category: 'friends', title: 'Friendly', description: 'Add your first friend', icon: 'UserPlus', target: 1, unit: '', xpReward: 50, gemReward: 1 },
  { id: 'friends-5', category: 'friends', title: 'Social Circle', description: 'Add 5 friends', icon: 'Users', target: 5, unit: '', xpReward: 200, gemReward: 3 },
  { id: 'friends-20', category: 'friends', title: 'Popular', description: 'Add 20 friends', icon: 'Heart', target: 20, unit: '', xpReward: 500, gemReward: 8 },
  { id: 'mp-1', category: 'multiplayer', title: 'Party Starter', description: 'Complete 1 multiplayer adventure', icon: 'Users', target: 1, unit: '', xpReward: 100, gemReward: 2 },
  { id: 'mp-10', category: 'multiplayer', title: 'Team Player', description: 'Complete 10 multiplayer adventures', icon: 'Users', target: 10, unit: '', xpReward: 400, gemReward: 6 },
  { id: 'mp-25', category: 'multiplayer', title: 'Party Legend', description: 'Complete 25 multiplayer adventures', icon: 'Crown', target: 25, unit: '', xpReward: 1000, gemReward: 15 },
  { id: 'coins-500', category: 'coins', title: 'Pocket Change', description: 'Earn 500 coins total', icon: 'Coins', target: 500, unit: '', xpReward: 100, gemReward: 2 },
  { id: 'coins-5000', category: 'coins', title: 'Coin Hoarder', description: 'Earn 5,000 coins total', icon: 'Gem', target: 5000, unit: '', xpReward: 400, gemReward: 5 },
  { id: 'coins-25000', category: 'coins', title: 'Treasure Vault', description: 'Earn 25,000 coins total', icon: 'Banknote', target: 25000, unit: '', xpReward: 1200, gemReward: 15 },
  { id: 'xp-1000', category: 'xp', title: 'Rising Star', description: 'Earn 1,000 XP total', icon: 'Star', target: 1000, unit: '', xpReward: 0, gemReward: 3 },
  { id: 'xp-10000', category: 'xp', title: 'XP Master', description: 'Earn 10,000 XP total', icon: 'TrendingUp', target: 10000, unit: '', xpReward: 0, gemReward: 10 },
  { id: 'xp-50000', category: 'xp', title: 'XP Legend', description: 'Earn 50,000 XP total', icon: 'Sparkles', target: 50000, unit: '', xpReward: 0, gemReward: 25 },
  { id: 'chal-5', category: 'challenges', title: 'Challenger', description: 'Complete 5 challenges', icon: 'Swords', target: 5, unit: '', xpReward: 150, gemReward: 2 },
  { id: 'chal-25', category: 'challenges', title: 'Challenge Master', description: 'Complete 25 challenges', icon: 'Swords', target: 25, unit: '', xpReward: 500, gemReward: 8 },
  { id: 'chal-100', category: 'challenges', title: 'Challenge Grandmaster', description: 'Complete 100 challenges', icon: 'Crown', target: 100, unit: '', xpReward: 1500, gemReward: 20 },
];

// --- Daily Login Rewards ---
export interface DailyReward { day: number; coins: number; gems: number; xp: number; label: string }

export const DAILY_LOGIN_REWARDS: DailyReward[] = [
  { day: 1, coins: 50, gems: 0, xp: 20, label: 'Day 1' },
  { day: 2, coins: 75, gems: 0, xp: 30, label: 'Day 2' },
  { day: 3, coins: 100, gems: 1, xp: 50, label: 'Day 3' },
  { day: 4, coins: 125, gems: 0, xp: 60, label: 'Day 4' },
  { day: 5, coins: 150, gems: 1, xp: 80, label: 'Day 5' },
  { day: 6, coins: 200, gems: 2, xp: 100, label: 'Day 6' },
  { day: 7, coins: 500, gems: 5, xp: 250, label: 'Week Bonus!' },
];

// --- Challenges ---
export interface Challenge {
  id: string; title: string; description: string; icon: string;
  xpReward: number; coinReward: number; difficulty: DifficultyPref;
}

export const CHALLENGES: Challenge[] = [
  { id: 'speed-1', title: 'Speed Demon', description: 'Complete an adventure in under 15 minutes', icon: 'Zap', xpReward: 100, coinReward: 50, difficulty: 'Medium' },
  { id: 'treasure-3', title: 'Treasure Hunter', description: 'Find 3 treasures in one adventure', icon: 'Gem', xpReward: 120, coinReward: 60, difficulty: 'Medium' },
  { id: 'no-rest', title: 'Unstoppable', description: 'Complete an adventure without pausing', icon: 'Activity', xpReward: 80, coinReward: 40, difficulty: 'Easy' },
  { id: 'night-owl', title: 'Night Owl', description: 'Complete an adventure after 8 PM', icon: 'Moon', xpReward: 100, coinReward: 50, difficulty: 'Medium' },
  { id: 'early-bird', title: 'Early Bird', description: 'Complete an adventure before 7 AM', icon: 'Sunrise', xpReward: 100, coinReward: 50, difficulty: 'Medium' },
  { id: 'long-haul', title: 'Long Haul', description: 'Complete an adventure longer than 45 minutes', icon: 'Mountain', xpReward: 150, coinReward: 75, difficulty: 'Hard' },
];

// --- Loading Tips ---
export const LOADING_TIPS = [
  'Walking with friends earns bonus XP!',
  'Daily streaks multiply your rewards!',
  'Check your quests before starting an adventure!',
  'Treasures are more common in harder adventures!',
  'Level up to unlock new adventure types!',
  'Multiplayer adventures give extra coins!',
  'Don\'t break your streak — walk every day!',
  'Weekly quests reset every Monday!',
  'Higher difficulty means better rewards!',
  'Use gems to unlock rare cosmetic items!',
  'Generated adventures adapt to your level!',
  'Longer adventures give proportionally more rewards!',
  'Zeviqo adventures are never the same twice!',
];

// --- Combo System ---
export function getComboTier(combo: number): { name: string; multiplier: number; color: string } {
  if (combo >= 20) return { name: 'Mythic', multiplier: 3.0, color: '#f59e0b' };
  if (combo >= 15) return { name: 'Legendary', multiplier: 2.5, color: '#a78bfa' };
  if (combo >= 10) return { name: 'Epic', multiplier: 2.0, color: '#7a45ff' };
  if (combo >= 5) return { name: 'Rare', multiplier: 1.5, color: '#3dd4ff' };
  if (combo >= 2) return { name: 'Common', multiplier: 1.2, color: '#22d3ee' };
  return { name: 'None', multiplier: 1.0, color: '#ffffff' };
}

// --- Cosmetic System ---
export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export const COSMETIC_RARITY_MAP: Record<CosmeticRarity, { color: string; label: string; glow: string }> = {
  common: { color: 'text-white/60', label: 'Common', glow: '' },
  rare: { color: 'text-zeviqo-300', label: 'Rare', glow: 'shadow-[0_0_10px_rgba(61,212,255,0.3)]' },
  epic: { color: 'text-plasma-300', label: 'Epic', glow: 'shadow-[0_0_10px_rgba(122,69,255,0.3)]' },
  legendary: { color: 'text-gold-300', label: 'Legendary', glow: 'shadow-[0_0_15px_rgba(255,204,26,0.4)]' },
  mythic: { color: 'text-ember-300', label: 'Mythic', glow: 'shadow-[0_0_20px_rgba(255,133,39,0.5)]' },
};

export interface CosmeticItem { id: string; name: string; emoji: string; rarity: CosmeticRarity; price: number; category: 'avatar' | 'trail' | 'frame' | 'effect' }

export const SHOP_ITEMS: CosmeticItem[] = [
  { id: 'avatar-fox', name: 'Fox', emoji: '🦊', rarity: 'common', price: 100, category: 'avatar' },
  { id: 'avatar-cat', name: 'Cat', emoji: '🐱', rarity: 'common', price: 100, category: 'avatar' },
  { id: 'avatar-owl', name: 'Owl', emoji: '🦉', rarity: 'rare', price: 300, category: 'avatar' },
  { id: 'avatar-dragon', name: 'Dragon', emoji: '🐉', rarity: 'epic', price: 800, category: 'avatar' },
  { id: 'avatar-unicorn', name: 'Unicorn', emoji: '🦄', rarity: 'legendary', price: 2000, category: 'avatar' },
  { id: 'avatar-phoenix', name: 'Phoenix', emoji: '🔥', rarity: 'mythic', price: 5000, category: 'avatar' },
  { id: 'trail-stars', name: 'Star Trail', emoji: '✨', rarity: 'rare', price: 250, category: 'trail' },
  { id: 'trail-fire', name: 'Fire Trail', emoji: '🔥', rarity: 'epic', price: 600, category: 'trail' },
  { id: 'trail-rainbow', name: 'Rainbow Trail', emoji: '🌈', rarity: 'legendary', price: 1500, category: 'trail' },
  { id: 'frame-gold', name: 'Gold Frame', emoji: '🟡', rarity: 'rare', price: 200, category: 'frame' },
  { id: 'frame-plasma', name: 'Plasma Frame', emoji: '🟣', rarity: 'epic', price: 500, category: 'frame' },
  { id: 'effect-sparkle', name: 'Sparkle Effect', emoji: '💫', rarity: 'epic', price: 700, category: 'effect' },
];
