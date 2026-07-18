import { SEASONAL_ITEMS, RARITY_COLORS, RARITY_LABELS } from '../cosmetics';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card, Screen, Button, Badge, EmptyState } from '../components/ui';
import { Calendar, Coins, Gem, Check, Snowflake } from 'lucide-react';

export default function Seasonal() {
  const { profile, updateProfile } = useAuth();
  const { ownedItems, buyItem, equipItem } = useStore();
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Seasonal Items</h1>
      <div className="flex gap-2 mb-4"><Badge color="#fbbf24"><Coins size={12} className="inline" /> {profile?.coins.toLocaleString() ?? 0}</Badge><Badge color="#a78bfa"><Gem size={12} className="inline" /> {profile?.gems ?? 0}</Badge></div>
      {SEASONAL_ITEMS.length === 0 ? <EmptyState icon={Calendar} title="No seasonal items" subtitle="Check back during special events" /> : <div className="grid grid-cols-2 gap-3">{SEASONAL_ITEMS.map(item => { const owned = ownedItems.includes(item.id); const canAfford = profile ? (item.currency === 'coins' ? profile.coins >= item.price : profile.gems >= item.price) : false; return (<Card key={item.id} className="p-3" style={{ borderColor: `${RARITY_COLORS[item.rarity]}33` }}><div className="text-3xl text-center mb-2">{item.emoji}</div><h3 className="font-semibold text-white text-sm text-center">{item.name}</h3><p className="text-ink-400 text-xs text-center mb-2">{item.description}</p><Badge color={RARITY_COLORS[item.rarity]}>{RARITY_LABELS[item.rarity]}</Badge>{owned ? <Button size="sm" variant="secondary" className="w-full mt-2" onClick={() => equipItem(item.category, item.id)}><Check size={14} className="inline" /> Equip</Button> : <Button size="sm" variant={item.currency === 'gems' ? 'gold' : 'primary'} className="w-full mt-2" disabled={!canAfford} onClick={async () => { if (!profile) return; const success = buyItem(item.id); if (success) await updateProfile(item.currency === 'coins' ? { coins: profile.coins - item.price } : { gems: profile.gems - item.price }); }}>{item.currency === 'coins' ? <><Coins size={12} className="inline" /> {item.price}</> : <><Gem size={12} className="inline" /> {item.price}</>}</Button>}</Card>); })}</div>}
    </Screen>
  );
}
