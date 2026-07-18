import { SEASONAL_ITEMS, RARITY_COLORS, RARITY_LABELS } from '../cosmetics';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card, Screen, Button, Badge } from '../components/ui';
import { Calendar, Coins, Gem, Check } from 'lucide-react';

export default function Seasonal() {
  const { profile, updateProfile } = useAuth();
  const { ownedItems, buyItem, equipItem, setScreen } = useStore();

  const handleBuy = async (item: typeof SEASONAL_ITEMS[0]) => {
    if (!profile || ownedItems.includes(item.id)) return;
    if (item.currency === 'coins' && profile.coins < item.price) return;
    if (item.currency === 'gems' && profile.gems < item.price) return;
    const success = buyItem(item.id);
    if (success) {
      await updateProfile(item.currency === 'coins' ? { coins: profile.coins - item.price } : { gems: profile.gems - item.price });
    }
  };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Calendar size={24} color="#22c55e" /> Seasonal Items
      </h1>
      <p className="text-ink-400 mb-4 text-sm">Limited edition cosmetics available for a short time!</p>

      <div className="grid grid-cols-2 gap-3">
        {SEASONAL_ITEMS.map(item => {
          const owned = ownedItems.includes(item.id);
          const canAfford = profile ? (item.currency === 'coins' ? profile.coins >= item.price : profile.gems >= item.price) : false;
          return (
            <Card key={item.id} className="p-3" style={{ borderColor: `${RARITY_COLORS[item.rarity]}33` }}>
              <div className="text-3xl text-center mb-2">{item.emoji}</div>
              <h3 className="font-semibold text-white text-sm text-center">{item.name}</h3>
              <p className="text-ink-400 text-xs text-center mb-2">{item.description}</p>
              <div className="flex items-center justify-between mb-2">
                <Badge color={RARITY_COLORS[item.rarity]}>{RARITY_LABELS[item.rarity]}</Badge>
              </div>
              {owned ? (
                <Button size="sm" variant="secondary" className="w-full" onClick={() => equipItem(item.category, item.id)}>
                  <Check size={14} className="inline" /> Equip
                </Button>
              ) : (
                <Button size="sm" variant={item.currency === 'gems' ? 'gold' : 'primary'} className="w-full" disabled={!canAfford}
                  onClick={() => handleBuy(item)}>
                  {item.currency === 'coins' ? <><Coins size={12} className="inline" /> {item.price}</> : <><Gem size={12} className="inline" /> {item.price}</>}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      <Button variant="ghost" className="w-full mt-4" onClick={() => setScreen('shop')}>Back to Shop</Button>
    </Screen>
  );
}
