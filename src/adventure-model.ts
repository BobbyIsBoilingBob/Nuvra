// New adventure model used by generator.ts and the AI/Creator/Preview screens.
// Kept separate from data.ts to avoid breaking the existing working screens.

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Epic';

export type AdventureType =
  | 'explorer' | 'treasure_hunt' | 'relaxed_walk' | 'challenge_run';

export type TreasureRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ChallengeZoneType =
  | 'explorer' | 'treasure' | 'speed' | 'endurance'
  | 'balance' | 'precision' | 'decision';

export type ChallengeCategory = 'explorer' | 'collector' | 'adventure';

export type AdventureLength = '10-15' | '20-30' | '30-45' | '45-60' | '60+';

export type AdventureStylePref =
  | 'explorer' | 'treasure_hunter' | 'relaxed' | 'fitness' | 'story' | 'challenge';

export type DifficultyPref = 'Relaxed' | 'Easy' | 'Medium' | 'Hard' | 'Extreme';

export type RewardPriority =
  | 'xp' | 'coins' | 'exploration' | 'rare_items' | 'balanced';

export interface AdventurePreferences {
  length: AdventureLength;
  difficulty: DifficultyPref;
  style: AdventureStylePref;
  rewardPriority: RewardPriority;
}

export interface MapPoint { x: number; y: number }

export interface MapCheckpoint {
  id: string;
  label: string;
  kind: 'start' | 'challenge' | 'treasure' | 'finish';
  x: number;
  y: number;
  reward: number;
  done: boolean;
}

export interface MapTreasure {
  id: string;
  x: number;
  y: number;
  coins: number;
  xp: number;
  opened: boolean;
  rarity: TreasureRarity;
}

export interface MapCoin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface ChallengeZone {
  id: string;
  type: ChallengeZoneType;
  label: string;
  x: number;
  y: number;
  radius: number;
  icon: string;
  accent: string;
  color: string;
}

export interface AdventureTheme {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  descTemplates: string[];
  namePrefixes: string[];
  nameSuffixes: string[];
  challengeTypes: ChallengeCategory[];
  rewardBias: RewardPriority;
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  type: AdventureType;
  difficulty: Difficulty;
  distanceKm: number;
  durationMin: number;
  xpReward: number;
  coinReward: number;
  accent: string;
  emoji: string;
  image: string;
  challenges: string[];
  routePath: MapPoint[];
  checkpoints: MapCheckpoint[];
  treasures: MapTreasure[];
  coins: MapCoin[];
  zones: ChallengeZone[];
  themeId: string;
  isAIGenerated: boolean;
  plays: number;
  rating: number;
  bonusMultiplier?: number;
}

export interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  coinReward: number;
  icon: string;
  category: ChallengeCategory;
  accent: string;
  baseReward: number;
}

export interface TreasureRarityMeta {
  id: TreasureRarity;
  label: string;
  emoji: string;
  color: string;
  coinMult: number;
  xpMult: number;
}

export const TREASURE_RARITIES: TreasureRarityMeta[] = [
  { id: 'common', label: 'Common', emoji: '📦', color: '#94a3b8', coinMult: 1, xpMult: 1 },
  { id: 'rare', label: 'Rare', emoji: '💎', color: '#40f5cb', coinMult: 1.8, xpMult: 1.5 },
  { id: 'epic', label: 'Epic', emoji: '🔮', color: '#a78bfa', coinMult: 2.5, xpMult: 2.2 },
  { id: 'legendary', label: 'Legendary', emoji: '👑', color: '#fbbf24', coinMult: 4, xpMult: 3.5 },
];

export const TREASURE_RARITY_MAP: Record<TreasureRarity, TreasureRarityMeta> = Object.fromEntries(
  TREASURE_RARITIES.map((r) => [r.id, r]),
) as Record<TreasureRarity, TreasureRarityMeta>;

export const CHALLENGES: ChallengeDef[] = [
  { id: 'ch1', title: 'Speed Sprint', description: 'Reach the next checkpoint in under 2 minutes', difficulty: 'Easy', xpReward: 80, coinReward: 120, icon: 'Zap', category: 'adventure', accent: 'from-ember-400 to-ember-600', baseReward: 120 },
  { id: 'ch2', title: 'Treasure Hunt', description: 'Find all treasures along the route', difficulty: 'Medium', xpReward: 150, coinReward: 250, icon: 'Gem', category: 'collector', accent: 'from-gold-300 to-ember-500', baseReward: 250 },
  { id: 'ch3', title: 'Explorer Path', description: 'Visit every landmark on the map', difficulty: 'Easy', xpReward: 100, coinReward: 150, icon: 'Compass', category: 'explorer', accent: 'from-nova-300 to-cyan-400', baseReward: 150 },
  { id: 'ch4', title: 'Endurance Run', description: 'Complete the full route without stopping', difficulty: 'Hard', xpReward: 250, coinReward: 400, icon: 'Activity', category: 'adventure', accent: 'from-ember-500 to-rose-500', baseReward: 400 },
  { id: 'ch5', title: 'Precision Walk', description: 'Stay on the marked path the entire route', difficulty: 'Medium', xpReward: 180, coinReward: 300, icon: 'Crosshair', category: 'adventure', accent: 'from-cyan-300 to-nova-400', baseReward: 300 },
  { id: 'ch6', title: 'Balance Challenge', description: 'Maintain a steady pace for 5 minutes', difficulty: 'Hard', xpReward: 220, coinReward: 350, icon: 'Scale', category: 'adventure', accent: 'from-nova-400 to-nova-600', baseReward: 350 },
];

export const ADVENTURE_THEMES: AdventureTheme[] = [
  {
    id: 'lost_explorer',
    name: 'Lost Explorer',
    emoji: '🧭',
    accent: 'from-nova-400 to-cyan-500',
    descTemplates: [
      'Chart unknown territory and discover hidden gems along this explorer route.',
      'A true explorer journey through undiscovered landmarks and secret passages.',
    ],
    namePrefixes: ['Mystic', 'Hidden', 'Forgotten', 'Distant'],
    nameSuffixes: ['Trail', 'Path', 'Expedition', 'Way'],
    challengeTypes: ['explorer', 'adventure'],
    rewardBias: 'exploration',
  },
  {
    id: 'hidden_treasure',
    name: 'Hidden Treasure',
    emoji: '🗺️',
    accent: 'from-gold-300 to-ember-500',
    descTemplates: [
      'A legendary treasure awaits those brave enough to follow the clues.',
      'Hidden chests are scattered across this trail. Each holds a piece of the puzzle.',
    ],
    namePrefixes: ['Golden', 'Ancient', 'Secret', 'Crystal'],
    nameSuffixes: ['Quest', 'Hunt', 'Voyage', 'Discovery'],
    challengeTypes: ['collector', 'adventure'],
    rewardBias: 'coins',
  },
  {
    id: 'mountain_expedition',
    name: 'Mountain Expedition',
    emoji: '⛰️',
    accent: 'from-slate-300 to-nova-400',
    descTemplates: [
      'Brave the heights on this challenging mountain expedition.',
      'Scale new peaks and discover breathtaking views on this alpine adventure.',
    ],
    namePrefixes: ['Alpine', 'Northern', 'Summit', 'Highland'],
    nameSuffixes: ['Ascent', 'Climb', 'Trek', 'Pass'],
    challengeTypes: ['adventure'],
    rewardBias: 'xp',
  },
  {
    id: 'city_discovery',
    name: 'City Discovery',
    emoji: '🏙️',
    accent: 'from-cyan-300 to-nova-400',
    descTemplates: [
      'Explore the urban jungle and uncover hidden city landmarks.',
      'Navigate bustling streets to find secret spots and urban treasures.',
    ],
    namePrefixes: ['Urban', 'Neon', 'Metro', 'Downtown'],
    nameSuffixes: ['Loop', 'Circuit', 'Stroll', 'Wander'],
    challengeTypes: ['explorer'],
    rewardBias: 'balanced',
  },
  {
    id: 'nature_escape',
    name: 'Nature Escape',
    emoji: '🌿',
    accent: 'from-green-400 to-nova-400',
    descTemplates: [
      'Immerse yourself in the beauty of nature on this tranquil trail.',
      'A peaceful journey through forests and meadows, perfect for reconnecting.',
    ],
    namePrefixes: ['Forest', 'Wild', 'Emerald', 'Sacred'],
    nameSuffixes: ['Walk', 'Ramble', 'Stroll', 'Retreat'],
    challengeTypes: ['explorer'],
    rewardBias: 'balanced',
  },
  {
    id: 'weekend_wanderer',
    name: 'Weekend Wanderer',
    emoji: '🚶',
    accent: 'from-nova-300 to-cyan-400',
    descTemplates: [
      'A relaxed weekend adventure perfect for unwinding and exploring.',
      'Take it easy on this laid-back route designed for casual explorers.',
    ],
    namePrefixes: ['Lazy', 'Sunny', 'Gentle', 'Easy'],
    nameSuffixes: ['Wander', 'Stroll', 'Loop', 'Outing'],
    challengeTypes: ['explorer'],
    rewardBias: 'balanced',
  },
  {
    id: 'sunset_journey',
    name: 'Sunset Journey',
    emoji: '🌅',
    accent: 'from-ember-400 to-gold-500',
    descTemplates: [
      'Walk into the sunset on this golden-hour adventure with stunning views.',
      'A picturesque route best enjoyed as the sun dips below the horizon.',
    ],
    namePrefixes: ['Twilight', 'Golden', 'Crimson', 'Amber'],
    nameSuffixes: ['Journey', 'Voyage', 'Odyssey', 'Safari'],
    challengeTypes: ['explorer', 'adventure'],
    rewardBias: 'xp',
  },
  {
    id: 'ancient_route',
    name: 'Ancient Route',
    emoji: '🏛️',
    accent: 'from-gold-300 to-ember-500',
    descTemplates: [
      'Walk in the footsteps of ancients on this historic route.',
      'Discover ruins and relics on this journey through time.',
    ],
    namePrefixes: ['Ancient', 'Lost', 'Silent', 'Forgotten'],
    nameSuffixes: ['Route', 'Passage', 'Pilgrimage', 'Way'],
    challengeTypes: ['explorer', 'collector'],
    rewardBias: 'rare_items',
  },
  {
    id: 'urban_treasure_hunt',
    name: 'Urban Treasure Hunt',
    emoji: '💎',
    accent: 'from-gold-300 to-ember-500',
    descTemplates: [
      'Hunt for hidden treasures scattered across the urban landscape.',
      'Decode city clues to find caches of coins and rare items.',
    ],
    namePrefixes: ['Urban', 'Neon', 'Metro', 'City'],
    nameSuffixes: ['Hunt', 'Quest', 'Search', 'Pursuit'],
    challengeTypes: ['collector', 'adventure'],
    rewardBias: 'coins',
  },
  {
    id: 'morning_sprint',
    name: 'Morning Sprint',
    emoji: '⚡',
    accent: 'from-ember-400 to-rose-500',
    descTemplates: [
      'Start your day with an energizing sprint through the city.',
      'Push your limits on this high-intensity morning challenge.',
    ],
    namePrefixes: ['Dawn', 'Early', 'Brisk', 'Fresh'],
    nameSuffixes: ['Sprint', 'Dash', 'Run', 'Challenge'],
    challengeTypes: ['adventure'],
    rewardBias: 'xp',
  },
];

export const LENGTH_OPTIONS: { id: AdventureLength; label: string; desc: string }[] = [
  { id: '10-15', label: '10-15 min', desc: 'Quick stroll' },
  { id: '20-30', label: '20-30 min', desc: 'Short adventure' },
  { id: '30-45', label: '30-45 min', desc: 'Medium trek' },
  { id: '45-60', label: '45-60 min', desc: 'Long expedition' },
  { id: '60+', label: '60+ min', desc: 'Epic journey' },
];

export const STYLE_PREF_OPTIONS: { id: AdventureStylePref; label: string; icon: string; desc: string }[] = [
  { id: 'explorer', label: 'Explorer', icon: 'Compass', desc: 'Discover new areas' },
  { id: 'treasure_hunter', label: 'Treasure Hunter', icon: 'Gem', desc: 'Find hidden loot' },
  { id: 'relaxed', label: 'Relaxed', icon: 'Leaf', desc: 'Take it easy' },
  { id: 'fitness', label: 'Fitness', icon: 'Zap', desc: 'Push your limits' },
  { id: 'story', label: 'Story', icon: 'BookOpen', desc: 'Narrative adventure' },
  { id: 'challenge', label: 'Challenge', icon: 'Trophy', desc: 'Test your skills' },
];

export const DIFFICULTY_PREF_OPTIONS: { id: DifficultyPref; label: string; icon: string }[] = [
  { id: 'Relaxed', label: 'Relaxed', icon: 'Circle' },
  { id: 'Easy', label: 'Easy', icon: 'Circle' },
  { id: 'Medium', label: 'Medium', icon: 'Gauge' },
  { id: 'Hard', label: 'Hard', icon: 'Flame' },
  { id: 'Extreme', label: 'Extreme', icon: 'Zap' },
];

export const REWARD_PRIORITY_OPTIONS: { id: RewardPriority; label: string; icon: string }[] = [
  { id: 'balanced', label: 'Balanced', icon: 'Scale' },
  { id: 'xp', label: 'XP Focus', icon: 'Zap' },
  { id: 'coins', label: 'Coins Focus', icon: 'Coins' },
  { id: 'exploration', label: 'Exploration', icon: 'Compass' },
  { id: 'rare_items', label: 'Rare Items', icon: 'Gem' },
];

export const ADVENTURE_TYPE_META: Record<AdventureType, { label: string; icon: string; accent: string }> = {
  explorer: { label: 'Explorer', icon: 'Compass', accent: 'from-nova-400 to-cyan-500' },
  treasure_hunt: { label: 'Treasure Hunt', icon: 'Gem', accent: 'from-gold-300 to-ember-500' },
  relaxed_walk: { label: 'Relaxed Walk', icon: 'Leaf', accent: 'from-green-400 to-nova-400' },
  challenge_run: { label: 'Challenge Run', icon: 'Zap', accent: 'from-ember-400 to-rose-500' },
};

export function buildAdventure(data: Adventure): Adventure {
  return { ...data };
}

// --- Rewards screen data ---

export type AchievementCategory = 'Explorer' | 'Collector' | 'Adventure' | 'Community' | 'Seasonal' | 'Master';

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Explorer', 'Collector', 'Adventure', 'Community', 'Seasonal', 'Master',
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  metric: string;
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  unlocked: boolean;
  date?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Steps', description: 'Complete your first adventure', icon: 'Footprints', category: 'Adventure', requirement: 1, metric: 'adventures', tier: 'bronze', unlocked: false },
  { id: 'a2', title: 'Getting Started', description: 'Complete 5 adventures', icon: 'Compass', category: 'Adventure', requirement: 5, metric: 'adventures', tier: 'bronze', unlocked: false },
  { id: 'a3', title: 'Seasoned Explorer', description: 'Complete 25 adventures', icon: 'Map', category: 'Adventure', requirement: 25, metric: 'adventures', tier: 'silver', unlocked: false },
  { id: 'a4', title: 'Adventure Legend', description: 'Complete 100 adventures', icon: 'Crown', category: 'Adventure', requirement: 100, metric: 'adventures', tier: 'gold', unlocked: false },
  { id: 'a5', title: 'Kilometer Club', description: 'Walk 10 km total', icon: 'Route', category: 'Explorer', requirement: 10, metric: 'distance', tier: 'bronze', unlocked: false },
  { id: 'a6', title: 'Marathon Walker', description: 'Walk 42 km total', icon: 'Medal', category: 'Explorer', requirement: 42, metric: 'distance', tier: 'silver', unlocked: false },
  { id: 'a7', title: 'Centurion', description: 'Walk 100 km total', icon: 'Award', category: 'Explorer', requirement: 100, metric: 'distance', tier: 'gold', unlocked: false },
  { id: 'a8', title: 'On Fire', description: 'Maintain a 3-day streak', icon: 'Flame', category: 'Adventure', requirement: 3, metric: 'streak', tier: 'bronze', unlocked: false },
  { id: 'a9', title: 'Unstoppable', description: 'Maintain a 7-day streak', icon: 'Zap', category: 'Adventure', requirement: 7, metric: 'streak', tier: 'silver', unlocked: false },
  { id: 'a10', title: 'Treasure Seeker', description: 'Find 10 treasures', icon: 'Gem', category: 'Collector', requirement: 10, metric: 'treasures', tier: 'bronze', unlocked: false },
  { id: 'a11', title: 'Treasure Master', description: 'Find 50 treasures', icon: 'Crown', category: 'Collector', requirement: 50, metric: 'treasures', tier: 'gold', unlocked: false },
  { id: 'a12', title: 'Challenge Crusher', description: 'Complete 10 challenges', icon: 'Trophy', category: 'Adventure', requirement: 10, metric: 'challenges', tier: 'silver', unlocked: false },
  { id: 'a13', title: 'Social Butterfly', description: 'Add 5 friends', icon: 'Users', category: 'Community', requirement: 5, metric: 'friends', tier: 'bronze', unlocked: false },
  { id: 'a14', title: 'Rising Star', description: 'Reach level 10', icon: 'Star', category: 'Master', requirement: 10, metric: 'level', tier: 'silver', unlocked: false },
  { id: 'a15', title: 'Zeviqo Master', description: 'Reach level 25', icon: 'Crown', category: 'Master', requirement: 25, metric: 'level', tier: 'legendary', unlocked: false },
];

export interface BadgeDef {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'b1', label: 'First Adventure', icon: 'Footprints', color: 'from-nova-400 to-cyan-500' },
  { id: 'b2', label: 'Treasure Hunter', icon: 'Gem', color: 'from-gold-300 to-ember-500' },
  { id: 'b3', label: 'Speed Demon', icon: 'Zap', color: 'from-ember-400 to-rose-500' },
  { id: 'b4', label: 'Explorer', icon: 'Compass', color: 'from-nova-300 to-nova-500' },
  { id: 'b5', label: 'Streak Master', icon: 'Flame', color: 'from-ember-500 to-rose-500' },
  { id: 'b6', label: 'Legend', icon: 'Crown', color: 'from-gold-300 to-ember-500' },
];

export interface LevelDef {
  level: number;
  title: string;
  emoji: string;
  minXp: number;
  maxXp: number;
}

export const LEVELS: LevelDef[] = [
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

export function getLevelProgress(xp: number): {
  info: { level: number; title: string; emoji: string };
  current: number;
  needed: number;
  pct: number;
} {
  let currentLevel = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) currentLevel = lvl;
    else break;
  }
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1) ?? LEVELS[LEVELS.length - 1];
  const current = xp - currentLevel.minXp;
  const needed = nextLevel.minXp - currentLevel.minXp;
  const pct = needed > 0 ? current / needed : 1;
  return {
    info: { level: currentLevel.level, title: currentLevel.title, emoji: currentLevel.emoji },
    current,
    needed,
    pct,
  };
}
