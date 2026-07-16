import { useState } from 'react';
import { Icon, Button, Pill, RarityBadge, RarityBorder, Modal } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import {
  SHOP_CATEGORIES,
  type ShopCategory,
  getShopItems,
  SHOP_BUNDLES,
  type InventoryCategory,
  type CosmeticRarity,
  type ShopItem,
} from '../cosmetics';

const CATEGORY_TO_INVENTORY: Record<ShopCategory, InventoryCategory | null> = {
  avatar: 'avatar',
  pets: 'pets',
  trails: 'trails',
  themes: 'themes',
  stickers: 'stickers',
  badges: 'badges',
  bundles: null,
  featured: null,
};

export function Shop(): React.ReactElement {
  const {
    profile,
    spendCoins,
    spendGems,
    unlockItem,
    showCelebration,
    isOwned,
    equipTrail,
    equipPet,
    equipTheme,
    toggleSticker,
    toggleBadge,
  } = useStore();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('featured');
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  const items = getShopItems(activeCategory);
  const isBundles = activeCategory === 'bundles';

  const handlePurchase = (item: ShopItem): void => {
    if (isOwned(item.id)) return;
    const cat = CATEGORY_TO_INVENTORY[activeCategory];
    if (!cat) return;

    const ok = item.currency === 'coins' ? spendCoins(item.price) : spendGems(item.price);
    if (!ok) return;

    unlockItem(item.id, cat);
    showCelebration(item.name, item.emoji, item.rarity, 'Added to your inventory!');

    // Auto-equip
    switch (cat) {
      case 'trails': equipTrail(item.id); break;
      case 'pets': equipPet(item.id); break;
      case 'themes': equipTheme(item.id); break;
      case 'stickers': toggleSticker(item.id); break;
      case 'badges': toggleBadge(item.id); break;
    }
  };

  const handleBundlePurchase = (bundleId: string, price: number, currency: 'coins' | 'gems', name: string, emoji: string, rarity: CosmeticRarity): void => {
    if (isOwned(bundleId)) return;
    const ok = currency === 'coins' ? spendCoins(price) : spendGems(price);
    if (!ok) return;
    unlockItem(bundleId, 'avatar');
    showCelebration(name, emoji, rarity, 'Bundle unlocked!');
  };

  const canAfford = (item: ShopItem): boolean =>
    item.currency === 'coins' ? profile.coins >= item.price : profile.gems >= item.price;

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#fbbf24" />

      <div className="relative z-10">
        <TopBar showBack title="Reward Shop" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {SHOP_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
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

          {/* Bundles special layout */}
          {isBundles && (
            <div className="flex flex-col gap-4">
              {SHOP_BUNDLES.map((bundle) => {
                const owned = isOwned(bundle.id);
                const canBuy = bundle.currency === 'coins' ? profile.coins >= bundle.price : profile.gems >= bundle.price;
                const discount = Math.round((1 - bundle.price / bundle.originalPrice) * 100);
                return (
                  <RarityBorder key={bundle.id} rarity={bundle.rarity} className="overflow-hidden">
                    <div className="p-5 bg-ink-900/60">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bundle.accent} flex items-center justify-center text-3xl flex-shrink-0`}>
                          <span>{bundle.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-white">{bundle.name}</h3>
                            <RarityBadge rarity={bundle.rarity} size="sm" />
                          </div>
                          <p className="text-xs text-white/50 mt-1">{bundle.desc}</p>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="mt-3 flex flex-col gap-1.5">
                        {bundle.items.map((itemName) => (
                          <div key={itemName} className="flex items-center gap-2 text-xs text-white/70">
                            <Icon name="Check" size={14} className="text-nova-300" />
                            {itemName}
                          </div>
                        ))}
                      </div>

                      {/* Price + buy */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-white">
                            {bundle.currency === 'gems' ? `${bundle.price}💎` : `${bundle.price}🪙`}
                          </span>
                          <span className="text-xs text-white/40 line-through">
                            {bundle.currency === 'gems' ? `${bundle.originalPrice}💎` : `${bundle.originalPrice}🪙`}
                          </span>
                          <Pill accent="text-gold-300 border-gold-500/30" className="!py-0.5 !px-2">
                            -{discount}%
                          </Pill>
                        </div>
                        {owned ? (
                          <Pill icon="CheckCircle" accent="text-nova-300 border-nova-500/30">
                            Owned
                          </Pill>
                        ) : (
                          <Button
                            size="sm"
                            variant="gold"
                            disabled={!canBuy}
                            icon="ShoppingBag"
                            onClick={() => handleBundlePurchase(bundle.id, bundle.price, bundle.currency, bundle.name, bundle.emoji, bundle.rarity)}
                          >
                            Buy Bundle
                          </Button>
                        )}
                      </div>
                    </div>
                  </RarityBorder>
                );
              })}
            </div>
          )}

          {/* Regular items grid */}
          {!isBundles && (
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => {
                const owned = isOwned(item.id);
                const affordable = canAfford(item);
                return (
                  <RarityBorder key={item.id} rarity={item.rarity} className="overflow-hidden">
                    <div className="p-4 flex flex-col items-center gap-2 bg-ink-900/60">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-3xl hover:scale-105 transition-transform`}
                      >
                        <span>{item.emoji}</span>
                      </button>
                      <div className="text-sm font-bold text-white text-center">{item.name}</div>
                      <RarityBadge rarity={item.rarity} size="sm" />
                      {owned ? (
                        <Pill icon="CheckCircle" accent="text-nova-300 border-nova-500/30" className="mt-1">
                          Owned
                        </Pill>
                      ) : (
                        <Button
                          size="sm"
                          variant={affordable ? 'primary' : 'ghost'}
                          fullWidth
                          disabled={!affordable}
                          icon={item.currency === 'gems' ? 'Gem' : 'Coins'}
                          onClick={() => handlePurchase(item)}
                        >
                          {item.price}
                        </Button>
                      )}
                    </div>
                  </RarityBorder>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal open={previewItem !== null} onClose={() => setPreviewItem(null)} title="Item Preview">
        {previewItem && (
          <div className="flex flex-col items-center gap-4">
            <RarityBorder rarity={previewItem.rarity} active className="overflow-hidden">
              <div className="p-6 flex flex-col items-center gap-3 bg-ink-900/60">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${previewItem.accent} flex items-center justify-center text-5xl`}>
                  <span>{previewItem.emoji}</span>
                </div>
                <h3 className="text-lg font-black text-white">{previewItem.name}</h3>
                <RarityBadge rarity={previewItem.rarity} size="lg" />
              </div>
            </RarityBorder>
            <p className="text-sm text-white/60 text-center">{previewItem.desc}</p>
            <div className="flex items-center gap-2">
              <Pill icon={previewItem.currency === 'gems' ? 'Gem' : 'Coins'} accent="text-gold-300 border-gold-500/30">
                {previewItem.price} {previewItem.currency}
              </Pill>
            </div>
            {isOwned(previewItem.id) ? (
              <Button variant="secondary" fullWidth icon="CheckCircle">
                Already Owned
              </Button>
            ) : (
              <Button
                variant="gold"
                fullWidth
                icon="ShoppingBag"
                disabled={!canAfford(previewItem)}
                onClick={() => {
                  handlePurchase(previewItem);
                  setPreviewItem(null);
                }}
              >
                Purchase for {previewItem.price} {previewItem.currency === 'gems' ? '💎' : '🪙'}
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
