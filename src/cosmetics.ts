export type CosmeticRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type InventoryCategory = 'trails' | 'pets' | 'themes' | 'stickers' | 'badges';

export type CosmeticItem = {
  id: string; name: string; category: InventoryCategory; rarity: CosmeticRarity;
  emoji: string; color: string; price: number; currency: 'coins' | 'gems';
  description: string;
};

export const RARITY_COLORS: Record<CosmeticRarity, string> = {
  common: '#94a3b8', uncommon: '#22c55e', rare: '#4de8ff', epic: '#8b5cf6', legendary: '#fbbf24', mythic: '#ef4444',
};

export const RARITY_LABELS: Record<CosmeticRarity, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic',
};

export const COSMETICS: CosmeticItem[] = [
  { id: 'trail1', name: 'Sparkle Trail', category: 'trails', rarity: 'common', emoji: '✨', color: '#fbbf24', price: 100, currency: 'coins', description: 'Leave a trail of sparkles as you walk' },
  { id: 'trail2', name: 'Frost Trail', category: 'trails', rarity: 'rare', emoji: '❄️', color: '#4de8ff', price: 300, currency: 'coins', description: 'A cool frosty trail behind you' },
  { id: 'trail3', name: 'Inferno Trail', category: 'trails', rarity: 'epic', emoji: '🔥', color: '#ef4444', price: 50, currency: 'gems', description: 'Blaze a trail of fire' },
  { id: 'pet1', name: 'Companion Cat', category: 'pets', rarity: 'uncommon', emoji: '🐱', color: '#fb923c', price: 200, currency: 'coins', description: 'A furry friend to walk with you' },
  { id: 'pet2', name: 'Spirit Owl', category: 'pets', rarity: 'rare', emoji: '🦉', color: '#8b5cf6', price: 500, currency: 'coins', description: 'A wise owl companion' },
  { id: 'pet3', name: 'Baby Dragon', category: 'pets', rarity: 'legendary', emoji: '🐉', color: '#ef4444', price: 100, currency: 'gems', description: 'A miniature dragon pet' },
  { id: 'theme1', name: 'Ocean Theme', category: 'themes', rarity: 'rare', emoji: '🌊', color: '#00c4ff', price: 400, currency: 'coins', description: 'Blue ocean color scheme' },
  { id: 'theme2', name: 'Sunset Theme', category: 'themes', rarity: 'epic', emoji: '🌅', color: '#fb923c', price: 30, currency: 'gems', description: 'Warm sunset colors' },
  { id: 'sticker1', name: 'Star Sticker', category: 'stickers', rarity: 'common', emoji: '⭐', color: '#fbbf24', price: 50, currency: 'coins', description: 'Decorate your profile' },
  { id: 'sticker2', name: 'Crown Sticker', category: 'stickers', rarity: 'epic', emoji: '👑', color: '#fbbf24', price: 40, currency: 'gems', description: 'Show your royalty' },
  { id: 'badge1', name: 'First Steps', category: 'badges', rarity: 'common', emoji: '👣', color: '#22c55e', price: 0, currency: 'coins', description: 'Complete your first adventure' },
  { id: 'badge2', name: 'Treasure Master', category: 'badges', rarity: 'legendary', emoji: '💎', color: '#fbbf24', price: 0, currency: 'coins', description: 'Find 50 treasures' },
];

export const SEASONAL_ITEMS: CosmeticItem[] = [
  { id: 'season1', name: 'Festive Trail', category: 'trails', rarity: 'epic', emoji: '🎄', color: '#22c55e', price: 60, currency: 'gems', description: 'Limited edition holiday trail' },
  { id: 'season2', name: 'Snow Pet', category: 'pets', rarity: 'rare', emoji: '⛄', color: '#4de8ff', price: 600, currency: 'coins', description: 'A festive snowman companion' },
  { id: 'season3', name: 'Aurora Theme', category: 'themes', rarity: 'legendary', emoji: '🌌', color: '#8b5cf6', price: 80, currency: 'gems', description: 'Northern lights theme' },
];

export type Achievement = {
  id: string; title: string; description: string; icon: string;
  category: 'Explorer' | 'Collector' | 'Adventure' | 'Community' | 'Seasonal' | 'Master';
  requirement: number; metric: string; tier: 'bronze' | 'silver' | 'gold' | 'legendary';
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Steps', description: 'Complete your first adventure', icon: 'Footprints', category: 'Adventure', requirement: 1, metric: 'adventures', tier: 'bronze' },
  { id: 'a2', title: 'Getting Started', description: 'Complete 5 adventures', icon: 'Compass', category: 'Adventure', requirement: 5, metric: 'adventures', tier: 'bronze' },
  { id: 'a3', title: 'Seasoned Explorer', description: 'Complete 25 adventures', icon: 'Map', category: 'Adventure', requirement: 25, metric: 'adventures', tier: 'silver' },
  { id: 'a4', title: 'Adventure Legend', description: 'Complete 100 adventures', icon: 'Crown', category: 'Adventure', requirement: 100, metric: 'adventures', tier: 'gold' },
  { id: 'a5', title: 'Kilometer Club', description: 'Walk 10 km total', icon: 'Route', category: 'Explorer', requirement: 10, metric: 'distance', tier: 'bronze' },
  { id: 'a6', title: 'Marathon Walker', description: 'Walk 42 km total', icon: 'Medal', category: 'Explorer', requirement: 42, metric: 'distance', tier: 'silver' },
  { id: 'a7', title: 'On Fire', description: 'Maintain a 3-day streak', icon: 'Flame', category: 'Adventure', requirement: 3, metric: 'streak', tier: 'bronze' },
  { id: 'a8', title: 'Treasure Seeker', description: 'Find 10 treasures', icon: 'Gem', category: 'Collector', requirement: 10, metric: 'treasures', tier: 'bronze' },
  { id: 'a9', title: 'Rising Star', description: 'Reach level 10', icon: 'Star', category: 'Master', requirement: 10, metric: 'level', tier: 'silver' },
  { id: 'a10', title: 'Zeviqo Master', description: 'Reach level 25', icon: 'Crown', category: 'Master', requirement: 25, metric: 'level', tier: 'legendary' },
];

export const ACHIEVEMENT_CATEGORIES = ['Explorer', 'Collector', 'Adventure', 'Community', 'Seasonal', 'Master'] as const;
