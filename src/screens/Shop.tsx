import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, Pill, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { SHOP_ITEMS, COSMETIC_RARITY_MAP } from '../data';
import { vibrate } from '../lib/settings';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'avatar', label: 'Avatars' },
  { key: 'trail', label: 'Trails' },
  { key: 'badge', label: 'Badges' },
  { key: 'boost', label: 'Boosts' }
] as const;

export function Shop() {
  const { ownedItems, buyItem } = useStore();
  const { profile, updateProfile } = useAuth();
  const [cat, setCat] = useState<string>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const filtered = SHOP_ITEMS.filter(i => cat === 'all' || i.category === cat);

  const handleBuy = async (itemId: string) => {
    if (!profile) return;
    const item = SHOP_ITEMS.find(i => i.id === itemId)!;
    if (ownedItems.includes(itemId)) return;
    if (profile.coins < item.price) return;
    setPurchasing(itemId);
    vibrate([20, 40, 20]);
    await updateProfile({ coins: profile.coins - item.price });
    buyItem(itemId);
    setPurchasing(null);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#f5b800" />
      <TopBar title="Shop" showBack />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon name="Coins" size={20} className="text-gold-400" />
            <span className="text-lg font-display font-bold text-gold-300">{profile?.coins.toLocaleString() ?? 0}</span>
          </div>
          <Pill icon="ShoppingBag">{ownedItems.length} owned</Pill>
        </GlassCard>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${cat===c.key?'bg-gold-500 text-ink-950':'glass text-white/50'}`}>{c.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="ShoppingBag" title="No items" desc="No items in this category." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => {
              const owned = ownedItems.includes(item.id);
              const rarity = COSMETIC_RARITY_MAP[item.rarity];
              const canAfford = (profile?.coins ?? 0) >= item.price;
              return (
                <GlassCard key={item.id} className={`p-4 animate-slide-up ${rarity.glow}`}>
                  <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-3xl mx-auto mb-2">{item.emoji}</div>
                  <h4 className="text-xs font-display font-bold text-white text-center">{item.name}</h4>
                  <p className={`text-[10px] font-bold text-center ${rarity.color}`}>{rarity.label}</p>
                  <div className="flex items-center justify-center gap-1 mt-2 mb-2">
                    <Icon name="Coins" size={12} className="text-gold-400" />
                    <span className="text-sm font-bold text-gold-300">{item.price}</span>
                  </div>
                  <Button size="sm" fullWidth variant={owned ? 'ghost' : canAfford ? 'primary' : 'ghost'} disabled={owned || !canAfford || purchasing === item.id} onClick={() => handleBuy(item.id)}>
                    {owned ? 'Owned' : !canAfford ? 'Not enough' : 'Buy'}
                  </Button>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
