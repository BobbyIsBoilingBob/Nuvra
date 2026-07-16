// ============================================================
// Nuvra Data Layer — Core Types, Game Data, Phase 7+9+10
// ============================================================

// --- Screen Type ---
export type Screen =
  | 'landing' | 'onboarding' | 'home' | 'adventures' | 'adventure-detail'
  | 'adventure-preview' | 'adventure-map' | 'ai-generator' | 'challenges' | 'rewards' | 'community'
  | 'creator' | 'profile' | 'customise' | 'shop' | 'inventory' | 'seasonal'
  | 'settings' | 'friends' | 'party';

// --- AI Adventure Preferences ---
export type AdventureLength = '10-15' | '20-30' | '30-45' | '45-60' | '60+';
export type AdventureStylePref = 'explorer' | 'treasure_hunter' | 'relaxed' | 'fitness' | 'story' | 'challenge';
export type DifficultyPref = 'Relaxed' | 'Easy' | 'Medium' | 'Hard' | 'Extreme';
export type RewardPriority = 'xp' | 'coins' | 'exploration' | 'rare_items' | 'balanced';

export interface AdventurePreferences {
  length: AdventureLength;
  style: AdventureStylePref;
  difficulty: DifficultyPref;
  rewardPriority: RewardPriority;
}

export const LENGTH_OPTIONS = [
  { id: '10-15' as const, label: '10–15 min', icon: 'Zap' },
  { id: '20-30' as const, label: '20–30 min', icon: 'Clock' },
  { id: '30-45' as const, label: '30–45 min', icon: 'Clock' },
  { id: '45-60' as const, label: '45–60 min', icon: 'Clock' },
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
  id: string; name: string; emoji: string; accent: string;
  challengeTypes: ChallengeCategory[]; rewardBias: RewardPriority;
  namePrefixes: string[]; nameSuffixes: string[]; descTemplates: string[];
}

export const ADVENTURE_THEMES: AdventureTheme[] = [
  {
    id: 'lost_explorer', name: 'Lost Explorer', emoji: '🧭', accent: 'from-nova-400 to-cyan-500',
    challengeTypes: ['explorer', 'precision'], rewardBias: 'exploration',
    namePrefixes: ['Forgotten', 'Hidden', 'Lost', 'Ancient', 'Mystic'],
    nameSuffixes: ['Trail', 'Path', 'Route', 'Way', 'Passage'],
    descTemplates: [
      'A forgotten route through uncharted territory awaits.',
      'Legends speak of a path lost to time. Will you find it?',
      'Explore the unknown and discover what lies beyond.',
    ],
  },
  {
    id: 'hidden_treasure', name: 'Hidden Treasure', emoji: '💎', accent: 'from-gold-300 to-ember-500',
    challengeTypes: ['treasure', 'precision'], rewardBias: 'rare_items',
    namePrefixes: ['Golden', 'Jeweled', 'Secret', 'Buried', 'Cursed'],
    nameSuffixes: ['Cache', 'Vault', 'Stash', 'Hoard', 'Treasure'],
    descTemplates: [
      'A legendary treasure lies hidden somewhere nearby.',
      'Follow the clues to uncover a fortune in gems.',
      'X marks the spot — but can you reach it?',
    ],
  },
  {
    id: 'mountain_expedition', name: 'Mountain Expedition', emoji: '⛰️', accent: 'from-slate-400 to-nova-500',
    challengeTypes: ['endurance', 'balance', 'speed'], rewardBias: 'xp',
    namePrefixes: ['Summit', 'Peak', 'Alpine', 'Highland', 'Ridge'],
    nameSuffixes: ['Ascent', 'Climb', 'Trek', 'Expedition', 'Challenge'],
    descTemplates: [
      'Conquer the mountain on this challenging expedition.',
      'The summit calls — will you answer?',
      'A breathtaking climb with rewards to match.',
    ],
  },
  {
    id: 'city_discovery', name: 'City Discovery', emoji: '🏙️', accent: 'from-plasma-400 to-nova-500',
    challengeTypes: ['explorer', 'speed', 'decision'], rewardBias: 'balanced',
    namePrefixes: ['Urban', 'Neon', 'Metro', 'Downtown', 'City'],
    nameSuffixes: ['Maze', 'Circuit', 'Loop', 'Hunt', 'Discovery'],
    descTemplates: [
      'Discover the hidden gems of your city.',
      'Every street has a story. What will you find?',
      'Navigate the urban jungle on this discovery adventure.',
    ],
  },
  {
    id: 'nature_escape', name: 'Nature Escape', emoji: '🌿', accent: 'from-green-400 to-nova-500',
    challengeTypes: ['explorer', 'balance'], rewardBias: 'exploration',
    namePrefixes: ['Forest', 'Meadow', 'River', 'Wild', 'Green'],
    nameSuffixes: ['Walk', 'Trail', 'Wander', 'Escape', 'Retreat'],
    descTemplates: [
      'Escape into nature on this peaceful trail.',
      'Breathe deep and let nature guide you.',
      'A serene journey through green landscapes.',
    ],
  },
  {
    id: 'weekend_wanderer', name: 'Weekend Wanderer', emoji: '🚶', accent: 'from-nova-400 to-cyan-400',
    challengeTypes: ['explorer', 'decision'], rewardBias: 'balanced',
    namePrefixes: ['Weekend', 'Casual', 'Easy', 'Sunday', 'Leisure'],
    nameSuffixes: ['Stroll', 'Wander', 'Walk', 'Loop', 'Ramble'],
    descTemplates: [
      'A perfect weekend wander for the casual explorer.',
      'Take it easy on this leisurely stroll.',
      'No pressure, no rush — just you and the path.',
    ],
  },
  {
    id: 'sunset_journey', name: 'Sunset Journey', emoji: '🌅', accent: 'from-ember-400 to-rose-500',
    challengeTypes: ['explorer', 'endurance'], rewardBias: 'xp',
    namePrefixes: ['Sunset', 'Golden', 'Twilight', 'Dusk', 'Evening'],
    nameSuffixes: ['Journey', 'Walk', 'Promenade', 'Drift', 'Voyage'],
    descTemplates: [
      'Chase the sunset on this golden hour journey.',
      'The sky is painted gold — perfect for a walk.',
      'End your day with a breathtaking sunset adventure.',
    ],
  },
  {
    id: 'ancient_route', name: 'Ancient Route', emoji: '🏛️', accent: 'from-gold-400 to-ember-600',
    challengeTypes: ['explorer', 'treasure', 'decision'], rewardBias: 'rare_items',
    namePrefixes: ['Ancient', 'Old', 'Historic', 'Forgotten', 'Eternal'],
    nameSuffixes: ['Route', 'Road', 'Way', 'Path', 'Pilgrimage'],
    descTemplates: [
      'Walk in the footsteps of ancients on this historic route.',
      'Centuries of history await on this ancient path.',
      'Discover ruins and relics on this timeless journey.',
    ],
  },
  {
    id: 'urban_treasure_hunt', name: 'Urban Treasure Hunt', emoji: '🔍', accent: 'from-plasma-400 to-gold-500',
    challengeTypes: ['treasure', 'speed', 'precision'], rewardBias: 'rare_items',
    namePrefixes: ['Urban', 'Street', 'Alley', 'Rooftop', 'Underground'],
    nameSuffixes: ['Hunt', 'Search', 'Quest', 'Pursuit', 'Chase'],
    descTemplates: [
      'A fast-paced treasure hunt through city streets.',
      'Clues are everywhere — can you piece them together?',
      'Race against time to claim the urban treasure.',
    ],
  },
  {
    id: 'morning_sprint', name: 'Morning Sprint', emoji: '☀️', accent: 'from-gold-300 to-ember-400',
    challengeTypes: ['speed', 'endurance'], rewardBias: 'xp',
    namePrefixes: ['Morning', 'Dawn', 'Sunrise', 'Early', 'Fresh'],
    nameSuffixes: ['Sprint', 'Dash', 'Burst', 'Charge', 'Run'],
    descTemplates: [
      'Start your day with an energizing morning sprint.',
      'Beat the sunrise on this fast-paced adventure.',
      'A quick burst of exploration to wake you up.',
    ],
  },
];

// --- Challenge System (Phase 7) ---
export type ChallengeCategory = 'explorer' | 'collector' | 'adventure' | 'community' | 'seasonal' | 'master' | 'balance' | 'treasure' | 'speed' | 'precision' | 'endurance' | 'decision';

export interface ChallengeCategoryMeta {
  id: ChallengeCategory; label: string; icon: string; accent: string;
}

export const CHALLENGE_CATEGORIES: ChallengeCategoryMeta[] = [
  { id: 'explorer', label: 'Explorer', icon: 'Compass', accent: 'from-nova-400 to-cyan-500' },
  { id: 'collector', label: 'Collector', icon: 'Gem', accent: 'from-gold-300 to-ember-500' },
  { id: 'adventure', label: 'Adventure', icon: 'Swords', accent: 'from-ember-400 to-rose-500' },
  { id: 'community', label: 'Community', icon: 'Users', accent: 'from-plasma-400 to-nova-500' },
  { id: 'seasonal', label: 'Seasonal', icon: 'CalendarStar', accent: 'from-green-400 to-nova-500' },
  { id: 'master', label: 'Master', icon: 'Crown', accent: 'from-rose-400 to-plasma-500' },
];

export interface ChallengeDef {
  id: string; title: string; description: string;
  category: ChallengeCategory; difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic';
  baseReward: number; icon: string; accent: string;
  reward?: number;
}

export const CHALLENGES: ChallengeDef[] = [
  { id: 'ch1', title: 'First Steps', description: 'Complete your first adventure', category: 'explorer', difficulty: 'Easy', baseReward: 100, icon: 'Footprints', accent: 'from-nova-400 to-cyan-400' },
  { id: 'ch2', title: 'Pathfinder', description: 'Explore 5 different routes', category: 'explorer', difficulty: 'Medium', baseReward: 250, icon: 'Compass', accent: 'from-nova-400 to-cyan-500' },
  { id: 'ch3', title: 'Cartographer', description: 'Complete 10 unique adventures', category: 'explorer', difficulty: 'Hard', baseReward: 500, icon: 'Map', accent: 'from-nova-400 to-cyan-600' },
  { id: 'ch4', title: 'Treasure Seeker', description: 'Find your first treasure chest', category: 'collector', difficulty: 'Easy', baseReward: 150, icon: 'Gem', accent: 'from-gold-300 to-ember-400' },
  { id: 'ch5', title: 'Treasure Hunter', description: 'Find 10 treasure chests', category: 'collector', difficulty: 'Medium', baseReward: 400, icon: 'Gem', accent: 'from-gold-300 to-ember-500' },
  { id: 'ch6', title: 'Treasure Lord', description: 'Find a Legendary treasure', category: 'collector', difficulty: 'Epic', baseReward: 1000, icon: 'Crown', accent: 'from-gold-300 to-ember-600' },
  { id: 'ch7', title: 'Combo Starter', description: 'Achieve a 5x combo', category: 'adventure', difficulty: 'Easy', baseReward: 200, icon: 'Flame', accent: 'from-ember-400 to-rose-400' },
  { id: 'ch8', title: 'Combo Master', description: 'Achieve a 15x combo', category: 'adventure', difficulty: 'Hard', baseReward: 600, icon: 'Flame', accent: 'from-ember-400 to-rose-500' },
  { id: 'ch9', title: 'Combo Legend', description: 'Achieve a 25x combo', category: 'adventure', difficulty: 'Epic', baseReward: 1200, icon: 'Zap', accent: 'from-ember-500 to-rose-600' },
  { id: 'ch10', title: 'Social Walker', description: 'Add your first friend', category: 'community', difficulty: 'Easy', baseReward: 100, icon: 'UserPlus', accent: 'from-plasma-400 to-nova-400' },
  { id: 'ch11', title: 'Route Sharer', description: 'Share an adventure with the community', category: 'community', difficulty: 'Medium', baseReward: 300, icon: 'Share2', accent: 'from-plasma-400 to-nova-500' },
  { id: 'ch12', title: 'Event Participant', description: 'Join a seasonal event', category: 'seasonal', difficulty: 'Easy', baseReward: 200, icon: 'CalendarStar', accent: 'from-green-400 to-nova-400' },
  { id: 'ch13', title: 'Event Champion', description: 'Complete all seasonal event challenges', category: 'seasonal', difficulty: 'Epic', baseReward: 800, icon: 'Trophy', accent: 'from-green-400 to-nova-500' },
  { id: 'ch14', title: 'Speed Runner', description: 'Complete an adventure in record time', category: 'adventure', difficulty: 'Hard', baseReward: 500, icon: 'Gauge', accent: 'from-ember-400 to-gold-500' },
  { id: 'ch15', title: 'Marathon Walker', description: 'Walk 50 km total', category: 'adventure', difficulty: 'Hard', baseReward: 700, icon: 'Activity', accent: 'from-nova-400 to-cyan-500' },
  { id: 'ch16', title: 'Master Explorer', description: 'Reach Level 10', category: 'master', difficulty: 'Epic', baseReward: 1500, icon: 'Crown', accent: 'from-rose-400 to-plasma-500' },
  { id: 'ch17', title: 'Collector Supreme', description: 'Own 20 cosmetic items', category: 'collector', difficulty: 'Hard', baseReward: 600, icon: 'Sparkles', accent: 'from-gold-300 to-plasma-500' },
  { id: 'ch18', title: 'Daily Devotee', description: 'Login 7 days in a row', category: 'master', difficulty: 'Medium', baseReward: 400, icon: 'CalendarCheck', accent: 'from-rose-400 to-plasma-400' },
  { id: 'ch19', title: 'Adventure Creator', description: 'Create and share a custom adventure', category: 'community', difficulty: 'Medium', baseReward: 350, icon: 'PenTool', accent: 'from-plasma-400 to-nova-500' },
];

// --- Challenge Zones ---
export type ChallengeZoneType = 'balance' | 'explorer' | 'treasure' | 'speed' | 'precision' | 'endurance' | 'decision';

export interface ChallengeZone {
  id: string; type: ChallengeZoneType; label: string;
  x: number; y: number; radius: number; icon: string; accent: string; color: string;
}

export const ZONE_META: Record<ChallengeZoneType, { label: string; icon: string; accent: string; color: string }> = {
  balance: { label: 'Balance Challenge', icon: 'Scale', accent: 'from-nova-400 to-nova-600', color: '#1fe3b0' },
  explorer: { label: 'Explorer Zone', icon: 'Compass', accent: 'from-cyan-300 to-nova-500', color: '#40f5cb' },
  treasure: { label: 'Treasure Zone', icon: 'Gem', accent: 'from-gold-400 to-ember-500', color: '#fbbf24' },
  speed: { label: 'Speed Zone', icon: 'Gauge', accent: 'from-ember-400 to-ember-600', color: '#fb923c' },
  precision: { label: 'Precision Zone', icon: 'Crosshair', accent: 'from-cyan-300 to-nova-400', color: '#22d3ee' },
  endurance: { label: 'Endurance Zone', icon: 'Activity', accent: 'from-ember-400 to-gold-500', color: '#f97316' },
  decision: { label: 'Decision Point', icon: 'GitFork', accent: 'from-plasma-400 to-nova-500', color: '#a78bfa' },
};

// --- Treasure System ---
export type TreasureRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface TreasureRarityMeta {
  id: TreasureRarity; label: string; coinMult: number; xpMult: number;
  color: string; emoji: string; glow: string;
}

export const TREASURE_RARITIES: TreasureRarityMeta[] = [
  { id: 'common', label: 'Common', coinMult: 1, xpMult: 1, color: '#94a3b8', emoji: '📦', glow: '' },
  { id: 'rare', label: 'Rare', coinMult: 1.5, xpMult: 1.3, color: '#40f5cb', emoji: '💎', glow: 'shadow-glow' },
  { id: 'epic', label: 'Epic', coinMult: 2, xpMult: 1.6, color: '#a78bfa', emoji: '🔮', glow: 'shadow-glow-plasma' },
  { id: 'legendary', label: 'Legendary', coinMult: 3, xpMult: 2, color: '#fbbf24', emoji: '👑', glow: 'shadow-glow-gold' },
];

export const TREASURE_RARITY_MAP: Record<TreasureRarity, TreasureRarityMeta> = Object.fromEntries(
  TREASURE_RARITIES.map((r) => [r.id, r]),
) as Record<TreasureRarity, TreasureRarityMeta>;

// --- Mystery Events ---
export type MysteryEventType = 'double_coins' | 'double_xp' | 'rare_boost' | 'time_warp' | 'lucky_chest' | 'ghost_route' | 'bonus_challenge';

export interface MysteryEventDef {
  id: MysteryEventType; label: string; icon: string; color: string; duration: number;
}

export const MYSTERY_EVENTS: MysteryEventDef[] = [
  { id: 'double_coins', label: 'Double Coins!', icon: 'Coins', color: '#fbbf24', duration: 30 },
  { id: 'double_xp', label: 'Double XP!', icon: 'Zap', color: '#40f5cb', duration: 30 },
  { id: 'rare_boost', label: 'Rare Boost!', icon: 'Gem', color: '#a78bfa', duration: 20 },
  { id: 'time_warp', label: 'Time Warp!', icon: 'Clock', color: '#22d3ee', duration: 15 },
  { id: 'lucky_chest', label: 'Lucky Chest!', icon: 'Gift', color: '#f43f5e', duration: 0 },
  { id: 'ghost_route', label: 'Ghost Route!', icon: 'Ghost', color: '#94a3b8', duration: 25 },
  { id: 'bonus_challenge', label: 'Bonus Challenge!', icon: 'Swords', color: '#fb923c', duration: 20 },
];

// --- Combo System ---
export type ComboTier = { threshold: number; label: string; xpMult: number; coinMult: number; rareChance: number; accent: string };

export const COMBO_TIERS: ComboTier[] = [
  { threshold: 1, label: 'No Combo', xpMult: 1, coinMult: 1, rareChance: 0.04, accent: 'from-slate-400 to-slate-600' },
  { threshold: 2, label: '2x Combo', xpMult: 1.1, coinMult: 1.1, rareChance: 0.06, accent: 'from-nova-300 to-nova-500' },
  { threshold: 5, label: '5x Combo', xpMult: 1.25, coinMult: 1.25, rareChance: 0.10, accent: 'from-ember-400 to-gold-500' },
  { threshold: 10, label: '10x Combo', xpMult: 1.5, coinMult: 1.5, rareChance: 0.15, accent: 'from-plasma-400 to-ember-500' },
  { threshold: 15, label: '15x Combo', xpMult: 1.75, coinMult: 1.75, rareChance: 0.22, accent: 'from-gold-300 to-rose-500' },
  { threshold: 20, label: '20x Combo', xpMult: 2, coinMult: 2, rareChance: 0.30, accent: 'from-rose-400 to-plasma-500' },
];

export function getComboTier(combo: number): ComboTier {
  let tier = COMBO_TIERS[0];
  for (const t of COMBO_TIERS) if (combo >= t.threshold) tier = t;
  return tier;
}

// --- Encouragement Messages ---
export const ENCOURAGEMENT_MESSAGES = [
  { text: 'Amazing work!', icon: 'Sparkles' },
  { text: 'You are on fire!', icon: 'Flame' },
  { text: 'Keep going strong!', icon: 'Zap' },
  { text: 'Incredible pace!', icon: 'Gauge' },
  { text: 'You are a natural explorer!', icon: 'Compass' },
  { text: 'Legendary skills!', icon: 'Crown' },
  { text: 'Unstoppable!', icon: 'Rocket' },
  { text: 'Trail blazer!', icon: 'Footprints' },
  { text: 'Treasure hunter extraordinaire!', icon: 'Gem' },
  { text: 'Combo master!', icon: 'Flame' },
  { text: 'Adventure awaits!', icon: 'Compass' },
  { text: 'You are making progress!', icon: 'TrendingUp' },
];

// --- Decision Routes ---
export interface DecisionRoute { id: string; label: string; icon: string; risk: 'safe' | 'medium' | 'high'; reward: number }
export const DECISION_ROUTES: DecisionRoute[] = [
  { id: 'safe', label: 'Safe Path', icon: 'Shield', risk: 'safe', reward: 100 },
  { id: 'medium', label: 'Scenic Detour', icon: 'MapPin', risk: 'medium', reward: 200 },
  { id: 'high', label: 'Dangerous Shortcut', icon: 'Skull', risk: 'high', reward: 400 },
  { id: 'mystery', label: 'Unknown Route', icon: 'Question', risk: 'high', reward: 500 },
];

// --- Accessibility Settings (Phase 10 extended) ---
export interface AccessibilitySettings {
  relaxedMode: boolean;
  reducedChallengeFrequency: boolean;
  disableChallengeAnimations: boolean;
  skipChallenges: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  colorblindMode: boolean;
  screenReaderLabels: boolean;
  minTouchTarget: boolean;
}

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  relaxedMode: false,
  reducedChallengeFrequency: false,
  disableChallengeAnimations: false,
  skipChallenges: false,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  colorblindMode: false,
  screenReaderLabels: false,
  minTouchTarget: false,
};

// --- Notification Settings (Phase 10) ---
export interface NotificationSettings {
  dailyRewards: boolean;
  seasonalEvents: boolean;
  friendActivity: boolean;
  adventureReminders: boolean;
  achievementUnlocks: boolean;
  communityUpdates: boolean;
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyRewards: true,
  seasonalEvents: true,
  friendActivity: false,
  adventureReminders: true,
  achievementUnlocks: true,
  communityUpdates: false,
};

// --- Privacy Settings (Phase 10) ---
export interface PrivacySettings {
  locationSharing: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  friendRequests: 'everyone' | 'friends_of_friends' | 'nobody';
  activitySharing: boolean;
  publicAdventures: boolean;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  locationSharing: true,
  profileVisibility: 'friends',
  friendRequests: 'everyone',
  activitySharing: true,
  publicAdventures: true,
};

// --- Active State Types ---
export interface ActiveChallenge { challengeId: string; progress: number; target: number; completed: boolean }
export interface ActiveMysteryEvent { type: MysteryEventType; label: string; icon: string; color: string; timeRemaining: number; duration: number }

// --- Avatar ---
export interface Avatar { id: string; name: string; emoji: string; color: string }
export const AVATARS: Avatar[] = [
  { id: 'av1', name: 'Nova', emoji: '🧭', color: 'from-nova-400 to-cyan-500' },
  { id: 'av2', name: 'Ember', emoji: '🔥', color: 'from-ember-400 to-rose-500' },
  { id: 'av3', name: 'Gold', emoji: '⭐', color: 'from-gold-300 to-ember-500' },
  { id: 'av4', name: 'Plasma', emoji: '🔮', color: 'from-plasma-400 to-nova-500' },
  { id: 'av5', name: 'Rose', emoji: '🌸', color: 'from-rose-400 to-plasma-500' },
  { id: 'av6', name: 'Leaf', emoji: '🌿', color: 'from-green-400 to-nova-500' },
];

// --- Adventure Styles ---
export type AdventureStyle = 'explorer' | 'treasure_hunter' | 'relaxed' | 'fitness' | 'story' | 'challenge';
export const ADVENTURE_STYLES = [
  { id: 'explorer' as const, label: 'Explorer', icon: 'Compass', desc: 'Discover hidden routes' },
  { id: 'treasure_hunter' as const, label: 'Treasure Hunter', icon: 'Gem', desc: 'Find rare loot' },
  { id: 'relaxed' as const, label: 'Relaxed', icon: 'Leaf', desc: 'Easy-going walks' },
  { id: 'fitness' as const, label: 'Fitness', icon: 'Activity', desc: 'Push your limits' },
  { id: 'story' as const, label: 'Story', icon: 'BookOpen', desc: 'Narrative adventures' },
  { id: 'challenge' as const, label: 'Challenge', icon: 'Swords', desc: 'Test your skills' },
];

// --- Profile ---
export interface Profile {
  playerId: string;
  username: string;
  avatar: Avatar;
  style: AdventureStyle;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
  lastDailyClaim: string | null;
  dailyStreak: number;
  distanceKm: number;
  adventuresCompleted: number;
  challengesCompleted: number;
  challengesFailed: number;
  bestCombo: number;
  equippedTrail: string | null;
  equippedPet: string | null;
  equippedTheme: string | null;
  equippedStickers: string[];
  equippedBadges: string[];
  units: 'km' | 'mi';
  language: string;
}

export const DEFAULT_PROFILE: Profile = {
  playerId: 'p_' + Math.random().toString(36).slice(2, 12),
  username: 'Explorer',
  avatar: AVATARS[0],
  style: 'explorer',
  xp: 0,
  level: 1,
  coins: 500,
  gems: 10,
  streak: 0,
  lastDailyClaim: null,
  dailyStreak: 0,
  distanceKm: 0,
  adventuresCompleted: 0,
  challengesCompleted: 0,
  challengesFailed: 0,
  bestCombo: 0,
  equippedTrail: null,
  equippedPet: null,
  equippedTheme: null,
  equippedStickers: [],
  equippedBadges: [],
  units: 'km',
  language: 'en',
};

// --- Level System ---
export interface LevelInfo { level: number; title: string; minXp: number; maxXp: number; emoji: string }
export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Trailhead', minXp: 0, maxXp: 500, emoji: '🚶' },
  { level: 2, title: 'Wanderer', minXp: 500, maxXp: 1200, emoji: '🧭' },
  { level: 3, title: 'Explorer', minXp: 1200, maxXp: 2200, emoji: '🗺️' },
  { level: 4, title: 'Adventurer', minXp: 2200, maxXp: 3500, emoji: '⛰️' },
  { level: 5, title: 'Pathfinder', minXp: 3500, maxXp: 5200, emoji: '🧗' },
  { level: 6, title: 'Trailblazer', minXp: 5200, maxXp: 7500, emoji: '🔥' },
  { level: 7, title: 'Cartographer', minXp: 7500, maxXp: 10500, emoji: '📐' },
  { level: 8, title: 'Voyager', minXp: 10500, maxXp: 14500, emoji: '🚀' },
  { level: 9, title: 'Conqueror', minXp: 14500, maxXp: 20000, emoji: '⚔️' },
  { level: 10, title: 'Legend', minXp: 20000, maxXp: 999999, emoji: '👑' },
];

export function getLevelInfo(level: number): LevelInfo {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)];
}

export function getLevelProgress(xp: number): { info: LevelInfo; current: number; needed: number; pct: number } {
  const info = LEVELS.find((l) => xp >= l.minXp && xp < l.maxXp) ?? LEVELS[LEVELS.length - 1];
  const current = xp - info.minXp;
  const needed = info.maxXp - info.minXp;
  return { info, current, needed, pct: current / needed };
}

// --- Daily Missions ---
export interface DailyMission {
  id: string; title: string; detail: string; icon: string;
  target: number; current: number; unit: string; xp: number;
}

export const DAILY_MISSIONS: DailyMission[] = [
  { id: 'dm1', title: 'Walk 1 km', detail: 'Explore your surroundings', icon: 'Footprints', target: 1, current: 0.4, unit: 'km', xp: 50 },
  { id: 'dm2', title: 'Collect 10 coins', detail: 'Find coins on your adventure', icon: 'Coins', target: 10, current: 4, unit: 'coins', xp: 30 },
  { id: 'dm3', title: 'Complete 1 challenge', detail: 'Test your skills', icon: 'Swords', target: 1, current: 0, unit: 'done', xp: 80 },
  { id: 'dm4', title: 'Find a treasure', detail: 'Open a treasure chest', icon: 'Gem', target: 1, current: 0, unit: 'found', xp: 60 },
  { id: 'dm5', title: 'Maintain a 5x combo', detail: 'Chain your achievements', icon: 'Flame', target: 5, current: 0, unit: 'x', xp: 100 },
];

// --- Achievements ---
export type AchievementCategory = 'Explorer' | 'Collector' | 'Adventure' | 'Community' | 'Seasonal' | 'Master';

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ['Explorer', 'Collector', 'Adventure', 'Community', 'Seasonal', 'Master'];

export interface Achievement {
  id: string; title: string; description: string;
  category: AchievementCategory; tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  icon: string; unlocked: boolean; date?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach1', title: 'First Adventure', description: 'Complete your first adventure', category: 'Explorer', tier: 'bronze', icon: 'Footprints', unlocked: true, date: '2 days ago' },
  { id: 'ach2', title: 'Pathfinder', description: 'Complete 5 adventures', category: 'Explorer', tier: 'silver', icon: 'Compass', unlocked: true, date: '1 day ago' },
  { id: 'ach3', title: 'Cartographer', description: 'Complete 25 adventures', category: 'Explorer', tier: 'gold', icon: 'Map', unlocked: false },
  { id: 'ach4', title: 'Treasure Seeker', description: 'Find your first treasure', category: 'Collector', tier: 'bronze', icon: 'Gem', unlocked: true, date: '2 days ago' },
  { id: 'ach5', title: 'Treasure Hunter', description: 'Find 50 treasures', category: 'Collector', tier: 'silver', icon: 'Gem', unlocked: false },
  { id: 'ach6', title: 'Treasure Lord', description: 'Find a Legendary treasure', category: 'Collector', tier: 'legendary', icon: 'Crown', unlocked: false },
  { id: 'ach7', title: 'Combo Starter', description: 'Achieve a 5x combo', category: 'Adventure', tier: 'bronze', icon: 'Flame', unlocked: true, date: '3 days ago' },
  { id: 'ach8', title: 'Combo Master', description: 'Achieve a 20x combo', category: 'Adventure', tier: 'gold', icon: 'Zap', unlocked: false },
  { id: 'ach9', title: 'Social Walker', description: 'Add 5 friends', category: 'Community', tier: 'silver', icon: 'Users', unlocked: false },
  { id: 'ach10', title: 'Route Sharer', description: 'Share 3 adventures', category: 'Community', tier: 'bronze', icon: 'Share2', unlocked: false },
  { id: 'ach11', title: 'Event Participant', description: 'Join a seasonal event', category: 'Seasonal', tier: 'bronze', icon: 'CalendarStar', unlocked: false },
  { id: 'ach12', title: 'Master Explorer', description: 'Reach Level 10', category: 'Master', tier: 'legendary', icon: 'Crown', unlocked: false },
];

// --- Badges ---
export interface Badge { id: string; label: string; icon: string; color: string }
export const BADGES: Badge[] = [
  { id: 'bg1', label: 'Early Bird', icon: 'Sunrise', color: 'from-ember-400 to-gold-500' },
  { id: 'bg2', label: 'Night Owl', icon: 'Moon', color: 'from-plasma-500 to-ink-700' },
  { id: 'bg3', label: 'Trail Master', icon: 'Mountain', color: 'from-nova-400 to-cyan-500' },
  { id: 'bg4', label: 'Treasure Lord', icon: 'Gem', color: 'from-gold-300 to-ember-500' },
  { id: 'bg5', label: 'Combo King', icon: 'Flame', color: 'from-ember-400 to-rose-500' },
  { id: 'bg6', label: 'Legend', icon: 'Crown', color: 'from-rose-400 to-plasma-500' },
];

// --- Community Data ---
export interface LeaderboardEntry { rank: number; name: string; avatar: string; xp: number; you?: boolean }
export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'TrailBlazer99', avatar: '🧭', xp: 24500 },
  { rank: 2, name: 'MountainGoat', avatar: '🐐', xp: 18900 },
  { rank: 3, name: 'NovaSeeker', avatar: '✨', xp: 15200 },
  { rank: 4, name: 'You', avatar: '🧭', xp: 3200, you: true },
  { rank: 5, name: 'Wanderlust', avatar: '🚶', xp: 2100 },
  { rank: 6, name: 'PathFinder', avatar: '🗺️', xp: 1800 },
];

export interface Friend { id: string; name: string; avatar: string; status: 'online' | 'offline' | 'on_adventure'; distance: string }
export const FRIENDS: Friend[] = [
  { id: 'f1', name: 'Alex', avatar: '🧑', status: 'on_adventure', distance: '2.3 km away' },
  { id: 'f2', name: 'Sam', avatar: '👩', status: 'online', distance: '0.8 km away' },
  { id: 'f3', name: 'Jordan', avatar: '🧔', status: 'offline', distance: '5.1 km away' },
];

export interface PopularRoute { id: string; name: string; author: string; distance: string; rating: number; plays: number; emoji: string; accent: string }
export const POPULAR_ROUTES: PopularRoute[] = [
  { id: 'pr1', name: 'Riverside Stroll', author: 'TrailBlazer99', distance: '2.1 km', rating: 4.8, plays: 1240, emoji: '🌊', accent: 'from-cyan-400 to-nova-500' },
  { id: 'pr2', name: 'Old Town Quest', author: 'HistoryBuff', distance: '1.5 km', rating: 4.6, plays: 890, emoji: '🏛️', accent: 'from-gold-400 to-ember-500' },
  { id: 'pr3', name: 'Park Explorer', author: 'NatureFan', distance: '3.0 km', rating: 4.9, plays: 2100, emoji: '🌳', accent: 'from-green-400 to-nova-500' },
];

// --- Map Entity Types ---
export interface MapPoint { x: number; y: number }
export interface MapCheckpoint { id: string; label: string; kind: 'start' | 'challenge' | 'treasure' | 'finish'; x: number; y: number; reward: number; done: boolean }
export interface MapTreasure { id: string; x: number; y: number; coins: number; xp: number; opened: boolean; rarity: TreasureRarity }
export interface MapCoin { id: string; x: number; y: number; collected: boolean }

// --- Adventure Types ---
export type AdventureType = 'explorer' | 'treasure_hunt' | 'relaxed_walk' | 'challenge_run';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Epic';

export const ADVENTURE_TYPE_META: Record<AdventureType, { label: string; icon: string; accent: string }> = {
  explorer: { label: 'Explorer', icon: 'Compass', accent: 'from-nova-400 to-cyan-500' },
  treasure_hunt: { label: 'Treasure Hunt', icon: 'Gem', accent: 'from-gold-300 to-ember-500' },
  relaxed_walk: { label: 'Relaxed Walk', icon: 'Leaf', accent: 'from-green-400 to-nova-500' },
  challenge_run: { label: 'Challenge Run', icon: 'Swords', accent: 'from-ember-400 to-rose-500' },
};

export interface Adventure {
  id: string; name: string; description: string;
  type: AdventureType; difficulty: Difficulty;
  distanceKm: number; durationMin: number;
  xpReward: number; coinReward: number;
  accent: string; emoji: string; image: string;
  challenges: string[];
  routePath: MapPoint[];
  checkpoints: MapCheckpoint[];
  treasures: MapTreasure[];
  coins: MapCoin[];
  zones: ChallengeZone[];
  themeId?: string;
  isAIGenerated?: boolean;
  isDaily?: boolean;
  isWeekly?: boolean;
  bonusMultiplier?: number;
  plays: number;
  rating: number;
}

export function buildAdventure(p: Partial<Adventure> & { id: string; name: string; type: AdventureType; difficulty: Difficulty; accent: string; emoji: string; image: string }): Adventure {
  return {
    description: '', distanceKm: 1, durationMin: 30, xpReward: 100, coinReward: 50,
    challenges: [], routePath: [], checkpoints: [], treasures: [], coins: [], zones: [],
    plays: 0, rating: 0, ...p,
  };
}

// --- Pre-built Adventures ---
const IMG = 'https://images.pexels.com/photos';
export const ADVENTURES: Adventure[] = [
  buildAdventure({
    id: 'adv1', name: 'Mystic Forest Trail', description: 'A serene walk through ancient woodland.',
    type: 'explorer', difficulty: 'Easy', distanceKm: 1.2, durationMin: 20,
    xpReward: 120, coinReward: 80, accent: 'from-green-400 to-nova-500', emoji: '🌲',
    image: `${IMG}/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800`,
    challenges: ['ch1', 'ch2'], routePath: [{ x: 15, y: 75 }, { x: 50, y: 50 }, { x: 85, y: 25 }],
    checkpoints: [
      { id: 'cp1', label: 'Trailhead', kind: 'start', x: 15, y: 75, reward: 0, done: false },
      { id: 'cp2', label: 'Hidden Grove', kind: 'treasure', x: 50, y: 50, reward: 200, done: false },
      { id: 'cp3', label: 'Ancient Oak', kind: 'finish', x: 85, y: 25, reward: 300, done: false },
    ],
    treasures: [{ id: 't1', x: 50, y: 50, coins: 100, xp: 50, opened: false, rarity: 'rare' }],
    coins: [{ id: 'co1', x: 30, y: 60, collected: false }, { id: 'co2', x: 70, y: 40, collected: false }],
    zones: [], plays: 342, rating: 4.7,
  }),
  buildAdventure({
    id: 'adv2', name: 'Urban Discovery', description: 'Find hidden gems in the city.',
    type: 'explorer', difficulty: 'Medium', distanceKm: 2.5, durationMin: 35,
    xpReward: 200, coinReward: 150, accent: 'from-plasma-400 to-nova-500', emoji: '🏙️',
    image: `${IMG}/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800`,
    challenges: ['ch2', 'ch7'], routePath: [{ x: 12, y: 80 }, { x: 35, y: 55 }, { x: 60, y: 40 }, { x: 88, y: 20 }],
    checkpoints: [
      { id: 'cp1', label: 'Start', kind: 'start', x: 12, y: 80, reward: 0, done: false },
      { id: 'cp2', label: 'Plaza', kind: 'challenge', x: 35, y: 55, reward: 150, done: false },
      { id: 'cp3', label: 'Alley Cache', kind: 'treasure', x: 60, y: 40, reward: 250, done: false },
      { id: 'cp4', label: 'Rooftop', kind: 'finish', x: 88, y: 20, reward: 350, done: false },
    ],
    treasures: [{ id: 't1', x: 60, y: 40, coins: 200, xp: 100, opened: false, rarity: 'epic' }],
    coins: [{ id: 'co1', x: 25, y: 65, collected: false }, { id: 'co2', x: 50, y: 45, collected: false }, { id: 'co3', x: 75, y: 30, collected: false }],
    zones: [], plays: 521, rating: 4.5,
  }),
  buildAdventure({
    id: 'adv3', name: 'Treasure Cove', description: 'Hunt for legendary treasure.',
    type: 'treasure_hunt', difficulty: 'Hard', distanceKm: 3.0, durationMin: 45,
    xpReward: 350, coinReward: 250, accent: 'from-gold-300 to-ember-500', emoji: '💎',
    image: `${IMG}/1010659/pexels-photo-1010659.jpeg?auto=compress&cs=tinysrgb&w=800`,
    challenges: ['ch4', 'ch5', 'ch7'], routePath: [{ x: 10, y: 85 }, { x: 30, y: 60 }, { x: 55, y: 45 }, { x: 80, y: 25 }, { x: 90, y: 15 }],
    checkpoints: [
      { id: 'cp1', label: 'Beach Start', kind: 'start', x: 10, y: 85, reward: 0, done: false },
      { id: 'cp2', label: 'Clue Point', kind: 'challenge', x: 30, y: 60, reward: 200, done: false },
      { id: 'cp3', label: 'Hidden Cave', kind: 'treasure', x: 55, y: 45, reward: 400, done: false },
      { id: 'cp4', label: 'X Marks Spot', kind: 'finish', x: 90, y: 15, reward: 500, done: false },
    ],
    treasures: [
      { id: 't1', x: 55, y: 45, coins: 300, xp: 150, opened: false, rarity: 'epic' },
      { id: 't2', x: 80, y: 25, coins: 500, xp: 250, opened: false, rarity: 'legendary' },
    ],
    coins: [{ id: 'co1', x: 20, y: 70, collected: false }, { id: 'co2', x: 45, y: 50, collected: false }, { id: 'co3', x: 70, y: 30, collected: false }],
    zones: [], plays: 189, rating: 4.9,
  }),
  buildAdventure({
    id: 'adv4', name: 'Mountain Challenge', description: 'Test your endurance on this mountain trek.',
    type: 'challenge_run', difficulty: 'Epic', distanceKm: 5.0, durationMin: 60,
    xpReward: 500, coinReward: 350, accent: 'from-slate-400 to-nova-500', emoji: '⛰️',
    image: `${IMG}/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800`,
    challenges: ['ch3', 'ch8', 'ch14', 'ch15'], routePath: [{ x: 15, y: 85 }, { x: 35, y: 65 }, { x: 50, y: 45 }, { x: 70, y: 25 }, { x: 85, y: 10 }],
    checkpoints: [
      { id: 'cp1', label: 'Base Camp', kind: 'start', x: 15, y: 85, reward: 0, done: false },
      { id: 'cp2', label: 'Switchback', kind: 'challenge', x: 35, y: 65, reward: 300, done: false },
      { id: 'cp3', label: 'Ridge Cache', kind: 'treasure', x: 50, y: 45, reward: 500, done: false },
      { id: 'cp4', label: 'Final Push', kind: 'challenge', x: 70, y: 25, reward: 400, done: false },
      { id: 'cp5', label: 'Summit', kind: 'finish', x: 85, y: 10, reward: 800, done: false },
    ],
    treasures: [{ id: 't1', x: 50, y: 45, coins: 400, xp: 200, opened: false, rarity: 'legendary' }],
    coins: [{ id: 'co1', x: 25, y: 75, collected: false }, { id: 'co2', x: 45, y: 55, collected: false }, { id: 'co3', x: 65, y: 35, collected: false }, { id: 'co4', x: 80, y: 18, collected: false }],
    zones: [], plays: 95, rating: 4.8,
  }),
  buildAdventure({
    id: 'adv5', name: 'Sunset Promenade', description: 'A relaxing golden-hour stroll.',
    type: 'relaxed_walk', difficulty: 'Easy', distanceKm: 0.8, durationMin: 15,
    xpReward: 80, coinReward: 60, accent: 'from-ember-400 to-rose-500', emoji: '🌅',
    image: `${IMG}/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800`,
    challenges: ['ch1'], routePath: [{ x: 20, y: 70 }, { x: 50, y: 50 }, { x: 80, y: 30 }],
    checkpoints: [
      { id: 'cp1', label: 'Start', kind: 'start', x: 20, y: 70, reward: 0, done: false },
      { id: 'cp2', label: 'Viewpoint', kind: 'treasure', x: 50, y: 50, reward: 150, done: false },
      { id: 'cp3', label: 'End', kind: 'finish', x: 80, y: 30, reward: 200, done: false },
    ],
    treasures: [{ id: 't1', x: 50, y: 50, coins: 80, xp: 40, opened: false, rarity: 'common' }],
    coins: [{ id: 'co1', x: 35, y: 60, collected: false }, { id: 'co2', x: 65, y: 40, collected: false }],
    zones: [], plays: 678, rating: 4.6,
  }),
  buildAdventure({
    id: 'adv6', name: 'Ancient Ruins Quest', description: 'Discover the secrets of a lost civilization.',
    type: 'explorer', difficulty: 'Medium', distanceKm: 2.0, durationMin: 30,
    xpReward: 180, coinReward: 140, accent: 'from-gold-400 to-ember-600', emoji: '🏛️',
    image: `${IMG}/1004584/pexels-photo-1004584.jpeg?auto=compress&cs=tinysrgb&w=800`,
    challenges: ['ch2', 'ch4', 'ch10'], routePath: [{ x: 12, y: 78 }, { x: 38, y: 52 }, { x: 62, y: 38 }, { x: 88, y: 22 }],
    checkpoints: [
      { id: 'cp1', label: 'Temple Gate', kind: 'start', x: 12, y: 78, reward: 0, done: false },
      { id: 'cp2', label: 'Relic Chamber', kind: 'treasure', x: 38, y: 52, reward: 250, done: false },
      { id: 'cp3', label: 'Inner Sanctum', kind: 'challenge', x: 62, y: 38, reward: 200, done: false },
      { id: 'cp4', label: 'Throne Room', kind: 'finish', x: 88, y: 22, reward: 400, done: false },
    ],
    treasures: [{ id: 't1', x: 38, y: 52, coins: 250, xp: 120, opened: false, rarity: 'rare' }],
    coins: [{ id: 'co1', x: 25, y: 65, collected: false }, { id: 'co2', x: 50, y: 45, collected: false }, { id: 'co3', x: 75, y: 30, collected: false }],
    zones: [], plays: 234, rating: 4.7,
  }),
];

export const DAILY_ADVENTURE_SEED: Adventure = {
  ...ADVENTURES[0],
  id: 'daily-seed', name: 'Daily Explorer', isDaily: true, bonusMultiplier: 2,
  xpReward: 240, coinReward: 160,
};

export const WEEKLY_ADVENTURE_SEED: Adventure = {
  ...ADVENTURES[2],
  id: 'weekly-seed', name: 'Weekly Treasure Hunt', isWeekly: true, bonusMultiplier: 3,
  xpReward: 1050, coinReward: 750,
};

// --- Recommendation Engine ---
export interface Recommendation { condition: (p: Profile) => boolean; text: string; icon: string }
export const RECOMMENDATION_TEMPLATES: Recommendation[] = [
  { condition: (p) => p.streak === 0, text: 'Start your first adventure today!', icon: 'Rocket' },
  { condition: (p) => p.streak > 0 && p.streak < 3, text: 'Keep your streak going!', icon: 'Flame' },
  { condition: (p) => p.streak >= 3, text: 'You are on fire! Keep exploring!', icon: 'TrendingUp' },
  { condition: (p) => p.adventuresCompleted === 0, text: 'Your first adventure awaits!', icon: 'Compass' },
  { condition: (p) => p.adventuresCompleted > 0 && p.bestCombo < 5, text: 'Try a challenge to build your combo!', icon: 'Swords' },
];

// --- Loading Tips ---
export const LOADING_TIPS = [
  'Tip: Walk near parks to find more treasures!',
  'Did you know? Combos increase your XP and coin rewards.',
  'Tip: Login daily for bigger rewards each day.',
  'Fun fact: Explorers walk an average of 5 km per week.',
  'Tip: Equip a trail to leave a unique mark on the map.',
  'Did you know? Pets follow you on every adventure.',
  'Tip: Higher difficulty means better rewards.',
  'Fun fact: The longest Nuvra adventure is over 10 km!',
  'Tip: Check the shop for new cosmetics every day.',
  'Did you know? Seasonal events offer exclusive items.',
];

export const LOADING_FACTS = [
  'Walking 10,000 steps burns approximately 300-400 calories.',
  'A brisk 30-minute walk can boost your mood for up to 2 hours.',
  'Walking can improve creativity by up to 60%.',
  'Regular walking can reduce the risk of heart disease by 35%.',
  'The average person walks about 150,000 km in their lifetime.',
];
