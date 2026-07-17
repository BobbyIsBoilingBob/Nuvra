import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { SEASONAL_ITEMS, RARITY_COLORS, RARITY_LABELS } from '../cosmetics';

export function Seasonal() {
  const { ownedItems, buyItem } = useStore();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const daysLeft = Math.max(0, 30 - Math.floor((Date.now() % 2592000000) / 86400000));

  function handleBuy(itemId: string, price: number, currency: 'coins' | 'gems') {
    if (ownedItems.includes(itemId) || !profile) return;
    if (currency === 'coins' && profile.coins < price) return;
    if (currency === 'gems' && (profile.gems ?? 0) < price) return;
    buyItem(itemId);
    const updates = currency === 'coins' ? { coins: profile.coins - price } : { gems: (profile.gems ?? 0) - price };
    updateProfile(updates).then(() => refreshProfile());
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Seasonal Event" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 text-center">
          <div className="text-4xl mb-2">🎄</div>
          <h2 className="text-lg font-display font-bold text-white">Winter Festival</h2>
          <p className="text-xs text-white/40 mt-1">Limited-time items available for the season.</p>
          <div className="mt-3"><ProgressBar value={30 - daysLeft} max={30} accent="from-nova-400 to-nova-500" /></div>
          <p className="text-[10px] text-white/40 mt-1">{daysLeft} days remaining</p>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          {SEASONAL_ITEMS.map(item => {
            const owned = ownedItems.includes(item.id);
            const canAfford = profile ? (item.currency === 'coins' ? profile.coins >= item.price : (profile.gems ?? 0) >= item.price) : false;
            return (
              <GlassCard key={item.id} className="p-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: `${item.color}22` }}>{item.emoji}</div>
                <p className="text-xs font-bold text-white text-center">{item.name}</p>
                <p className="text-[10px] text-white/40 text-center mb-1">{item.description}</p>
                <p className="text-[9px] font-bold uppercase text-center mb-2" style={{ color: RARITY_COLORS[item.rarity] }}>{RARITY_LABELS[item.rarity]}</p>
                {owned ? <Pill accent="text-emerald-300 border-emerald-500/30 mx-auto">Owned</Pill> : <Button size="sm" fullWidth disabled={!canAfford} onClick={() => handleBuy(item.id, item.price, item.currency)} icon={item.currency === 'coins' ? 'Coins' : 'Gem'}>{item.price}</Button>}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
