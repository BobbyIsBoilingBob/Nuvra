import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, RarityBadge, RarityBorder, ConfirmDialog } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { SEASONAL_ITEMS, RARITY_COLORS, type CosmeticItem } from '../cosmetics';

export function Seasonal() {
  const { ownedItems, buyItem } = useStore();
  const { profile, updateProfile } = useAuth();
  const [confirmItem, setConfirmItem] = useState<CosmeticItem | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <AdventureBg accent="#22c55e" />
      <TopBar title="Seasonal Event" showCurrencies />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5 text-center">
          <div className="text-4xl mb-2">🎄</div>
          <h2 className="text-lg font-display font-bold text-white">Winter Festival</h2>
          <p className="text-xs text-white/40 mt-1">Limited-time items available now!</p>
          <div className="flex justify-center mt-3">
            <Pill icon="Clock" accent="text-ember-400 border-ember-500/30">Limited Time</Pill>
          </div>
        </GlassCard>

        {error && (
          <GlassCard className="p-3 flex items-center gap-2 border-rose-500/20">
            <Icon name="AlertCircle" size={14} className="text-rose-400" />
            <p className="text-xs text-rose-300">{error}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-2 gap-3">
          {SEASONAL_ITEMS.map(item => {
            const isOwned = ownedItems.includes(item.id);
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
