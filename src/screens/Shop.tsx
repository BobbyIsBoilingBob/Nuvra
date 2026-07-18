import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { COSMETICS, SEASONAL_ITEMS, RARITY_COLORS, RARITY_LABELS, type CosmeticItem, type InventoryCategory } from '../cosmetics';
import { Card, Screen, Button, Badge, EmptyState } from '../components/ui';
import { Coins, Gem, Check, ShoppingBag, Backpack } from 'lucide-react';

export default function Shop() {
  const { profile, updateProfile } = useAuth();
  const { ownedItems, buyItem, equipItem, setScreen } = useStore();
  const [category, setCategory] = useState<InventoryCategory | 'seasonal'>('trails');
  const categories: { id: InventoryCategory | 'seasonal'; label: string }[] = [{ id: 'trails', label: 'Trails' }, { id: 'pets', label: 'Pets' }, { id: 'themes', label: 'Themes' }, { id: 'stickers', label: 'Stickers' }, { id: 'badges', label: 'Badges' }, { id: 'seasonal', label: 'Seasonal' }];
  const items = category === 'seasonal' ? SEASONAL_ITEMS : COSMETICS.filter(c => c.category === category);
  const handleBuy = async (item: CosmeticItem) => {
    if (!profile || ownedItems.includes(item.id)) return;
    if (item.currency === 'coins' && profile.coins < item.price) return;
    if (item.currency === 'gems' && profile.gems < item.price) return;
    const success = buyItem(item.id);
    if (success) await updateProfile(item.currency === 'coins' ? { coins: profile.coins - item.price } : { gems: profile.gems - item.price });
  };
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Shop</h1>
      <div className="flex gap-2 mb-4"><Badge color="#fbbf24"><Coins size={12} className="inline" /> {profile?.coins.toLocaleString() ?? 0}</Badge><Badge color="#a78bfa"><Gem size={12} className="inline" /> {profile?.gems ?? 0}</Badge></div>
      <div className="flex gap-2 mb-4 overflow-x-auto no-select pb-1">{categories.map(c => (<button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${category === c.id ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>{c.label}</button>))}</div>
      {items.length === 0 ? <EmptyState icon={ShoppingBag} title="No items available" /> : <div className="grid grid-cols-2 gap-3">{items.map(item => {
        const owned = ownedItems.includes(item.id); const canAfford = profile ? (item.currency === 'coins' ? profile.coins >= item.price : profile.gems >= item.price) : false;
        return (<Card key={item.id} className="p-3" style={{ borderColor: `${RARITY_COLORS[item.rarity]}33` }}><div className="text-3xl text-center mb-2">{item.emoji}</div><h3 className="font-semibold text-white text-sm text-center">{item.name}</h3><p className="text-ink-400 text-xs text-center mb-2">{item.description}</p><div className="flex items-center justify-between mb-2"><Badge color={RARITY_COLORS[item.rarity]}>{RARITY_LABELS[item.rarity]}</Badge></div>{owned ? <Button size="sm" variant="secondary" className="w-full" onClick={() => equipItem(item.category, item.id)}><Check size={14} className="inline" /> Equip</Button> : <Button size="sm" variant={item.currency === 'gems' ? 'gold' : 'primary'} className="w-full" disabled={!canAfford} onClick={() => handleBuy(item)}>{item.currency === 'coins' ? <><Coins size={12} className="inline" /> {item.price}</> : <><Gem size={12} className="inline" /> {item.price}</>}</Button>}</Card>);
      })}</div>}
      <Button variant="ghost" className="w-full mt-4" onClick={() => setScreen('inventory')}><Backpack size={16} /> View Inventory</Button>
    </Screen>
  );
}
