import { useStore } from '../store';
import { COSMETICS, SEASONAL_ITEMS, RARITY_COLORS, RARITY_LABELS, type InventoryCategory } from '../cosmetics';
import { Card, Screen, Badge, EmptyState, Button } from '../components/ui';
import { Backpack, Check } from 'lucide-react';

export default function Inventory() {
  const { ownedItems, equippedItems, equipItem, setScreen } = useStore();
  const allItems = [...COSMETICS, ...SEASONAL_ITEMS];
  const owned = allItems.filter(i => ownedItems.includes(i.id));
  const categories: InventoryCategory[] = ['trails', 'pets', 'themes', 'stickers', 'badges'];

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-2"><Backpack size={24} color="#00c4ff" /> Inventory</h1>
      {owned.length === 0 ? (
        <>
          <EmptyState icon={Backpack} title="No items yet" subtitle="Visit the shop to buy cosmetics" />
          <Button onClick={() => setScreen('shop')} className="w-full mt-4">Go to Shop</Button>
        </>
      ) : categories.map(cat => {
        const items = owned.filter(i => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h2 className="text-ink-400 text-sm font-semibold uppercase mb-3">{cat}</h2>
            <div className="grid grid-cols-2 gap-3">{items.map(item => {
              const isEquipped = equippedItems[item.category] === item.id;
              return (
                <Card key={item.id} className="p-3" style={{ borderColor: `${RARITY_COLORS[item.rarity]}33` }}>
                  <div className="text-3xl text-center mb-2">{item.emoji}</div>
                  <h3 className="font-semibold text-white text-sm text-center">{item.name}</h3>
                  <Badge color={RARITY_COLORS[item.rarity]}>{RARITY_LABELS[item.rarity]}</Badge>
                  <Button size="sm" variant={isEquipped ? 'secondary' : 'primary'} className="w-full mt-2" onClick={() => equipItem(item.category, item.id)}>
                    {isEquipped ? <><Check size={14} className="inline" /> Equipped</> : 'Equip'}
                  </Button>
                </Card>
              );
            })}</div>
          </div>
        );
      })}
    </Screen>
  );
}
