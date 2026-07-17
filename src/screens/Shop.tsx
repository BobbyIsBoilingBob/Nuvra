import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, RarityBadge, RarityBorder, ConfirmDialog } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { COSMETICS, RARITY_COLORS, RARITY_LABELS, type CosmeticItem, type InventoryCategory } from '../cosmetics';

const CATEGORIES: { key: InventoryCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'Grid' },
  { key: 'trails', label: 'Trails', icon: 'Sparkles' },
  { key: 'pets', label: 'Pets', icon: 'Paw' },
  { key: 'themes', label: 'Themes', icon: 'Palette' },
  { key: 'stickers', label: 'Stickers', icon: 'Star' },
  { key: 'badges', label: 'Badges', icon: 'Award' },
];

export function Shop() {
  const { ownedItems, buyItem } = useStore();
  const { profile, updateProfile } = useAuth();
  const [category, setCategory] = useState<InventoryCategory | 'all'>('all');
  const [confirmItem, setConfirmItem] = useState<CosmeticItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (category === 'all') return COSMETICS.filter(c => c.price > 0);
    return COSMETICS.filter(c => c.category === category && c.price > 0);
  }, [category]);

  async function handleBuy(item: CosmeticItem) {
    if (!profile) return;
    if (ownedItems.includes(item.id)) { setConfirmItem(null); return; }
    if (item.currency === 'coins' && profile.coins < item.price) { setError('Not enough coins.'); return; }
    if (item.currency === 'gems' && (profile.gems ?? 0) < item.price) { setError('Not enough gems.'); return; }
    setError(null);
    buyItem(item.id);
    const updates: Partial<typeof profile> = {};
    if (item.currency === 'coins') updates.coins = profile.coins - item.price;
    else updates.gems = (profile.gems ?? 0) - item.price;
    await updateProfile(updates);
    setConfirmItem(null);
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fbbf24" />
      <TopBar title="Shop" showCurrencies />
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

        {error && (
          <GlassCard className="p-3 flex items-center gap-2 border-rose-500/20">
            <Icon name="AlertCircle" size={14} className="text-rose-400" />
            <p className="text-xs text-rose-300">{error}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => {
            const isOwned = ownedItems.includes(item.id);
            const rarityColor = RARITY_COLORS[item.rarity];
            return (
              <RarityBorder key={item.id} rarity={item.rarity}>
                <GlassCard className="p-3">
                  <div className="text-center mb-2">
                    <div className="text-3xl mb-1">{item.emoji}</div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                  </div>
                  <div className="flex justify-center mb-2">
                    <RarityBadge rarity={item.rarity} size="sm" />
                  </div>
                  <p className="text-[10px] text-white/40 text-center mb-2 h-6">{item.description}</p>
                  {isOwned ? (
                    <Button variant="ghost" fullWidth disabled icon="Check">Owned</Button>
                  ) : (
                    <Button
                      fullWidth
                      size="sm"
                      variant={item.currency === 'gems' ? 'secondary' : 'gold'}
                      icon={item.currency === 'gems' ? 'Gem' : 'Coins'}
                      onClick={() => setConfirmItem(item)}
                    >
                      {item.price}
                    </Button>
                  )}
                </GlassCard>
              </RarityBorder>
            );
          })}
        </div>
      </div>
      <BottomNav />

      <ConfirmDialog
        visible={!!confirmItem}
        title="Confirm Purchase"
        message={confirmItem ? `Buy ${confirmItem.name} for ${confirmItem.price} ${confirmItem.currency}?` : ''}
        confirmLabel="Buy"
        onConfirm={() => confirmItem && handleBuy(confirmItem)}
        onCancel={() => setConfirmItem(null)}
      />
    </div>
  );
}
