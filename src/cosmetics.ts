// ============================================================
// Nuvra Phase 9+10 — Cosmetics, Collectibles & Seasonal Data
// ============================================================

export type CosmeticRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface CosmeticRarityMeta {
  id: CosmeticRarity; label: string; color: string;
  borderColor: string; accent: string; glowClass: string;
  animation: string; shimmer: boolean;
}

export const COSMETIC_RARITIES: CosmeticRarityMeta[] = [
  { id: 'common', label: 'Common', color: '#94a3b8', borderColor: 'border-slate-500/40', accent: 'from-slate-400 to-slate-600', glowClass: 'shadow-glass', animation: '', shimmer: false },
  { id: 'uncommon', label: 'Uncommon', color: '#4ade80', borderColor: 'border-green-500/40', accent: 'from-green-400 to-green-600', glowClass: 'shadow-[0_0_16px_rgba(74,222,128,0.3)]', animation: '', shimmer: false },
  { id: 'rare', label: 'Rare', color: '#40f5cb', borderColor: 'border-nova-400/50', accent: 'from-nova-300 to-nova-500', glowClass: 'shadow-glow', animation: 'animate-pulse-glow', shimmer: false },
  { id: 'epic', label: 'Epic', color: '#a78bfa', borderColor: 'border-plasma-400/50', accent: 'from-plasma-400 to-plasma-600', glowClass: 'shadow-glow-plasma', animation: 'animate-pulse-glow', shimmer: true },
  { id: 'legendary', label: 'Legendary', color: '#fbbf24', borderColor: 'border-gold-400/50', accent: 'from-gold-300 to-ember-500', glowClass: 'shadow-glow-gold', animation: 'animate-pulse-glow', shimmer: true },
  { id: 'mythic', label: 'Mythic', color: '#f43f5e', borderColor: 'border-rose-500/50', accent: 'from-rose-400 to-plasma-500', glowClass: 'shadow-glow-rose', animation: 'animate-rarity-glow', shimmer: true },
];

export const COSMETIC_RARITY_MAP: Record<CosmeticRarity, CosmeticRarityMeta> = Object.fromEntries(
  COSMETIC_RARITIES.map((r) => [r.id, r]),
) as Record<CosmeticRarity, CosmeticRarityMeta>;

export type CosmeticSlot =
  | 'hairstyle' | 'hairColor' | 'skinTone' | 'eyes' | 'facial'
  | 'shirt' | 'jacket' | 'pants' | 'shorts' | 'shoes' | 'hat' | 'glasses' | 'backpack';

export interface CosmeticItem {
  id: string; name: string; slot: CosmeticSlot; rarity: CosmeticRarity;
  icon: string; emoji: string; price: number; currency: 'coins' | 'gems'; desc: string;
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  { id: 'hair1', name: 'Classic Cut', slot: 'hairstyle', rarity: 'common', icon: 'User', emoji: '💇', price: 0, currency: 'coins', desc: 'The default explorer look.' },
  { id: 'hair2', name: 'Wild Spike', slot: 'hairstyle', rarity: 'uncommon', icon: 'Zap', emoji: '⚡', price: 150, currency: 'coins', desc: 'Spiky and adventurous.' },
  { id: 'hair3', name: 'Flowing Locks', slot: 'hairstyle', rarity: 'rare', icon: 'Wind', emoji: '🌬️', price: 400, currency: 'coins', desc: 'Wind-swept and free.' },
  { id: 'hair4', name: 'Cosmic Crown', slot: 'hairstyle', rarity: 'epic', icon: 'Sparkles', emoji: '✨', price: 30, currency: 'gems', desc: 'Hair that shimmers like stars.' },
  { id: 'hair5', name: 'Mythic Mane', slot: 'hairstyle', rarity: 'mythic', icon: 'Crown', emoji: '👑', price: 80, currency: 'gems', desc: 'A legendary hairstyle for true legends.' },
  { id: 'hc1', name: 'Natural Black', slot: 'hairColor', rarity: 'common', icon: 'Palette', emoji: '🖤', price: 0, currency: 'coins', desc: 'Classic and timeless.' },
  { id: 'hc2', name: 'Nova Green', slot: 'hairColor', rarity: 'rare', icon: 'Palette', emoji: '💚', price: 300, currency: 'coins', desc: 'Glow with Nuvra energy.' },
  { id: 'hc3', name: 'Ember Red', slot: 'hairColor', rarity: 'uncommon', icon: 'Palette', emoji: '🧡', price: 200, currency: 'coins', desc: 'Fiery and bold.' },
  { id: 'hc4', name: 'Plasma Purple', slot: 'hairColor', rarity: 'epic', icon: 'Palette', emoji: '💜', price: 25, currency: 'gems', desc: 'Charged with plasma energy.' },
  { id: 'hc5', name: 'Galaxy Ombre', slot: 'hairColor', rarity: 'legendary', icon: 'Palette', emoji: '🌌', price: 50, currency: 'gems', desc: 'A galaxy in every strand.' },
  { id: 'sk1', name: 'Porcelain', slot: 'skinTone', rarity: 'common', icon: 'Circle', emoji: '🤍', price: 0, currency: 'coins', desc: 'Light and fair.' },
  { id: 'sk2', name: 'Honey', slot: 'skinTone', rarity: 'common', icon: 'Circle', emoji: '💛', price: 0, currency: 'coins', desc: 'Warm and golden.' },
  { id: 'sk3', name: 'Bronze', slot: 'skinTone', rarity: 'common', icon: 'Circle', emoji: '🤎', price: 0, currency: 'coins', desc: 'Sun-kissed bronze.' },
  { id: 'sk4', name: 'Deep Oak', slot: 'skinTone', rarity: 'common', icon: 'Circle', emoji: '🖤', price: 0, currency: 'coins', desc: 'Rich and deep.' },
  { id: 'eye1', name: 'Bright Eyes', slot: 'eyes', rarity: 'common', icon: 'Eye', emoji: '👀', price: 0, currency: 'coins', desc: 'Default explorer eyes.' },
  { id: 'eye2', name: 'Star Gaze', slot: 'eyes', rarity: 'rare', icon: 'Star', emoji: '⭐', price: 350, currency: 'coins', desc: 'Eyes that twinkle like stars.' },
  { id: 'eye3', name: 'Plasma Vision', slot: 'eyes', rarity: 'epic', icon: 'Sparkles', emoji: '🔮', price: 20, currency: 'gems', desc: 'Glowing with plasma energy.' },
  { id: 'fac1', name: 'Clean Shave', slot: 'facial', rarity: 'common', icon: 'Smile', emoji: '😊', price: 0, currency: 'coins', desc: 'Smooth and ready.' },
  { id: 'fac2', name: 'Explorer Beard', slot: 'facial', rarity: 'uncommon', icon: 'Wind', emoji: '🧔', price: 180, currency: 'coins', desc: 'Rugged and adventurous.' },
  { id: 'fac3', name: 'Mythic Mark', slot: 'facial', rarity: 'mythic', icon: 'Sparkles', emoji: '🔮', price: 70, currency: 'gems', desc: 'A glowing mark of legend.' },
  { id: 'sh1', name: 'Explorer Tee', slot: 'shirt', rarity: 'common', icon: 'Shirt', emoji: '👕', price: 0, currency: 'coins', desc: 'The classic explorer shirt.' },
  { id: 'sh2', name: 'Trail Blazer', slot: 'shirt', rarity: 'uncommon', icon: 'Shirt', emoji: '🧥', price: 200, currency: 'coins', desc: 'Blaze the trail in style.' },
  { id: 'sh3', name: 'Nova Jersey', slot: 'shirt', rarity: 'rare', icon: 'Shirt', emoji: '💚', price: 450, currency: 'coins', desc: 'Glowing with Nuvra energy.' },
  { id: 'sh4', name: 'Ember Vest', slot: 'shirt', rarity: 'epic', icon: 'Shirt', emoji: '🔥', price: 35, currency: 'gems', desc: 'Warm even in the coldest adventures.' },
  { id: 'sh5', name: 'Mythic Tunic', slot: 'shirt', rarity: 'mythic', icon: 'Shirt', emoji: '👑', price: 90, currency: 'gems', desc: 'Worn by the greatest explorers.' },
  { id: 'jk1', name: 'Windbreaker', slot: 'jacket', rarity: 'uncommon', icon: 'Cloud', emoji: '🌬️', price: 250, currency: 'coins', desc: 'Light and protective.' },
  { id: 'jk2', name: 'Storm Coat', slot: 'jacket', rarity: 'rare', icon: 'CloudRain', emoji: '🌧️', price: 500, currency: 'coins', desc: 'Weather any storm.' },
  { id: 'jk3', name: 'Plasma Cloak', slot: 'jacket', rarity: 'legendary', icon: 'Sparkles', emoji: '✨', price: 55, currency: 'gems', desc: 'A cloak woven from pure plasma.' },
  { id: 'pn1', name: 'Trail Pants', slot: 'pants', rarity: 'common', icon: 'Footprints', emoji: '👖', price: 0, currency: 'coins', desc: 'Durable and comfortable.' },
  { id: 'pn2', name: 'Cargo Explorer', slot: 'pants', rarity: 'uncommon', icon: 'Package', emoji: '🩳', price: 220, currency: 'coins', desc: 'Pockets for every treasure.' },
  { id: 'pn3', name: 'Nova Leggings', slot: 'pants', rarity: 'rare', icon: 'Zap', emoji: '⚡', price: 400, currency: 'coins', desc: 'Energy-infused leggings.' },
  { id: 'sr1', name: 'Summer Shorts', slot: 'shorts', rarity: 'common', icon: 'Sun', emoji: '🩲', price: 100, currency: 'coins', desc: 'Cool and breezy.' },
  { id: 'sr2', name: 'Adventure Shorts', slot: 'shorts', rarity: 'uncommon', icon: 'Sun', emoji: '🏖️', price: 200, currency: 'coins', desc: 'Ready for any terrain.' },
  { id: 'sho1', name: 'Walker Boots', slot: 'shoes', rarity: 'common', icon: 'Footprints', emoji: '👟', price: 0, currency: 'coins', desc: 'Reliable and sturdy.' },
  { id: 'sho2', name: 'Speed Runners', slot: 'shoes', rarity: 'rare', icon: 'Zap', emoji: '⚡', price: 380, currency: 'coins', desc: 'Feel the speed.' },
  { id: 'sho3', name: 'Hover Boots', slot: 'shoes', rarity: 'epic', icon: 'Cloud', emoji: '🚀', price: 30, currency: 'gems', desc: 'Glide above the ground.' },
  { id: 'sho4', name: 'Mythic Striders', slot: 'shoes', rarity: 'mythic', icon: 'Crown', emoji: '👑', price: 75, currency: 'gems', desc: 'Boots of the ancient gods.' },
  { id: 'ht1', name: 'Explorer Cap', slot: 'hat', rarity: 'common', icon: 'HardHat', emoji: '🧢', price: 120, currency: 'coins', desc: 'Classic explorer cap.' },
  { id: 'ht2', name: 'Wide Brim', slot: 'hat', rarity: 'uncommon', icon: 'Sun', emoji: '👒', price: 250, currency: 'coins', desc: 'Sun protection in style.' },
  { id: 'ht3', name: 'Plasma Crown', slot: 'hat', rarity: 'legendary', icon: 'Crown', emoji: '👑', price: 60, currency: 'gems', desc: 'A crown of pure plasma.' },
  { id: 'ht4', name: 'Mythic Helm', slot: 'hat', rarity: 'mythic', icon: 'Shield', emoji: '🪖', price: 85, currency: 'gems', desc: 'Helm of the mythic guard.' },
  { id: 'gl1', name: 'Explorer Shades', slot: 'glasses', rarity: 'uncommon', icon: 'Eye', emoji: '🕶️', price: 180, currency: 'coins', desc: 'Cool and protective.' },
  { id: 'gl2', name: 'Nova Visor', slot: 'glasses', rarity: 'rare', icon: 'Eye', emoji: '🥽', price: 350, currency: 'coins', desc: 'See with Nuvra vision.' },
  { id: 'gl3', name: 'Plasma Goggles', slot: 'glasses', rarity: 'epic', icon: 'Sparkles', emoji: '🔮', price: 25, currency: 'gems', desc: 'Goggles infused with plasma.' },
  { id: 'bp1', name: 'Trail Pack', slot: 'backpack', rarity: 'common', icon: 'Package', emoji: '🎒', price: 150, currency: 'coins', desc: 'Carry your essentials.' },
  { id: 'bp2', name: 'Adventure Pack', slot: 'backpack', rarity: 'uncommon', icon: 'Package', emoji: '🧳', price: 300, currency: 'coins', desc: 'For the serious explorer.' },
  { id: 'bp3', name: 'Nova Pack', slot: 'backpack', rarity: 'rare', icon: 'Sparkles', emoji: '✨', price: 450, currency: 'coins', desc: 'Glows with Nuvra energy.' },
  { id: 'bp4', name: 'Mythic Satchel', slot: 'backpack', rarity: 'mythic', icon: 'Crown', emoji: '👑', price: 80, currency: 'gems', desc: 'A satchel of legends.' },
];

export interface TrailDef {
  id: string; name: string; emoji: string; rarity: CosmeticRarity;
  color: string; accent: string; animation: string; price: number; currency: 'coins' | 'gems';
  desc: string; preview: string;
}

export const TRAILS: TrailDef[] = [
  { id: 'tr1', name: 'Blue Energy', emoji: '💙', rarity: 'uncommon', color: '#40f5cb', accent: 'from-nova-300 to-cyan-400', animation: 'animate-pulse-glow', price: 300, currency: 'coins', desc: 'A trail of glowing blue energy particles.', preview: 'blue' },
  { id: 'tr2', name: 'Rainbow', emoji: '🌈', rarity: 'epic', color: '#a78bfa', accent: 'from-rose-400 via-gold-400 to-nova-400', animation: 'animate-trail-rainbow', price: 40, currency: 'gems', desc: 'A vibrant rainbow trail behind you.', preview: 'rainbow' },
  { id: 'tr3', name: 'Golden Sparkles', emoji: '✨', rarity: 'rare', color: '#fbbf24', accent: 'from-gold-300 to-gold-500', animation: 'animate-shimmer-coin', price: 500, currency: 'coins', desc: 'Sparkling golden particles in your wake.', preview: 'gold' },
  { id: 'tr4', name: 'Leaves', emoji: '🍃', rarity: 'uncommon', color: '#4ade80', accent: 'from-green-400 to-green-600', animation: 'animate-leaf-drift', price: 250, currency: 'coins', desc: 'Gentle leaves drifting behind you.', preview: 'leaves' },
  { id: 'tr5', name: 'Snowflakes', emoji: '❄️', rarity: 'rare', color: '#22d3ee', accent: 'from-cyan-300 to-nova-400', animation: 'animate-snowfall', price: 450, currency: 'coins', desc: 'Delicate snowflakes in your path.', preview: 'snow' },
  { id: 'tr6', name: 'Stars', emoji: '⭐', rarity: 'rare', color: '#fbbf24', accent: 'from-gold-300 to-ember-400', animation: 'animate-shimmer-coin', price: 400, currency: 'coins', desc: 'A galaxy of stars trailing behind.', preview: 'stars' },
  { id: 'tr7', name: 'Lightning', emoji: '⚡', rarity: 'epic', color: '#fbbf24', accent: 'from-gold-300 to-ember-500', animation: 'animate-pulse-glow', price: 35, currency: 'gems', desc: 'Crackling lightning in your footsteps.', preview: 'lightning' },
  { id: 'tr8', name: 'Fireflies', emoji: '🪲', rarity: 'uncommon', color: '#4ade80', accent: 'from-green-400 to-nova-400', animation: 'animate-firefly-flicker', price: 280, currency: 'coins', desc: 'Glowing fireflies dancing behind you.', preview: 'fireflies' },
  { id: 'tr9', name: 'Galaxy', emoji: '🌌', rarity: 'legendary', color: '#a78bfa', accent: 'from-plasma-400 to-rose-500', animation: 'animate-galaxy-spin', price: 60, currency: 'gems', desc: 'A swirling galaxy follows your every step.', preview: 'galaxy' },
  { id: 'tr10', name: 'Aurora', emoji: '🌅', rarity: 'legendary', color: '#40f5cb', accent: 'from-nova-300 via-plasma-400 to-rose-400', animation: 'animate-trail-rainbow', price: 55, currency: 'gems', desc: 'Northern lights dance in your wake.', preview: 'aurora' },
];

export interface PetDef {
  id: string; name: string; emoji: string; rarity: CosmeticRarity;
  personality: string; accent: string; price: number; currency: 'coins' | 'gems'; desc: string;
}

export const PETS: PetDef[] = [
  { id: 'pet1', name: 'Fox', emoji: '🦊', rarity: 'common', personality: 'Curious and loyal', accent: 'from-ember-400 to-ember-600', price: 500, currency: 'coins', desc: 'A curious fox companion who follows you everywhere.' },
  { id: 'pet2', name: 'Owl', emoji: '🦉', rarity: 'uncommon', personality: 'Wise and observant', accent: 'from-plasma-400 to-ink-700', price: 800, currency: 'coins', desc: 'A wise owl who watches over your adventures.' },
  { id: 'pet3', name: 'Dog', emoji: '🐕', rarity: 'common', personality: 'Energetic and playful', accent: 'from-gold-300 to-ember-500', price: 600, currency: 'coins', desc: 'A loyal dog who never leaves your side.' },
  { id: 'pet4', name: 'Cat', emoji: '🐱', rarity: 'uncommon', personality: 'Independent and sassy', accent: 'from-plasma-400 to-plasma-600', price: 750, currency: 'coins', desc: 'A sassy cat who walks to its own beat.' },
  { id: 'pet5', name: 'Dragon', emoji: '🐉', rarity: 'epic', personality: 'Bold and fierce', accent: 'from-ember-500 to-plasma-500', price: 45, currency: 'gems', desc: 'A baby dragon with a heart of fire.' },
  { id: 'pet6', name: 'Robot', emoji: '🤖', rarity: 'rare', personality: 'Helpful and precise', accent: 'from-nova-300 to-cyan-400', price: 600, currency: 'coins', desc: 'A helpful robot companion powered by Nuvra energy.' },
  { id: 'pet7', name: 'Baby Turtle', emoji: '🐢', rarity: 'uncommon', personality: 'Calm and steady', accent: 'from-green-400 to-nova-400', price: 700, currency: 'coins', desc: 'A gentle turtle who takes life at its own pace.' },
  { id: 'pet8', name: 'Phoenix', emoji: '🔥', rarity: 'legendary', personality: 'Majestic and reborn', accent: 'from-ember-400 to-rose-500', price: 70, currency: 'gems', desc: 'A phoenix reborn from the ashes of adventure.' },
];

export interface ProfileThemeDef {
  id: string; name: string; emoji: string; rarity: CosmeticRarity;
  bgGradient: string; accent: string; effect: string; price: number; currency: 'coins' | 'gems'; desc: string;
}

export const PROFILE_THEMES: ProfileThemeDef[] = [
  { id: 'th1', name: 'Forest', emoji: '🌲', rarity: 'uncommon', bgGradient: 'from-green-900 via-green-800 to-ink-950', accent: 'from-green-400 to-nova-400', effect: 'animate-leaf-drift', price: 400, currency: 'coins', desc: 'Lush green forest ambiance.' },
  { id: 'th2', name: 'Space', emoji: '🚀', rarity: 'epic', bgGradient: 'from-ink-950 via-plasma-950 to-ink-950', accent: 'from-plasma-400 to-nova-400', effect: 'animate-galaxy-spin', price: 40, currency: 'gems', desc: 'Deep space with swirling galaxies.' },
  { id: 'th3', name: 'Ocean', emoji: '🌊', rarity: 'rare', bgGradient: 'from-cyan-900 via-cyan-800 to-ink-950', accent: 'from-cyan-300 to-nova-400', effect: 'animate-float', price: 500, currency: 'coins', desc: 'Calm ocean depths.' },
  { id: 'th4', name: 'Mountain', emoji: '⛰️', rarity: 'uncommon', bgGradient: 'from-slate-800 via-ink-800 to-ink-950', accent: 'from-slate-300 to-nova-400', effect: 'animate-float-slow', price: 350, currency: 'coins', desc: 'Majestic mountain peaks.' },
  { id: 'th5', name: 'Cyber', emoji: '🤖', rarity: 'rare', bgGradient: 'from-plasma-950 via-ink-900 to-ink-950', accent: 'from-plasma-400 to-cyan-400', effect: 'animate-pulse-glow', price: 550, currency: 'coins', desc: 'Neon cyberpunk vibes.' },
  { id: 'th6', name: 'Volcano', emoji: '🌋', rarity: 'epic', bgGradient: 'from-ember-950 via-ember-900 to-ink-950', accent: 'from-ember-400 to-rose-500', effect: 'animate-pulse-glow', price: 45, currency: 'gems', desc: 'Molten lava and fire.' },
  { id: 'th7', name: 'Ancient Temple', emoji: '🏛️', rarity: 'rare', bgGradient: 'from-gold-950 via-ink-800 to-ink-950', accent: 'from-gold-300 to-ember-500', effect: 'animate-shimmer-coin', price: 500, currency: 'coins', desc: 'Mystic ancient ruins.' },
  { id: 'th8', name: 'Winter', emoji: '❄️', rarity: 'epic', bgGradient: 'from-cyan-800 via-blue-900 to-ink-950', accent: 'from-cyan-200 to-white', effect: 'animate-snowfall', price: 40, currency: 'gems', desc: 'A snowy winter wonderland.' },
];

export interface StickerDef {
  id: string; name: string; emoji: string; rarity: CosmeticRarity;
  accent: string; price: number; currency: 'coins' | 'gems';
}

export const STICKERS: StickerDef[] = [
  { id: 'st1', name: 'First Steps', emoji: '👣', rarity: 'common', accent: 'from-slate-400 to-slate-600', price: 100, currency: 'coins' },
  { id: 'st2', name: 'Treasure', emoji: '💎', rarity: 'rare', accent: 'from-gold-300 to-gold-500', price: 350, currency: 'coins' },
  { id: 'st3', name: 'Combo King', emoji: '🔥', rarity: 'epic', accent: 'from-ember-400 to-ember-600', price: 30, currency: 'gems' },
  { id: 'st4', name: 'Explorer', emoji: '🧭', rarity: 'uncommon', accent: 'from-nova-300 to-nova-500', price: 200, currency: 'coins' },
  { id: 'st5', name: 'Legend', emoji: '👑', rarity: 'legendary', accent: 'from-gold-300 to-ember-500', price: 50, currency: 'gems' },
  { id: 'st6', name: 'Mystery', emoji: '❓', rarity: 'rare', accent: 'from-plasma-400 to-plasma-600', price: 400, currency: 'coins' },
  { id: 'st7', name: 'Speed', emoji: '⚡', rarity: 'uncommon', accent: 'from-ember-400 to-gold-500', price: 250, currency: 'coins' },
  { id: 'st8', name: 'Galaxy', emoji: '🌌', rarity: 'mythic', accent: 'from-plasma-400 to-rose-500', price: 75, currency: 'gems' },
];

export interface CollectibleBadgeDef {
  id: string; name: string; emoji: string; rarity: CosmeticRarity;
  accent: string; desc: string; price: number; currency: 'coins' | 'gems';
}

export const COLLECTIBLE_BADGES: CollectibleBadgeDef[] = [
  { id: 'cb1', name: 'Dawn Walker', emoji: '🌅', rarity: 'uncommon', accent: 'from-ember-400 to-gold-500', desc: 'For those who walk at sunrise.', price: 200, currency: 'coins' },
  { id: 'cb2', name: 'Night Explorer', emoji: '🌙', rarity: 'rare', accent: 'from-plasma-500 to-ink-700', desc: 'For those who adventure after dark.', price: 400, currency: 'coins' },
  { id: 'cb3', name: 'Trail Master', emoji: '🏔️', rarity: 'epic', accent: 'from-nova-300 to-cyan-400', desc: 'For masters of every trail.', price: 35, currency: 'gems' },
  { id: 'cb4', name: 'Mythic Walker', emoji: '🔮', rarity: 'mythic', accent: 'from-rose-400 to-plasma-500', desc: 'For walkers of mythic proportions.', price: 80, currency: 'gems' },
  { id: 'cb5', name: 'Treasure Lord', emoji: '💎', rarity: 'legendary', accent: 'from-gold-300 to-ember-500', desc: 'For lords of all treasure.', price: 60, currency: 'gems' },
  { id: 'cb6', name: 'Community Star', emoji: '⭐', rarity: 'rare', accent: 'from-gold-300 to-gold-500', desc: 'For shining in the community.', price: 450, currency: 'coins' },
];

export interface SeasonalEvent {
  id: string; name: string; emoji: string; season: string; desc: string;
  accent: string; bgGradient: string; daysLeft: number;
  exclusiveCosmetics: string[]; badge: string; specialRewards: string[];
  status: 'active' | 'upcoming' | 'ended';
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  { id: 'se1', name: 'Summer Adventure', emoji: '☀️', season: 'Summer', desc: 'Soak up the sun with exclusive summer adventures and beach-themed cosmetics!', accent: 'from-ember-400 to-gold-500', bgGradient: 'from-ember-900 via-gold-900 to-ink-950', daysLeft: 18, exclusiveCosmetics: ['Summer Shorts', 'Sun Hat', 'Ocean Trail'], badge: 'cb1', specialRewards: ['+500 coins daily', 'Exclusive Summer Badge', 'Limited Sunset Trail'], status: 'active' },
  { id: 'se2', name: 'Autumn Explorer', emoji: '🍂', season: 'Autumn', desc: 'Crunch through fallen leaves with cozy autumn cosmetics and forest adventures.', accent: 'from-ember-500 to-ember-700', bgGradient: 'from-ember-950 via-ember-900 to-ink-950', daysLeft: 72, exclusiveCosmetics: ['Explorer Beard', 'Leaf Trail', 'Forest Theme'], badge: 'cb2', specialRewards: ['+400 coins daily', 'Exclusive Autumn Badge', 'Limited Leaf Trail'], status: 'upcoming' },
  { id: 'se3', name: 'Winter Expedition', emoji: '❄️', season: 'Winter', desc: 'Brave the cold with winter cosmetics and frosty adventures.', accent: 'from-cyan-300 to-nova-400', bgGradient: 'from-cyan-900 via-blue-900 to-ink-950', daysLeft: 164, exclusiveCosmetics: ['Storm Coat', 'Snowflake Trail', 'Winter Theme'], badge: 'cb3', specialRewards: ['+600 coins daily', 'Exclusive Winter Badge', 'Limited Snowflake Trail'], status: 'upcoming' },
  { id: 'se4', name: 'Halloween Hunt', emoji: '🎃', season: 'Halloween', desc: 'Spooky adventures with haunted cosmetics and mysterious rewards!', accent: 'from-plasma-500 to-ember-600', bgGradient: 'from-plasma-950 via-ember-950 to-ink-950', daysLeft: 102, exclusiveCosmetics: ['Mythic Helm', 'Plasma Cloak', 'Galaxy Trail'], badge: 'cb4', specialRewards: ['+800 coins daily', 'Exclusive Halloween Badge', 'Limited Spooky Trail'], status: 'upcoming' },
  { id: 'se5', name: 'Spring Festival', emoji: '🌸', season: 'Spring', desc: 'Celebrate renewal with blooming cosmetics and garden adventures.', accent: 'from-nova-300 to-green-400', bgGradient: 'from-green-900 via-nova-900 to-ink-950', daysLeft: 275, exclusiveCosmetics: ['Blossom Hat', 'Firefly Trail', 'Forest Theme'], badge: 'cb5', specialRewards: ['+400 coins daily', 'Exclusive Spring Badge', 'Limited Petals Trail'], status: 'upcoming' },
  { id: 'se6', name: 'Holiday Celebration', emoji: '🎄', season: 'Holiday', desc: 'Festive adventures with holiday cosmetics and joyful rewards!', accent: 'from-rose-400 to-green-500', bgGradient: 'from-rose-900 via-green-900 to-ink-950', daysLeft: 130, exclusiveCosmetics: ['Holiday Hat', 'Star Trail', 'Winter Theme'], badge: 'cb6', specialRewards: ['+1000 coins daily', 'Exclusive Holiday Badge', 'Limited Festive Trail'], status: 'upcoming' },
];

export interface DailyReward {
  day: number; type: 'coins' | 'xp' | 'gems' | 'cosmetic' | 'trail' | 'pet' | 'theme' | 'mystery';
  amount: number; label: string; icon: string; emoji: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, type: 'coins', amount: 100, label: '100 Coins', icon: 'Coins', emoji: '🪙' },
  { day: 2, type: 'xp', amount: 50, label: '50 XP', icon: 'Zap', emoji: '⚡' },
  { day: 3, type: 'coins', amount: 200, label: '200 Coins', icon: 'Coins', emoji: '🪙' },
  { day: 4, type: 'gems', amount: 5, label: '5 Gems', icon: 'Gem', emoji: '💎' },
  { day: 5, type: 'cosmetic', amount: 0, label: 'Explorer Cap', icon: 'HardHat', emoji: '🧢' },
  { day: 6, type: 'coins', amount: 300, label: '300 Coins', icon: 'Coins', emoji: '🪙' },
  { day: 7, type: 'trail', amount: 0, label: 'Blue Energy Trail', icon: 'Sparkles', emoji: '💙' },
];

export interface ShopBundle {
  id: string; name: string; emoji: string; desc: string; items: string[];
  price: number; currency: 'coins' | 'gems'; originalPrice: number;
  accent: string; rarity: CosmeticRarity;
}

export const SHOP_BUNDLES: ShopBundle[] = [
  { id: 'bnd1', name: 'Explorer Starter', emoji: '🎒', desc: 'Everything you need to start exploring in style.', items: ['Explorer Cap', 'Trail Pants', 'Trail Pack'], price: 500, currency: 'coins', originalPrice: 700, accent: 'from-nova-300 to-nova-500', rarity: 'uncommon' },
  { id: 'bnd2', name: 'Treasure Hunter Pack', emoji: '💎', desc: 'Become the ultimate treasure hunter.', items: ['Nova Jersey', 'Nova Visor', 'Nova Pack', 'Golden Sparkles Trail'], price: 35, currency: 'gems', originalPrice: 50, accent: 'from-gold-300 to-ember-500', rarity: 'epic' },
  { id: 'bnd3', name: 'Mythic Collection', emoji: '👑', desc: 'The finest cosmetics Nuvra has to offer.', items: ['Mythic Mane', 'Mythic Tunic', 'Mythic Striders', 'Mythic Satchel'], price: 200, currency: 'gems', originalPrice: 320, accent: 'from-rose-400 to-plasma-500', rarity: 'mythic' },
];

export type ShopCategory = 'avatar' | 'pets' | 'trails' | 'themes' | 'stickers' | 'badges' | 'bundles' | 'featured';
export const SHOP_CATEGORIES: { id: ShopCategory; label: string; icon: string }[] = [
  { id: 'featured', label: 'Featured', icon: 'Star' },
  { id: 'avatar', label: 'Avatar', icon: 'Shirt' },
  { id: 'pets', label: 'Pets', icon: 'Cat' },
  { id: 'trails', label: 'Trails', icon: 'Sparkles' },
  { id: 'themes', label: 'Themes', icon: 'Palette' },
  { id: 'stickers', label: 'Stickers', icon: 'Sticker' },
  { id: 'badges', label: 'Badges', icon: 'Award' },
  { id: 'bundles', label: 'Bundles', icon: 'Package' },
];

export type InventoryCategory = 'avatar' | 'trails' | 'pets' | 'themes' | 'stickers' | 'badges';
export type SortOption = 'recent' | 'rarity' | 'name' | 'price';

export interface OwnedItem { id: string; category: InventoryCategory; unlockedAt: number; favourite: boolean }

export interface ShopItem {
  id: string; name: string; emoji: string; rarity: CosmeticRarity;
  price: number; currency: 'coins' | 'gems'; desc: string; accent: string; icon: string;
}

export function getShopItems(cat: ShopCategory): ShopItem[] {
  switch (cat) {
    case 'avatar': return COSMETIC_ITEMS.filter((i) => i.price > 0).map((i) => ({ id: i.id, name: i.name, emoji: i.emoji, rarity: i.rarity, price: i.price, currency: i.currency, desc: i.desc, accent: COSMETIC_RARITY_MAP[i.rarity].accent, icon: i.icon }));
    case 'pets': return PETS.map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, rarity: p.rarity, price: p.price, currency: p.currency, desc: p.desc, accent: COSMETIC_RARITY_MAP[p.rarity].accent, icon: 'Cat' }));
    case 'trails': return TRAILS.map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, rarity: t.rarity, price: t.price, currency: t.currency, desc: t.desc, accent: t.accent, icon: 'Sparkles' }));
    case 'themes': return PROFILE_THEMES.map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, rarity: t.rarity, price: t.price, currency: t.currency, desc: t.desc, accent: COSMETIC_RARITY_MAP[t.rarity].accent, icon: 'Palette' }));
    case 'stickers': return STICKERS.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji, rarity: s.rarity, price: s.price, currency: s.currency, desc: s.name, accent: s.accent, icon: 'Sticker' }));
    case 'badges': return COLLECTIBLE_BADGES.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji, rarity: b.rarity, price: b.price, currency: b.currency, desc: b.desc, accent: COSMETIC_RARITY_MAP[b.rarity].accent, icon: 'Award' }));
    case 'bundles': return SHOP_BUNDLES.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji, rarity: b.rarity, price: b.price, currency: b.currency, desc: b.desc, accent: b.accent, icon: 'Package' }));
    case 'featured': return [
      ...TRAILS.filter((t) => t.rarity === 'legendary').map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, rarity: t.rarity, price: t.price, currency: t.currency, desc: t.desc, accent: t.accent, icon: 'Sparkles' })),
      ...PETS.filter((p) => p.rarity === 'legendary' || p.rarity === 'epic').map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, rarity: p.rarity, price: p.price, currency: p.currency, desc: p.desc, accent: COSMETIC_RARITY_MAP[p.rarity].accent, icon: 'Cat' })),
      ...PROFILE_THEMES.filter((t) => t.rarity === 'epic' || t.rarity === 'legendary').map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, rarity: t.rarity, price: t.price, currency: t.currency, desc: t.desc, accent: COSMETIC_RARITY_MAP[t.rarity].accent, icon: 'Palette' })),
    ];
    default: return [];
  }
}
