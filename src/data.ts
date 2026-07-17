export const APP_NAME = 'Zeviqo';
export const APP_TAGLINE = 'Turn every walk into an adventure';

export type AdventureType =
  | 'treasure_hunt' | 'nature_walk' | 'mystery' | 'explorer_route'
  | 'speed_challenge' | 'scenic_walk' | 'fitness_adventure' | 'community_adventure';

export type Difficulty = 'relaxed' | 'easy' | 'medium' | 'hard' | 'extreme';

export type Adventure = {
  id: string;
  type: AdventureType;
  title: string;
  description: string;
  difficulty: Difficulty;
  distance: number;
  duration: number;
  calories: number;
  xp: number;
  coins: number;
  gems: number;
  emoji: string;
  theme: string;
  objectives: string[];
  route: { x: number; y: number }[];
  terrain: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  xpReward: number;
  coinReward: number;
  metric: 'distance' | 'steps' | 'adventures' | 'treasures' | 'streak' | 'challenges';
  icon: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'exploration' | 'fitness' | 'social' | 'collection' | 'milestones';
  requirement: number;
  metric: 'distance' | 'adventures' | 'streak' | 'treasures' | 'challenges' | 'level' | 'friends';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  coinReward: number;
  icon: string;
};

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'avatar' | 'trail' | 'badge' | 'boost';
};

export type DailyReward = {
  day: number;
  coins: number;
  gems: number;
  xp: number;
  item?: string;
};

export const ADVENTURE_TYPES: { type: AdventureType; label: string; emoji: string; description: string; color: string }[] = [
  { type: 'treasure_hunt', label: 'Treasure Hunt', emoji: '🗺️', description: 'Follow clues to find hidden treasures', color: '#f5b800' },
  { type: 'nature_walk', label: 'Nature Walk', emoji: '🌿', description: 'Explore parks and natural trails', color: '#22c55e' },
  { type: 'mystery', label: 'Mystery', emoji: '🔍', description: 'Solve puzzles while you walk', color: '#7a45ff' },
  { type: 'explorer_route', label: 'Explorer Route', emoji: '🧭', description: 'Discover new areas and landmarks', color: '#00c4ff' },
  { type: 'speed_challenge', label: 'Speed Challenge', emoji: '⚡', description: 'Race against the clock', color: '#ff6b00' },
  { type: 'scenic_walk', label: 'Scenic Walk', emoji: '📸', description: 'Beautiful views and photo spots', color: '#ec4899' },
  { type: 'fitness_adventure', label: 'Fitness Adventure', emoji: '💪', description: 'Burn calories with interval walking', color: '#ef4444' },
  { type: 'community_adventure', label: 'Community Adventure', emoji: '🤝', description: 'Walk with friends and neighbors', color: '#3dd4ff' }
];

export const THEMES = [
  'Forest Trail', 'Urban Streets', 'Coastal Path', 'Mountain Pass',
  'City Park', 'Riverside Walk', 'Historic District', 'Botanical Garden',
  'Lakeside Loop', 'Neighborhood Quest'
];

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  relaxed: 0.8, easy: 1.0, medium: 1.3, hard: 1.7, extreme: 2.2
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  relaxed: 'Relaxed', easy: 'Easy', medium: 'Medium', hard: 'Hard', extreme: 'Extreme'
};

export const COMBO_TIERS = [
  { name: 'Common', min: 1, multiplier: 1.2, color: '#9ca3af' },
  { name: 'Uncommon', min: 3, multiplier: 1.5, color: '#22c55e' },
  { name: 'Rare', min: 5, multiplier: 1.8, color: '#00c4ff' },
  { name: 'Epic', min: 8, multiplier: 2.2, color: '#7a45ff' },
  { name: 'Legendary', min: 12, multiplier: 2.5, color: '#f5b800' },
  { name: 'Mythic', min: 18, multiplier: 3.0, color: '#ff6b00' }
];

export const COSMETIC_RARITY_MAP = {
  common: { label: 'Common', color: 'text-white/60', glow: '' },
  rare: { label: 'Rare', color: 'text-cyan-300', glow: 'shadow-[0_0_15px_rgba(0,196,255,0.3)]' },
  epic: { label: 'Epic', color: 'text-plasma-300', glow: 'shadow-[0_0_15px_rgba(122,69,255,0.3)]' },
  legendary: { label: 'Legendary', color: 'text-gold-300', glow: 'shadow-[0_0_20px_rgba(245,184,0,0.4)]' }
};

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 100, gems: 0, xp: 50 },
  { day: 2, coins: 150, gems: 0, xp: 75 },
  { day: 3, coins: 200, gems: 1, xp: 100 },
  { day: 4, coins: 250, gems: 0, xp: 125 },
  { day: 5, coins: 300, gems: 2, xp: 150 },
  { day: 6, coins: 400, gems: 0, xp: 200 },
  { day: 7, coins: 500, gems: 5, xp: 300, item: 'Mystery Chest' }
];

export const DAILY_QUESTS: Quest[] = [
  { id: 'dq1', title: 'Morning Walker', description: 'Walk 1 km today', type: 'daily', target: 1, xpReward: 50, coinReward: 100, metric: 'distance', icon: 'Sunrise' },
  { id: 'dq2', title: 'Step Master', description: 'Reach 5,000 steps', type: 'daily', target: 5000, xpReward: 75, coinReward: 150, metric: 'steps', icon: 'Footprints' },
  { id: 'dq3', title: 'Adventure Seeker', description: 'Complete 1 adventure', type: 'daily', target: 1, xpReward: 100, coinReward: 200, metric: 'adventures', icon: 'Compass' },
  { id: 'dq4', title: 'Treasure Hunter', description: 'Find 3 treasures', type: 'daily', target: 3, xpReward: 60, coinReward: 120, metric: 'treasures', icon: 'Gem' }
];

export const WEEKLY_QUESTS: Quest[] = [
  { id: 'wq1', title: 'Week Explorer', description: 'Walk 10 km this week', type: 'weekly', target: 10, xpReward: 300, coinReward: 500, metric: 'distance', icon: 'Mountain' },
  { id: 'wq2', title: 'Consistency King', description: 'Maintain a 7-day streak', type: 'weekly', target: 7, xpReward: 500, coinReward: 800, metric: 'streak', icon: 'Flame' },
  { id: 'wq3', title: 'Challenge Champion', description: 'Complete 5 challenges', type: 'weekly', target: 5, xpReward: 400, coinReward: 600, metric: 'challenges', icon: 'Trophy' },
  { id: 'wq4', title: 'Adventure Marathon', description: 'Complete 5 adventures', type: 'weekly', target: 5, xpReward: 350, coinReward: 550, metric: 'adventures', icon: 'Map' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Steps', description: 'Complete your first adventure', icon: 'Footprints', category: 'milestones', requirement: 1, metric: 'adventures', tier: 'bronze' },
  { id: 'a2', title: 'Getting Started', description: 'Complete 5 adventures', icon: 'Compass', category: 'milestones', requirement: 5, metric: 'adventures', tier: 'bronze' },
  { id: 'a3', title: 'Seasoned Explorer', description: 'Complete 25 adventures', icon: 'Map', category: 'milestones', requirement: 25, metric: 'adventures', tier: 'silver' },
  { id: 'a4', title: 'Adventure Legend', description: 'Complete 100 adventures', icon: 'Crown', category: 'milestones', requirement: 100, metric: 'adventures', tier: 'gold' },
  { id: 'a5', title: 'Kilometer Club', description: 'Walk 10 km total', icon: 'Route', category: 'exploration', requirement: 10, metric: 'distance', tier: 'bronze' },
  { id: 'a6', title: 'Marathon Walker', description: 'Walk 42 km total', icon: 'Medal', category: 'exploration', requirement: 42, metric: 'distance', tier: 'silver' },
  { id: 'a7', title: 'Centurion', description: 'Walk 100 km total', icon: 'Award', category: 'exploration', requirement: 100, metric: 'distance', tier: 'gold' },
  { id: 'a8', title: 'On Fire', description: 'Maintain a 3-day streak', icon: 'Flame', category: 'fitness', requirement: 3, metric: 'streak', tier: 'bronze' },
  { id: 'a9', title: 'Unstoppable', description: 'Maintain a 7-day streak', icon: 'Zap', category: 'fitness', requirement: 7, metric: 'streak', tier: 'silver' },
  { id: 'a10', title: 'Treasure Seeker', description: 'Find 10 treasures', icon: 'Gem', category: 'collection', requirement: 10, metric: 'treasures', tier: 'bronze' },
  { id: 'a11', title: 'Treasure Master', description: 'Find 50 treasures', icon: 'Crown', category: 'collection', requirement: 50, metric: 'treasures', tier: 'gold' },
  { id: 'a12', title: 'Challenge Crusher', description: 'Complete 10 challenges', icon: 'Trophy', category: 'fitness', requirement: 10, metric: 'challenges', tier: 'silver' },
  { id: 'a13', title: 'Social Butterfly', description: 'Add 5 friends', icon: 'Users', category: 'social', requirement: 5, metric: 'friends', tier: 'bronze' },
  { id: 'a14', title: 'Rising Star', description: 'Reach level 10', icon: 'Star', category: 'milestones', requirement: 10, metric: 'level', tier: 'silver' },
  { id: 'a15', title: 'Zeviqo Master', description: 'Reach level 25', icon: 'Crown', category: 'milestones', requirement: 25, metric: 'level', tier: 'platinum' }
];

export const CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Sprint Master', description: 'Walk 500m in under 5 minutes', difficulty: 'medium', xpReward: 150, coinReward: 300, icon: 'Zap' },
  { id: 'c2', title: 'Treasure Sprint', description: 'Find 3 treasures in one adventure', difficulty: 'hard', xpReward: 250, coinReward: 500, icon: 'Gem' },
  { id: 'c3', title: 'Combo King', description: 'Reach a 10x combo multiplier', difficulty: 'extreme', xpReward: 400, coinReward: 800, icon: 'Flame' },
  { id: 'c4', title: 'Distance Demon', description: 'Walk 5km in a single adventure', difficulty: 'hard', xpReward: 300, coinReward: 600, icon: 'Route' },
  { id: 'c5', title: 'Night Owl', description: 'Complete an adventure after 8 PM', difficulty: 'easy', xpReward: 100, coinReward: 200, icon: 'Moon' },
  { id: 'c6', title: 'Early Bird', description: 'Complete an adventure before 7 AM', difficulty: 'easy', xpReward: 100, coinReward: 200, icon: 'Sunrise' }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: 'Golden Compass', emoji: '🧭', price: 500, rarity: 'rare', category: 'avatar' },
  { id: 's2', name: 'Fire Trail', emoji: '🔥', price: 1200, rarity: 'epic', category: 'trail' },
  { id: 's3', name: 'Diamond Badge', emoji: '💎', price: 2000, rarity: 'legendary', category: 'badge' },
  { id: 's4', name: 'XP Boost 2x', emoji: '⚡', price: 800, rarity: 'rare', category: 'boost' },
  { id: 's5', name: 'Star Explorer', emoji: '⭐', price: 300, rarity: 'common', category: 'avatar' },
  { id: 's6', name: 'Rainbow Trail', emoji: '🌈', price: 1500, rarity: 'epic', category: 'trail' },
  { id: 's7', name: 'Crown Badge', emoji: '👑', price: 3000, rarity: 'legendary', category: 'badge' },
  { id: 's8', name: 'Coin Boost 2x', emoji: '💰', price: 800, rarity: 'rare', category: 'boost' }
];

const ADJECTIVES = [
  'Mystic', 'Golden', 'Hidden', 'Ancient', 'Forgotten', 'Secret', 'Crystal', 'Silver',
  'Wandering', 'Emerald', 'Twilight', 'Dawn', 'Midnight', 'Crimson', 'Frost', 'Storm',
  'Velvet', 'Shadow', 'Radiant', 'Wild', 'Sacred', 'Lost', 'Sacred', 'Silent', 'Distant'
];
const NOUNS = [
  'Trail', 'Path', 'Quest', 'Journey', 'Expedition', 'Voyage', 'Odyssey', 'Route',
  'Passage', 'Way', 'Track', 'Circuit', 'Loop', 'Trek', 'Hike', 'Stroll', 'Ramble',
  'Wander', 'Pilgrimage', 'Safari', 'Venture', 'Excursion', 'Odyssey', 'Pursuit', 'Discovery'
];

const OBJECTIVE_TEMPLATES: Record<AdventureType, string[]> = {
  treasure_hunt: ['Find the hidden treasure chest', 'Collect 3 golden coins along the route', 'Decode the treasure map clues', 'Reach the X marks the spot'],
  nature_walk: ['Photograph 3 different tree species', 'Spot 2 types of birds', 'Collect fallen leaves from 3 trees', 'Find a peaceful resting spot'],
  mystery: ['Solve the riddle at waypoint 3', 'Find all 4 hidden clues', 'Decode the secret message', 'Identify the mysterious landmark'],
  explorer_route: ['Visit all 5 landmarks', 'Discover 2 hidden paths', 'Map the unexplored zone', 'Find the highest viewpoint'],
  speed_challenge: ['Complete the route in under 20 minutes', 'Maintain 5 km/h for 1 km', 'Beat the target time', 'Sprint the final 200m'],
  scenic_walk: ['Capture 3 scenic photos', 'Visit the best sunset spot', 'Find the most beautiful view', 'Reach the panoramic viewpoint'],
  fitness_adventure: ['Burn 200 calories', 'Complete 3 power-walk intervals', 'Reach 10,000 steps', 'Maintain brisk pace for 15 minutes'],
  community_adventure: ['Walk with at least 2 friends', 'Greet 3 fellow walkers', 'Complete a group challenge', 'Share a photo with your party']
};

const DESCRIPTION_TEMPLATES: Record<AdventureType, string[]> = {
  treasure_hunt: ['A legendary treasure awaits those brave enough to follow the clues through uncharted paths.', 'Ancient pirates buried their gold along this route. Can you find it?', 'Hidden chests are scattered across this trail. Each holds a piece of the puzzle.'],
  nature_walk: ['Immerse yourself in the beauty of nature on this tranquil trail through lush greenery.', 'A peaceful journey through forests and meadows, perfect for reconnecting with the outdoors.', 'Discover the wonders of local wildlife on this serene nature path.'],
  mystery: ['A puzzling adventure where every step reveals a new clue. Can you solve the mystery?', 'Strange occurrences have been reported along this route. Investigate if you dare.', 'An enigmatic trail filled with riddles and hidden messages waiting to be decoded.'],
  explorer_route: ['Chart unknown territory and discover hidden gems along this explorer\'s dream route.', 'Be the first to map this uncharted path filled with surprises at every turn.', 'A true explorer\'s journey through undiscovered landmarks and secret passages.'],
  speed_challenge: ['Push your limits on this timed challenge. Speed is everything!', 'Race against the clock through this high-intensity speed course.', 'How fast can you go? Test your pace on this thrilling speed challenge.'],
  scenic_walk: ['Breathtaking views await on this picturesque trail designed for photography enthusiasts.', 'A visual feast of stunning landscapes and perfect photo opportunities.', 'Walk through the most beautiful scenery the area has to offer.'],
  fitness_adventure: ['Turn your walk into a workout with this calorie-burning fitness adventure.', 'Power-walk intervals and terrain challenges make this a full-body experience.', 'Elevate your heart rate and burn calories on this fitness-focused route.'],
  community_adventure: ['Join fellow adventurers on this social walking experience.', 'Walk together, achieve together. A community adventure for friends and neighbors.', 'Make new friends and share the adventure on this group walking quest.']
};

const TERRAINS: Record<AdventureType, string[]> = {
  treasure_hunt: ['Mixed Terrain', 'Coastal', 'Urban'],
  nature_walk: ['Forest', 'Park', 'Wetland'],
  mystery: ['Urban', 'Historic', 'Mixed Terrain'],
  explorer_route: ['Mixed Terrain', 'Mountain', 'Coastal'],
  speed_challenge: ['Urban', 'Park', 'Flat'],
  scenic_walk: ['Coastal', 'Mountain', 'Lakeside'],
  fitness_adventure: ['Urban', 'Hill', 'Mixed Terrain'],
  community_adventure: ['Urban', 'Park', 'Neighborhood']
};

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateRoute(rng: () => number, distance: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const segments = Math.max(8, Math.min(20, Math.floor(distance * 4)));
  const baseRadius = 40;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wobble = (rng() - 0.5) * 15;
    const r = baseRadius + wobble;
    points.push({
      x: 50 + Math.cos(angle) * r,
      y: 50 + Math.sin(angle) * r * 0.7
    });
  }
  return points;
}

export function generateAdventure(opts?: { type?: AdventureType; difficulty?: Difficulty; seed?: number }): Adventure {
  const seed = opts?.seed ?? Date.now() + Math.floor(Math.random() * 100000);
  const rng = seededRng(seed);
  const type = opts?.type ?? ADVENTURE_TYPES[Math.floor(rng() * ADVENTURE_TYPES.length)].type;
  const typeInfo = ADVENTURE_TYPES.find(t => t.type === type)!;
  const difficulty = opts?.difficulty ?? (['relaxed', 'easy', 'medium', 'hard', 'extreme'] as Difficulty[])[Math.floor(rng() * 5)];
  const theme = THEMES[Math.floor(rng() * THEMES.length)];
  const adj = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(rng() * NOUNS.length)];
  const title = `${adj} ${noun}`;
  const descPool = DESCRIPTION_TEMPLATES[type];
  const description = descPool[Math.floor(rng() * descPool.length)];
  const baseDistance = 0.5 + rng() * 4.5;
  const diffMult = DIFFICULTY_MULTIPLIERS[difficulty];
  const distance = Math.round(baseDistance * 100) / 100;
  const duration = Math.round(distance * 12 * 60);
  const calories = Math.round(distance * 50 * diffMult);
  const xp = Math.round(100 * diffMult * (1 + distance / 5));
  const coins = Math.round(50 * diffMult * (1 + distance / 3));
  const gems = Math.max(0, Math.round((diffMult - 1) * 3));
  const objPool = OBJECTIVE_TEMPLATES[type];
  const objectives = [...objPool].sort(() => rng() - 0.5).slice(0, 3);
  const terrainPool = TERRAINS[type];
  const terrain = terrainPool[Math.floor(rng() * terrainPool.length)];
  const route = generateRoute(rng, distance);
  return {
    id: `gen_${seed}`,
    type, title, description, difficulty, distance, duration, calories,
    xp, coins, gems, emoji: typeInfo.emoji, theme, objectives, route, terrain
  };
}

export const CURATED_ADVENTURES: Adventure[] = [
  generateAdventure({ type: 'treasure_hunt', difficulty: 'medium', seed: 1001 }),
  generateAdventure({ type: 'nature_walk', difficulty: 'easy', seed: 1002 }),
  generateAdventure({ type: 'mystery', difficulty: 'hard', seed: 1003 }),
  generateAdventure({ type: 'scenic_walk', difficulty: 'relaxed', seed: 1004 }),
  generateAdventure({ type: 'speed_challenge', difficulty: 'extreme', seed: 1005 }),
  generateAdventure({ type: 'explorer_route', difficulty: 'medium', seed: 1006 }),
  generateAdventure({ type: 'fitness_adventure', difficulty: 'hard', seed: 1007 }),
  generateAdventure({ type: 'community_adventure', difficulty: 'easy', seed: 1008 }),
  generateAdventure({ type: 'treasure_hunt', difficulty: 'extreme', seed: 1009 }),
  generateAdventure({ type: 'nature_walk', difficulty: 'medium', seed: 1010 }),
  generateAdventure({ type: 'mystery', difficulty: 'easy', seed: 1011 }),
  generateAdventure({ type: 'scenic_walk', difficulty: 'medium', seed: 1012 })
];

export function getComboTier(combo: number) {
  for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_TIERS[i].min) return COMBO_TIERS[i];
  }
  return COMBO_TIERS[0];
}

export type LevelInfo = { level: number; xpIntoLevel: number; xpNeeded: number; progress: number; xpForNextLevel: number };

export function getLevelInfo(xp: number): LevelInfo {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpIntoLevel = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeeded > 0 ? (xpIntoLevel / xpNeeded) * 100 : 100;
  return { level, xpIntoLevel, xpNeeded, progress, xpForNextLevel };
}
