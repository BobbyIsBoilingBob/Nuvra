import { useState } from 'react';
import { Icon, GlassCard, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { SHOP_ITEMS, COSMETIC_RARITY_MAP } from '../data';

export function Shop(): React.ReactElement {
  const { profile, spendCoins } = useStore();
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleBuy = (id: string, price: number) => {
    setError(null);
    if (purchased.has(id)) return;
    if (profile.coins < price) { setError('Not enough coins!'); return; }
    if (spendCoins(price)) setPurchased(prev => new Set([...prev, id]));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#7a45ff" />
      <div className="relative z-10">
        <TopBar showBack title="Shop" showCurrencies />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {error && <div className="glass rounded-xl px-4 py-2.5 text-xs text-rose-300 font-bold text-center">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            {SHOP_ITEMS.map(item => {
              const rarity = COSMETIC_RARITY_MAP[item.rarity];
              const isPurchased = purchased.has(item.id);
              return (
                <GlassCard key={item.id} className={`p-4 flex flex-col items-center gap-2 ${isPurchased?'opacity-50':''}`}>
                  <div className={`w-14 h-14 rounded-2xl glass flex items-center justify-center text-3xl ${rarity.glow}`}>{item.emoji}</div>
                  <div className="text-sm font-bold text-white text-center">{item.name}</div>
                  <Pill accent={`${rarity.color} border-white/10`}>{rarity.label}</Pill>
                  <div className="text-xs text-white/40 capitalize">{item.category}</div>
                  {isPurchased ? <div className="flex items-center gap-1 text-xs font-bold text-zeviqo-300"><Icon name="CheckCircle" size={14} /> Owned</div>
                    : <Button size="sm" variant="secondary" icon="Coins" onClick={() => handleBuy(item.id, item.price)} disabled={profile.coins < item.price}>{item.price}</Button>}
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
