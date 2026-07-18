import { useStore } from '../store';
import { COSMETICS, RARITY_COLORS, RARITY_LABELS, type InventoryCategory } from '../cosmetics';
import { Card, Screen, Badge, EmptyState, Button } from '../components/ui';
import { Backpack, Check } from 'lucide-react';
import { useState } from 'react';

export default function Customise() {
  const { ownedItems, equipped, equipItem } = useStore();
  const [category, setCategory] = useState<InventoryCategory>('trails');
  const cats: InventoryCategory[] = ['trails', 'pets', 'themes', 'stickers', 'badges'];
  const items = COSMETICS.filter(c => c.category === category && ownedItems.includes(c.id));
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Customise</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto no-select pb-1">{cats.map(c => (<button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap capitalize ${category === c ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>{c}</button>))}</div>
      {items.length === 0 ? <EmptyState icon={Backpack} title="No items owned" subtitle="Visit the shop to get items" /> : <div className="grid grid-cols-2 gap-3">{items.map(item => { const isEquipped = equipped[category] === item.id; return (<Card key={item.id} className="p-3" style={{ borderColor: `${RARITY_COLORS[item.rarity]}33` }}><div className="text-3xl text-center mb-2">{item.emoji}</div><h3 className="font-semibold text-white text-sm text-center">{item.name}</h3><Badge color={RARITY_COLORS[item.rarity]}>{RARITY_LABELS[item.rarity]}</Badge><Button size="sm" variant={isEquipped ? 'secondary' : 'primary'} className="w-full mt-2" onClick={() => equipItem(category, item.id)}>{isEquipped ? <><Check size={14} className="inline" /> Equipped</> : 'Equip'}</Button></Card>); })}</div>}
    </Screen>
  );
}
