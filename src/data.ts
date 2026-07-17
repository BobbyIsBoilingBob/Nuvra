export const APP_NAME = 'Zeviqo';

export type Difficulty = 'relaxed' | 'easy' | 'medium' | 'hard' | 'extreme';
export type AdventureType = 'explorer' | 'treasure_hunt' | 'relaxed_walk' | 'challenge_run';

export type Adventure = {
  id: string;
  title: string;
  description: string;
  type: AdventureType;
  difficulty: Difficulty;
  distance: number; // km
  duration: number; // minutes
  xp: number;
  coins: number;
  gems: number;
  emoji: string;
  route: { x: number; y: number }[];
  objectives: string[];
  challenges: string[];
  image: string;
  tags: string[];
  isFavorite?: boolean;
  isAI?: boolean;
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  relaxed: 'Relaxed', easy: 'Easy', medium: 'Medium', hard: 'Hard', extreme: 'Extreme',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  relaxed: '#22c55e', easy: '#4de8ff', medium: '#fbbf24', hard: '#fb923c', extreme: '#ef4444',
};

export type AdventureTypeInfo = { type: AdventureType; label: string; icon: string; color: string; desc: string };

export const ADVENTURE_TYPES: AdventureTypeInfo[] = [
  { type: 'explorer', label: 'Explorer', icon: 'Compass', color: '#00c4ff', desc: 'Discover new areas and landmarks' },
  { type: 'treasure_hunt', label: 'Treasure Hunt', icon: 'Gem', color: '#fbbf24', desc: 'Find hidden treasures along the way' },
  { type: 'relaxed_walk', label: 'Relaxed Walk', icon: 'Leaf', color: '#22c55e', desc: 'Take it easy and enjoy the scenery' },
  { type: 'challenge_run', label: 'Challenge Run', icon: 'Zap', color: '#fb923c', desc: 'Push your limits with timed challenges' },
];

export type LevelInfo = { level: number; title: string; emoji: string; minXp: number; maxXp: number };

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Novice', emoji: '🌱', minXp: 0, maxXp: 100 },
  { level: 2, title: 'Wanderer', emoji: '🚶', minXp: 100, maxXp: 400 },
  { level: 3, title: 'Explorer', emoji: '🧭', minXp: 400, maxXp: 900 },
  { level: 4, title: 'Adventurer', emoji: '⚔️', minXp: 900, maxXp: 1600 },
  { level: 5, title: 'Ranger', emoji: '🗺️', minXp: 1600, maxXp: 2500 },
  { level: 10, title: 'Trail Master', emoji: '🏔️', minXp: 10000, maxXp: 12100 },
  { level: 15, title: 'Pathfinder', emoji: '⭐', minXp: 22500, maxXp: 25600 },
  { level: 25, title: 'Zeviqo Legend', emoji: '👑', minXp: 62500, maxXp: 67600 },
  { level: 50, title: 'Mythic Walker', emoji: '🔮', minXp: 250000, maxXp: 260100 },
  { level: 100, title: 'Eternal', emoji: '∞', minXp: 1000000, maxXp: 999999 },
];

export function getLevelInfo(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) { if (xp >= lvl.minXp) current = lvl; else break; }
  return current;
}

export function getLevelProgress(xp: number): { info: LevelInfo; current: number; needed: number; pct: number } {
  let currentLevel = LEVELS[0];
  for (const lvl of LEVELS) { if (xp >= lvl.minXp) currentLevel = lvl; else break; }
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1) ?? LEVELS[LEVELS.length - 1];
  const current = xp - currentLevel.minXp;
  const needed = nextLevel.minXp - currentLevel.minXp;
  const pct = needed > 0 ? current / needed : 1;
  return { info: currentLevel, current, needed, pct };
}

export type ComboTier = { name: string; multiplier: number; color: string; min: number };

export const COMBO_TIERS: ComboTier[] = [
  { name: 'Warming Up', multiplier: 1.0, color: '#94a3b8', min: 0 },
  { name: 'On Fire', multiplier: 1.2, color: '#fb923c', min: 5 },
  { name: 'Blazing', multiplier: 1.5, color: '#f97316', min: 10 },
  { name: 'Unstoppable', multiplier: 2.0, color: '#ef4444', min: 20 },
  { name: 'Legendary', multiplier: 3.0, color: '#fbbf24', min: 30 },
];

export function getComboTier(combo: number): ComboTier {
  let tier = COMBO_TIERS[0];
  for (const t of COMBO_TIERS) { if (combo >= t.min) tier = t; else break; }
  return tier;
}

function genRoute(seed: number, complexity: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const numPoints = Math.max(4, Math.floor(complexity * 3) + 3);
  let x = 50, y = 50;
  for (let i = 0; i < numPoints; i++) {
    const angle = (seed * 0.1 + i * 1.3) % (Math.PI * 2);
    const radius = 15 + (seed % 20);
    x = 50 + Math.cos(angle) * radius * (1 - i / numPoints * 0.3);
    y = 50 + Math.sin(angle) * radius * (1 - i / numPoints * 0.3);
    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
}

const ADJECTIVES = ['Mystic', 'Hidden', 'Golden', 'Forgotten', 'Ancient', 'Secret', 'Crystal', 'Emerald', 'Silver', 'Crimson'];
const NOUNS = ['Trail', 'Path', 'Way', 'Loop', 'Circuit', 'Journey', 'Quest', 'Expedition', 'Voyage', 'Stroll'];
const DESC_TEMPLATES = [
  'Explore a {adj} route through the city. Discover hidden landmarks and collect treasures along the way.',
  'A {adj} adventure awaits. Follow the path to uncover secrets and earn rewards.',
  'Embark on a {adj} journey. Test your skills and find rare treasures.',
  'Walk the {adj} path. Every step brings new discoveries and challenges.',
];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

const ADVENTURES: Adventure[] = [
  {
    id: 'adv1', title: 'Riverside Discovery', description: 'Follow the river path and discover hidden landmarks along the way.',
    type: 'explorer', difficulty: 'easy', distance: 1.2, duration: 15, xp: 80, coins: 120, gems: 0,
    emoji: '🌊', route: genRoute(1, 2), objectives: ['Reach the riverside', 'Find 3 landmarks', 'Complete the loop'],
    challenges: ['ch1'], image: 'https://images.pexels.com/photos/2071427/pexels-photo-2071427.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['nature', 'landmarks'],
  },
  {
    id: 'adv2', title: 'Treasure Cove Hunt', description: 'Hunt for hidden treasures scattered across the old town district.',
    type: 'treasure_hunt', difficulty: 'medium', distance: 2.5, duration: 30, xp: 150, coins: 250, gems: 1,
    emoji: '💎', route: genRoute(2, 3), objectives: ['Find the first clue', 'Collect 5 treasures', 'Reach the final chest'],
    challenges: ['ch1', 'ch2'], image: 'https://images.pexels.com/photos/2071427/pexels-photo-2071427.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['treasure', 'urban'],
  },
  {
    id: 'adv3', title: 'Sunset Stroll', description: 'A relaxing walk perfect for unwinding after a long day.',
    type: 'relaxed_walk', difficulty: 'relaxed', distance: 0.8, duration: 10, xp: 50, coins: 80, gems: 0,
    emoji: '🌅', route: genRoute(3, 1), objectives: ['Enjoy the sunset', 'Take 500 steps', 'Reach the viewpoint'],
    challenges: [], image: 'https://images.pexels.com/photos/2071427/pexels-photo-2071427.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['relaxed', 'scenic'],
  },
  {
    id: 'adv4', title: 'Speed Demon Circuit', description: 'Push your limits on this high-intensity challenge run.',
    type: 'challenge_run', difficulty: 'hard', distance: 3.0, duration: 25, xp: 250, coins: 400, gems: 2,
    emoji: '⚡', route: genRoute(4, 4), objectives: ['Complete in under 25 min', 'Hit 5 checkpoints', 'Maintain combo x10'],
    challenges: ['ch1', 'ch3'], image: 'https://images.pexels.com/photos/2071427/pexels-photo-2071427.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['fitness', 'timed'],
  },
  {
    id: 'adv5', title: 'Hidden Garden Path', description: 'Discover secret gardens and quiet courtyards off the beaten path.',
    type: 'explorer', difficulty: 'easy', distance: 1.5, duration: 20, xp: 100, coins: 150, gems: 0,
    emoji: '🌿', route: genRoute(5, 2), objectives: ['Find the garden entrance', 'Visit 3 courtyards', 'Collect herbs'],
    challenges: ['ch2'], image: 'https://images.pexels.com/photos/2071427/pexels-photo-2071427.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['nature', 'discovery'],
  },
  {
    id: 'adv6', title: 'Midnight Treasure Run', description: 'A thrilling night-time treasure hunt through the city center.',
    type: 'treasure_hunt', difficulty: 'extreme', distance: 4.0, duration: 45, xp: 350, coins: 500, gems: 3,
    emoji: '🌙', route: genRoute(6, 4), objectives: ['Navigate by moonlight', 'Find 8 treasures', 'Beat the clock'],
    challenges: ['ch1', 'ch2', 'ch3'], image: 'https://images.pexels.com/photos/2071427/pexels-photo-2071427.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['night', 'treasure', 'extreme'],
  },
];

export function getAdventures(): Adventure[] { return ADVENTURES; }
export function getAdventureById(id: string): Adventure | undefined { return ADVENTURES.find(a => a.id === id); }

export function generateAdventure(seed: number, type: AdventureType, difficulty: Difficulty): Adventure {
  const adj = pick(ADJECTIVES, seed);
  const noun = pick(NOUNS, seed + 3);
  const desc = pick(DESC_TEMPLATES, seed).replace(/{adj}/g, adj.toLowerCase());
  const distMap: Record<Difficulty, number> = { relaxed: 0.8, easy: 1.5, medium: 2.5, hard: 3.5, extreme: 5.0 };
  const xpMap: Record<Difficulty, number> = { relaxed: 50, easy: 100, medium: 180, hard: 280, extreme: 400 };
  const coinMap: Record<Difficulty, number> = { relaxed: 80, easy: 150, medium: 250, hard: 400, extreme: 600 };
  return {
    id: `gen-${seed}-${Date.now()}`,
    title: `${adj} ${noun}`,
    description: desc,
    type, difficulty,
    distance: distMap[difficulty],
    duration: Math.round(distMap[difficulty] * 12),
    xp: xpMap[difficulty], coins: coinMap[difficulty], gems: difficulty === 'extreme' ? 3 : difficulty === 'hard' ? 2 : 0,
    emoji: type === 'treasure_hunt' ? '💎' : type === 'challenge_run' ? '⚡' : type === 'relaxed_walk' ? '🌿' : '🧭',
    route: genRoute(seed, difficulty === 'extreme' ? 4 : difficulty === 'hard' ? 3 : 2),
    objectives: ['Explore the area', 'Find hidden points', 'Complete the route'],
    challenges: difficulty === 'relaxed' ? [] : ['ch1'],
    image: 'https://images.pexels.com/photos/2071427/pexels-photo-2071427.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: [type], isAI: true,
  };
}

export type Quest = {
  id: string; title: string; description: string; metric: string; target: number; reward: { xp: number; coins: number };
  icon: string; category: 'daily' | 'weekly' | 'story';
};

export const QUESTS: Quest[] = [
  { id: 'q1', title: 'Daily Walker', description: 'Walk 1 km today', metric: 'distance', target: 1, reward: { xp: 50, coins: 80 }, icon: 'Footprints', category: 'daily' },
  { id: 'q2', title: 'Treasure Hunter', description: 'Find 3 treasures', metric: 'treasures', target: 3, reward: { xp: 80, coins: 120 }, icon: 'Gem', category: 'daily' },
  { id: 'q3', title: 'Combo Master', description: 'Reach a 10x combo', metric: 'combo', target: 10, reward: { xp: 100, coins: 150 }, icon: 'Flame', category: 'daily' },
  { id: 'q4', title: 'Weekly Explorer', description: 'Complete 5 adventures this week', metric: 'adventures', target: 5, reward: { xp: 300, coins: 500 }, icon: 'Compass', category: 'weekly' },
  { id: 'q5', title: 'Marathon Walker', description: 'Walk 10 km this week', metric: 'distance', target: 10, reward: { xp: 400, coins: 600 }, icon: 'Route', category: 'weekly' },
];

export type Challenge = {
  id: string; title: string; description: string; difficulty: Difficulty; xpReward: number; coinReward: number; icon: string;
};

export const CHALLENGES: Challenge[] = [
  { id: 'ch1', title: 'Speed Sprint', description: 'Reach the next checkpoint in under 2 minutes', difficulty: 'easy', xpReward: 80, coinReward: 120, icon: 'Zap' },
  { id: 'ch2', title: 'Treasure Hunt', description: 'Find all treasures along the route', difficulty: 'medium', xpReward: 150, coinReward: 250, icon: 'Gem' },
  { id: 'ch3', title: 'Endurance Run', description: 'Complete the full route without stopping', difficulty: 'hard', xpReward: 250, coinReward: 400, icon: 'Activity' },
];

export type DailyReward = { day: number; coins: number; gems: number; icon: string };

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 50, gems: 0, icon: 'Coins' },
  { day: 2, coins: 100, gems: 0, icon: 'Coins' },
  { day: 3, coins: 150, gems: 1, icon: 'Gem' },
  { day: 4, coins: 200, gems: 0, icon: 'Coins' },
  { day: 5, coins: 300, gems: 1, icon: 'Gem' },
  { day: 6, coins: 400, gems: 2, icon: 'Gem' },
  { day: 7, coins: 500, gems: 5, icon: 'Crown' },
];
