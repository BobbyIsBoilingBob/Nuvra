export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type InventoryCategory = 'trails' | 'pets' | 'themes' | 'stickers' | 'badges';

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a78bfa',
  legendary: '#f59e0b',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export type CosmeticItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: InventoryCategory;
  rarity: Rarity;
  price: number;
  currency: 'coins' | 'gems';
};

export const COSMETICS: CosmeticItem[] = [
  { id: 'trail-sparkle', name: 'Sparkle Trail', description: 'Leave sparkles as you walk', emoji: '✨', category: 'trails', rarity: 'common', price: 200, currency: 'coins' },
  { id: 'trail-fire', name: 'Fire Trail', description: 'Blazing footprints', emoji: '🔥', category: 'trails', rarity: 'rare', price: 500, currency: 'coins' },
  { id: 'trail-rainbow', name: 'Rainbow Trail', description: 'A colorful path', emoji: '🌈', category: 'trails', rarity: 'epic', price: 10, currency: 'gems' },
  { id: 'pet-dog', name: 'Adventure Dog', description: 'A loyal companion', emoji: '🐕', category: 'pets', rarity: 'common', price: 300, currency: 'coins' },
  { id: 'pet-dragon', name: 'Baby Dragon', description: 'A mythical friend', emoji: '🐉', category: 'pets', rarity: 'legendary', price: 25, currency: 'gems' },
  { id: 'pet-cat', name: 'Explorer Cat', description: 'Curious and brave', emoji: '🐈', category: 'pets', rarity: 'rare', price: 600, currency: 'coins' },
  { id: 'theme-ocean', name: 'Ocean Theme', description: 'Deep blue vibes', emoji: '🌊', category: 'themes', rarity: 'rare', price: 400, currency: 'coins' },
  { id: 'theme-forest', name: 'Forest Theme', description: 'Earthy greens', emoji: '🌲', category: 'themes', rarity: 'common', price: 250, currency: 'coins' },
  { id: 'theme-galaxy', name: 'Galaxy Theme', description: 'Cosmic colors', emoji: '🌌', category: 'themes', rarity: 'epic', price: 15, currency: 'gems' },
  { id: 'sticker-star', name: 'Star Sticker', description: 'Show off your achievements', emoji: '⭐', category: 'stickers', rarity: 'common', price: 100, currency: 'coins' },
  { id: 'sticker-crown', name: 'Crown Sticker', description: 'For royalty', emoji: '👑', category: 'stickers', rarity: 'epic', price: 12, currency: 'gems' },
  { id: 'badge-explorer', name: 'Explorer Badge', description: 'For the curious', emoji: '🧭', category: 'badges', rarity: 'rare', price: 350, currency: 'coins' },
  { id: 'badge-master', name: 'Master Badge', description: 'For the elite', emoji: '🏅', category: 'badges', rarity: 'legendary', price: 30, currency: 'gems' },
];

export const SEASONAL_ITEMS: CosmeticItem[] = [
  { id: 'seasonal-winter1', name: 'Frost Trail', description: 'Frozen footprints', emoji: '❄️', category: 'trails', rarity: 'epic', price: 800, currency: 'coins' },
  { id: 'seasonal-winter2', name: 'Snow Pet', description: 'A snowy companion', emoji: '⛄', category: 'pets', rarity: 'rare', price: 600, currency: 'coins' },
  { id: 'seasonal-winter3', name: 'Aurora Theme', description: 'Northern lights', emoji: '🎆', category: 'themes', rarity: 'legendary', price: 20, currency: 'gems' },
];

export const ACHIEVEMENTS = [
  { id: 'a1', name: 'First Steps', description: 'Complete your first adventure', emoji: '👣', requirement: 1 },
  { id: 'a2', name: 'Explorer', description: 'Complete 10 adventures', emoji: '🗺️', requirement: 10 },
  { id: 'a3', name: 'Marathon Walker', description: 'Walk 42km total', emoji: '🏃', requirement: 42000 },
  { id: 'a4', name: 'Social Butterfly', description: 'Add 5 friends', emoji: '🦋', requirement: 5 },
  { id: 'a5', name: 'Treasure Hunter', description: 'Collect 50 treasures', emoji: '💎', requirement: 50 },
];
