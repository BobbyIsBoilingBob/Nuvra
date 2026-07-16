import { useState, useMemo } from 'react';
import { Icon, GlassCard, Button, RarityBadge, RarityBorder, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import {
  COSMETIC_ITEMS,
  TRAILS,
  PETS,
  PROFILE_THEMES,
  STICKERS,
  COLLECTIBLE_BADGES,
  COSMETIC_RARITY_MAP,
  type InventoryCategory,
  type SortOption,
  type CosmeticRarity,
} from '../cosmetics';

interface ItemLookupEntry {
  id: string;
  name: string;
  emoji: string;
  rarity: CosmeticRarity;
  accent: string;
  desc: string;
  category: InventoryCategory;
}

const CATEGORY_FILTERS: { id: InventoryCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'Grid' },
  { id: 'avatar', label: 'Avatar', icon: 'Shirt' },
  { id: 'trails', label: 'Trails', icon: 'Sparkles' },
  { id: 'pets', label: 'Pets', icon: 'Cat' },
  { id: 'themes', label: 'Themes', icon: 'Palette' },
  { id: 'stickers', label: 'Stickers', icon: 'Sticker' },
  { id: 'badges', label: 'Badges', icon: 'Award' },
];

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: 'recent', label: 'Recent', icon: 'Clock' },
  { id: 'rarity', label: 'Rarity', icon: 'Gem' },
  { id: 'name', label: 'Name', icon: 'ATag' },
];

const RARITY_ORDER: Record<CosmeticRarity, number> = {
  mythic: 0,
  legendary: 1,
  epic: 2,
  rare: 3,
  uncommon: 4,
  common: 5,
};

export function Inventory(): React.ReactElement {
  const {
    profile,
    ownedItems,
    toggleFavourite,
    equipTrail,
    equipPet,
    equipTheme,
    toggleSticker,
    toggleBadge,
  } = useStore();
  const [filter, setFilter] = useState<InventoryCategory | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  // Build item lookup from all cosmetic sources
  const itemLookup = useMemo(() => {
    const map = new Map<string, ItemLookupEntry>();
    COSMETIC_ITEMS.forEach((i) => {
      map.set(i.id, { id: i.id, name: i.name, emoji: i.emoji, rarity: i.rarity, accent: COSMETIC_RARITY_MAP[i.rarity].accent, desc: i.desc, category: 'avatar' });
    });
    TRAILS.forEach((t) => {
      map.set(t.id, { id: t.id, name: t.name, emoji: t.emoji, rarity: t.rarity, accent: t.accent, desc: t.desc, category: 'trails' });
    });
    PETS.forEach((p) => {
      map.set(p.id, { id: p.id, name: p.name, emoji: p.emoji, rarity: p.rarity, accent: p.accent, desc: p.desc, category: 'pets' });
    });
    PROFILE_THEMES.forEach((t) => {
      map.set(t.id, { id: t.id, name: t.name, emoji: t.emoji, rarity: t.rarity, accent: t.accent, desc: t.desc, category: 'themes' });
    });
    STICKERS.forEach((s) => {
      map.set(s.id, { id: s.id, name: s.name, emoji: s.emoji, rarity: s.rarity, accent: s.accent, desc: s.name, category: 'stickers' });
    });
    COLLECTIBLE_BADGES.forEach((b) => {
      map.set(b.id, { id: b.id, name: b.name, emoji: b.emoji, rarity: b.rarity, accent: b.accent, desc: b.desc, category: 'badges' });
    });
    return map;
  }, []);

  // Enrich owned items with lookup data
  const enriched = useMemo(() => {
    return ownedItems
      .map((owned) => {
        const data = itemLookup.get(owned.id);
        if (!data) return null;
        return { ...owned, ...data };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [ownedItems, itemLookup]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = enriched;
    if (filter !== 'all') {
      result = result.filter((i) => i.category === filter);
    }
    if (showFavouritesOnly) {
      result = result.filter((i) => i.favourite);
    }
    // Sort
    const sorted = [...result];
    switch (sort) {
      case 'recent':
        sorted.sort((a, b) => b.unlockedAt - a.unlockedAt);
        break;
      case 'rarity':
        sorted.sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [enriched, filter, sort, showFavouritesOnly]);

  // Stats
  const totalItems = enriched.length;
  const favouritesCount = enriched.filter((i) => i.favourite).length;
  const legendaryCount = enriched.filter((i) =>
    i.rarity === 'legendary' || i.rarity === 'mythic',
  ).length;

  const isEquipped = (item: { id: string; category: InventoryCategory }): boolean => {
    switch (item.category) {
      case 'trails': return profile.equippedTrail === item.id;
      case 'pets': return profile.equippedPet === item.id;
      case 'themes': return profile.equippedTheme === item.id;
      case 'stickers': return profile.equippedStickers.includes(item.id);
      case 'badges': return profile.equippedBadges.includes(item.id);
      default: return false;
    }
  };

  const handleEquip = (item: { id: string; category: InventoryCategory }): void => {
    switch (item.category) {
      case 'trails':
        equipTrail(isEquipped(item) ? null : item.id);
        break;
      case 'pets':
        equipPet(isEquipped(item) ? null : item.id);
        break;
      case 'themes':
        equipTheme(isEquipped(item) ? null : item.id);
        break;
      case 'stickers':
        toggleSticker(item.id);
        break;
      case 'badges':
        toggleBadge(item.id);
        break;
    }
  };

  const canEquip = (category: InventoryCategory): boolean =>
    category !== 'avatar';

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#a78bfa" />

      <div className="relative z-10">
        <TopBar showBack title="Inventory" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="p-3 flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nova-400 to-cyan-500 flex items-center justify-center">
                <Icon name="Package" size={18} className="text-ink-950" />
              </div>
              <div className="text-xl font-black text-white">{totalItems}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Total</div>
            </GlassCard>
            <GlassCard className="p-3 flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-300 to-ember-500 flex items-center justify-center">
                <Icon name="Star" size={18} className="text-ink-950" />
              </div>
              <div className="text-xl font-black text-white">{favouritesCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Favourites</div>
            </GlassCard>
            <GlassCard className="p-3 flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-300 to-rose-500 flex items-center justify-center">
                <Icon name="Crown" size={18} className="text-ink-950" />
              </div>
              <div className="text-xl font-black text-white">{legendaryCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Legendary+</div>
            </GlassCard>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                      : 'glass text-white/60 hover:text-white'
                  }`}
                >
                  <Icon name={cat.icon} size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort + favourites filter */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isActive = sort === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSort(opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'glass text-nova-300 border border-nova-500/30'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Icon name={opt.icon} size={12} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowFavouritesOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                showFavouritesOnly
                  ? 'glass text-gold-300 border border-gold-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon name="Star" size={12} />
              Faves
            </button>
          </div>

          {/* Items grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon="Package"
              title="No items found"
              desc={showFavouritesOnly ? "You haven't favourited any items yet." : 'Explore the shop to collect cosmetics!'}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item) => {
                const equipped = isEquipped(item);
                return (
                  <RarityBorder key={item.id} rarity={item.rarity} active={equipped} className="overflow-hidden">
                    <div className="p-4 flex flex-col items-center gap-2 bg-ink-900/60 relative">
                      {/* Favourite star toggle */}
                      <button
                        onClick={() => toggleFavourite(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg glass flex items-center justify-center transition-colors"
                        aria-label={item.favourite ? 'Remove favourite' : 'Add favourite'}
                      >
                        <Icon
                          name="Star"
                          size={14}
                          className={item.favourite ? 'text-gold-300 fill-gold-300' : 'text-white/30'}
                        />
                      </button>

                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-2xl`}>
                        <span>{item.emoji}</span>
                      </div>
                      <div className="text-sm font-bold text-white text-center leading-tight">{item.name}</div>
                      <RarityBadge rarity={item.rarity} size="sm" />

                      {canEquip(item.category) ? (
                        <Button
                          size="sm"
                          variant={equipped ? 'ghost' : 'secondary'}
                          fullWidth
                          onClick={() => handleEquip(item)}
                        >
                          {equipped ? 'Unequip' : 'Equip'}
                        </Button>
                      ) : (
                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 py-1.5">
                          Cosmetic
                        </div>
                      )}
                    </div>
                  </RarityBorder>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
