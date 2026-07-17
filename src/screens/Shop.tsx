import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ConfirmDialog } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { BottomNav } from '../components/BottomNav';
import { COSMETICS, RARITY_COLORS, RARITY_LABELS, type CosmeticItem } from '../cosmetics';

export function Shop() {
  const { ownedItems, buyItem } = useStore();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const [category, setCategory] = useState<string>('all');
  const [confirmItem, setConfirmItem] = useState<CosmeticItem | null>(null);

  const categories = ['all', 'trails', 'pets', 'themes', 'stickers', 'badges'];
  const filtered = category === 'all' ? COSMETICS : COSMETICS.filter(c => c.category === category);

  function handleBuy(item: CosmeticItem) {
    if (ownedItems.includes(item.id)) return;
    if (!profile) return;
    if (item.currency === 'coins' && profile.coins < item.price) return;
    if (item.currency === 'gems' && (profile.gems ?? 0) < item.price) return;
    const success = buyItem(item.id);
    if (success) {
      const updates = item.currency === 'coins' ? { coins: profile.coins - item.price } : { gems: (profile.gems ?? 0) - item.price };
      updateProfile(updates).then(() => refreshProfile());
    }
    setConfirmItem(null);
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fbbf24" />
      <TopBar title="Shop" showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${category === c ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => {
            const owned = ownedItems.includes(item.id);
            const canAfford = profile ? (item.currency === 'coins' ? profile.coins >= item.price : (profile.gems ?? 0) >= item.price) : false;
            return (
              <GlassCard key={item.id} className="p-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: `${item.color}22` }}>{item.emoji}</div>
                <p className="text-xs font-bold text-white text-center">{item.name}</p>
                <p className="text-[10px] text-white/40 text-center mb-2">{item.description}</p>
                <div className="flex items-center justify-center gap-1 mb-2"><span className="text-[9px] font-bold uppercase" style={{ color: RARITY_COLORS[item.rarity] }}>{RARITY_LABELS[item.rarity]}</span></div>
                {owned ? <Pill accent="text-emerald-300 border-emerald-500/30 mx-auto">Owned</Pill> : <Button size="sm" fullWidth disabled={!canAfford} onClick={() => setConfirmItem(item)} icon={item.currency === 'coins' ? 'Coins' : 'Gem'}>{item.price}</Button>}
              </GlassCard>
            );
          })}
        </div>
      </div>
      <BottomNav />
      <ConfirmDialog visible={!!confirmItem} title="Confirm Purchase" message={`Buy ${confirmItem?.name} for ${confirmItem?.price} ${confirmItem?.currency}?`} confirmLabel="Buy" onConfirm={() => confirmItem && handleBuy(confirmItem)} onCancel={() => setConfirmItem(null)} />
    </div>
  );
}
