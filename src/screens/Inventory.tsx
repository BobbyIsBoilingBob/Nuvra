import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, RarityBadge, RarityBorder, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { COSMETICS, RARITY_COLORS, type InventoryCategory } from '../cosmetics';

const CATEGORIES: { key: InventoryCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'Grid' },
  { key: 'trails', label: 'Trails', icon: 'Sparkles' },
  { key: 'pets', label: 'Pets', icon: 'Paw' },
  { key: 'themes', label: 'Themes', icon: 'Palette' },
  { key: 'stickers', label: 'Stickers', icon: 'Star' },
  { key: 'badges', label: 'Badges', icon: 'Award' },
];

export function Inventory() {
  const { ownedItems, equippedItems, equipItem, setScreen } = useStore();
  const [category, setCategory] = useState<InventoryCategory | 'all'>('all');

  const owned = useMemo(() => COSMETICS.filter(c => ownedItems.includes(c.id)), [ownedItems]);
  const filtered = useMemo(() => {
    if (category === 'all') return owned;
    return owned.filter(c => c.category === category);
  }, [owned, category]);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Inventory" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === cat.key ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}
            >
              <Icon name={cat.icon} size={12} />
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Icon name="Package" size={32} className="text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/40">No items in this category</p>
            <Button variant="secondary" className="mt-3" onClick={() => setScreen('shop')}>Visit Shop</Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => {
              const isEquipped = equippedItems[item.category] === item.id || equippedItems[item.id] === item.id;
              return (
                <RarityBorder key={item.id} rarity={item.rarity} active={isEquipped}>
                  <GlassCard className="p-3">
                    <div className="text-center mb-2">
                      <div className="text-3xl mb-1">{item.emoji}</div>
                      <p className="text-xs font-bold text-white">{item.name}</p>
                    </div>
                    <div className="flex justify-center mb-2">
                      <RarityBadge rarity={item.rarity} size="sm" />
                    </div>
                    <p className="text-[10px] text-white/40 text-center mb-2 h-6">{item.description}</p>
                    <Button
                      fullWidth
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
        )}
      </div>
      <BottomNav />
    </div>
  );
}
