export const XP_PER_LEVEL = 100

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function xpProgressInLevel(xp: number): number {
  return xp % XP_PER_LEVEL
}

export function xpProgressPercent(xp: number): number {
  return (xpProgressInLevel(xp) / XP_PER_LEVEL) * 100
}

export const AVATAR_OPTIONS = [
  { emoji: '🧭', color: '#1c7af5' },
  { emoji: '🏔️', color: '#16a34a' },
  { emoji: '🌊', color: '#0891b2' },
  { emoji: '🌲', color: '#15803d' },
  { emoji: '⭐', color: '#d97706' },
  { emoji: '🌙', color: '#6d28d9' },
  { emoji: '🔥', color: '#dc2626' },
  { emoji: '💎', color: '#0891b2' },
  { emoji: '🦊', color: '#ea580c' },
  { emoji: '🦅', color: '#475569' },
  { emoji: '🐢', color: '#0d9488' },
  { emoji: '🦉', color: '#7c3aed' },
]

export const RARITY_COLORS: Record<string, string> = {
  common: 'text-neutral-500 bg-neutral-100 border-neutral-300',
  rare: 'text-primary-600 bg-primary-50 border-primary-200',
  epic: 'text-accent-600 bg-accent-50 border-accent-200',
  legendary: 'text-error-600 bg-error-50 border-error-200',
}

export const ADVENTURE_TYPES = [
  { type: 'treasure_hunt' as const, label: 'Treasure Hunt', icon: '🗺️', description: 'Follow waypoints to find hidden treasure', baseXp: 50, baseCoins: 100 },
  { type: 'distance_walk' as const, label: 'Distance Walk', icon: '🚶', description: 'Walk a target distance to earn rewards', baseXp: 30, baseCoins: 50 },
  { type: 'checkpoint' as const, label: 'Checkpoint Run', icon: '🚩', description: 'Reach checkpoints scattered around you', baseXp: 40, baseCoins: 75 },
  { type: 'exploration' as const, label: 'Exploration', icon: '🧭', description: 'Explore new areas of the map', baseXp: 35, baseCoins: 60 },
]

export interface AchievementProgress {
  steps: number
  distance_walked: number
  completed_adventures: number
  treasure_collected: number
  level: number
  coins: number
  walking_streak: number
  friends: number
  completed_challenges: number
}

export const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_steps', name: 'First Steps', description: 'Take your first 100 steps', icon: '👣', condition: (p: AchievementProgress) => p.steps >= 100 },
  { id: 'centurion', name: 'Centurion', description: 'Walk 1,000 meters', icon: '📏', condition: (p: AchievementProgress) => p.distance_walked >= 1000 },
  { id: 'marathoner', name: 'Marathoner', description: 'Walk 5,000 meters total', icon: '🏃', condition: (p: AchievementProgress) => p.distance_walked >= 5000 },
  { id: 'first_adventure', name: 'Trailblazer', description: 'Complete your first adventure', icon: '🗺️', condition: (p: AchievementProgress) => p.completed_adventures >= 1 },
  { id: 'adventurer_5', name: 'Seasoned Explorer', description: 'Complete 5 adventures', icon: '🧭', condition: (p: AchievementProgress) => p.completed_adventures >= 5 },
  { id: 'adventurer_10', name: 'Master Explorer', description: 'Complete 10 adventures', icon: '⛰️', condition: (p: AchievementProgress) => p.completed_adventures >= 10 },
  { id: 'first_treasure', name: 'Treasure Hunter', description: 'Collect your first treasure', icon: '💎', condition: (p: AchievementProgress) => p.treasure_collected >= 1 },
  { id: 'treasure_5', name: 'Collector', description: 'Collect 5 treasures', icon: '🗝️', condition: (p: AchievementProgress) => p.treasure_collected >= 5 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', condition: (p: AchievementProgress) => p.level >= 5 },
  { id: 'level_10', name: 'Veteran', description: 'Reach level 10', icon: '🌟', condition: (p: AchievementProgress) => p.level >= 10 },
  { id: 'rich', name: 'Coin Collector', description: 'Accumulate 5,000 coins', icon: '🪙', condition: (p: AchievementProgress) => p.coins >= 5000 },
  { id: 'streak_3', name: 'On a Roll', description: 'Walk 3 days in a row', icon: '🔥', condition: (p: AchievementProgress) => p.walking_streak >= 3 },
  { id: 'streak_7', name: 'Unstoppable', description: 'Walk 7 days in a row', icon: '⚡', condition: (p: AchievementProgress) => p.walking_streak >= 7 },
  { id: 'first_friend', name: 'Social Butterfly', description: 'Add your first friend', icon: '🤝', condition: (p: AchievementProgress) => p.friends >= 1 },
  { id: 'challenge_1', name: 'Challenger', description: 'Complete your first challenge', icon: '🎯', condition: (p: AchievementProgress) => p.completed_challenges >= 1 },
]

export const TREASURE_ITEMS = [
  { item_id: 'gem_ruby', item_name: 'Ruby Gem', icon: '🔴', rarity: 'rare' as const },
  { item_id: 'gem_sapphire', item_name: 'Sapphire Gem', icon: '🔵', rarity: 'rare' as const },
  { item_id: 'gem_emerald', item_name: 'Emerald Gem', icon: '🟢', rarity: 'rare' as const },
  { item_id: 'gold_coin', item_name: 'Gold Coin', icon: '🪙', rarity: 'common' as const },
  { item_id: 'ancient_relic', item_name: 'Ancient Relic', icon: '🏺', rarity: 'epic' as const },
  { item_id: 'mystery_box', item_name: 'Mystery Box', icon: '🎁', rarity: 'epic' as const },
  { item_id: 'dragon_scale', item_name: 'Dragon Scale', icon: '🐉', rarity: 'legendary' as const },
  { item_id: 'crystal_shard', item_name: 'Crystal Shard', icon: '💎', rarity: 'common' as const },
  { item_id: 'silver_key', item_name: 'Silver Key', icon: '🗝️', rarity: 'common' as const },
  { item_id: 'star_fragment', item_name: 'Star Fragment', icon: '⭐', rarity: 'legendary' as const },
]

export const COSMETIC_ITEMS = [
  { item_id: 'hat_explorer', item_name: 'Explorer Hat', icon: '🎩', rarity: 'common' as const, price: 200 },
  { item_id: 'hat_crown', item_name: 'Golden Crown', icon: '👑', rarity: 'legendary' as const, price: 2000 },
  { item_id: 'hat_wizard', item_name: 'Wizard Hat', icon: '🧙', rarity: 'epic' as const, price: 800 },
  { item_id: 'hat_party', item_name: 'Party Hat', icon: '🎉', rarity: 'rare' as const, price: 400 },
  { item_id: 'glasses_shades', item_name: 'Cool Shades', icon: '🕶️', rarity: 'rare' as const, price: 350 },
  { item_id: 'pet_dragon', item_name: 'Baby Dragon', icon: '🐲', rarity: 'legendary' as const, price: 3000 },
  { item_id: 'pet_unicorn', item_name: 'Mini Unicorn', icon: '🦄', rarity: 'epic' as const, price: 1200 },
  { item_id: 'aura_rainbow', item_name: 'Rainbow Aura', icon: '🌈', rarity: 'epic' as const, price: 1000 },
]
