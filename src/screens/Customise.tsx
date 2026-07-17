import { useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, RarityBadge, RarityBorder } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { COSMETICS, RARITY_COLORS, type InventoryCategory } from '../cosmetics';

const CATEGORIES: { key: InventoryCategory; label: string; icon: string }[] = [
  { key: 'trails', label: 'Trails', icon: 'Sparkles' },
  { key: 'pets', label: 'Pets', icon: 'Paw' },
  { key: 'themes', label: 'Themes', icon: 'Palette' },
];

export function Customise() {
  const { ownedItems, equippedItems, equipItem } = useStore();

  const itemsByCategory = useMemo(() => {
    const map: Record<InventoryCategory, typeof COSMETICS> = { trails: [], pets: [], themes: [], stickers: [], badges: [] };
    for (const item of COSMETICS) {
      if (ownedItems.includes(item.id)) {
        map[item.category].push(item);
      }
    }
    return map;
  }, [ownedItems]);

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Customise" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        {CATEGORIES.map(cat => {
          const items = itemsByCategory[cat.key];
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Icon name={cat.icon} size={14} className="text-zeviqo-400" />
                {cat.label}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {items.map(item => {
                  const isEquipped = equippedItems[item.category] === item.id || equippedItems[item.id] === item.id;
                  return (
                    <RarityBorder key={item.id} rarity={item.rarity} active={isEquipped}>
                      <GlassCard className="p-3 text-center">
                        <div className="text-2xl mb-1">{item.emoji}</div>
                        <p className="text-[10px] font-bold text-white truncate">{item.name}</p>
                        <div className="flex justify-center my-1">
                          <RarityBadge rarity={item.rarity} size="sm" showLabel={false} />
                        </div>
                        <Button
                          size="sm"
                          variant={isEquipped ? 'ghost' : 'secondary'}
                          disabled={isEquipped}
                          onClick={() => equipItem(item.category, item.id)}
                        >
                          {isEquipped ? '✓ Equipped' : 'Equip'}
                        </Button>
                      </GlassCard>
                    </RarityBorder>
                  );
                })}
              </div>
            </div>
          );
        })}

        {CATEGORIES.every(cat => itemsByCategory[cat.key].length === 0) && (
          <GlassCard className="p-8 text-center">
            <Icon name="ShoppingBag" size={32} className="text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/40">No items to customise yet</p>
            <Button variant="secondary" className="mt-3" onClick={() => useStore.getState().setScreen('shop')}>Visit Shop</Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
