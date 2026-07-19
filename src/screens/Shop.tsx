import { useState } from 'react';
import { useStore } from '../store';
import { SHOP_ITEMS } from '../data/gameData';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';

export default function Shop() {
  const goBack = useStore((s) => s.goBack);
  const coins = useStore((s) => s.coins);
  const spendCoins = useStore((s) => s.spendCoins);
  const addItem = useStore((s) => s.addItem);
  const [owned, setOwned] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function buy(id: string, price: number, name: string, type: 'cosmetic' | 'boost' | 'consumable') {
    setError(null);
    if (owned.includes(id)) return;
    if (!spendCoins(price)) { setError('Not enough coins'); return; }
    addItem({ id, name, type, quantity: 1 });
    setOwned((o) => [...o, id]);
  }

  return (
    <div>
      <Header title="Shop" onBack={goBack} subtitle={`🪙 ${coins} coins`} />
      <div className="px-4 py-4 space-y-3">
        {error && <p className="text-sm text-error-600">{error}</p>}
        {SHOP_ITEMS.map((item) => {
          const isOwned = owned.includes(item.id);
          return (
            <Card key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-2xl">
                {item.type === 'cosmetic' ? '🎨' : item.type === 'boost' ? '⚡' : '🎁'}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-ink-500">{item.description}</p>
              </div>
              {isOwned ? (
                <span className="text-success-600"><Check size={20} /></span>
              ) : (
                <Button size="sm" onClick={() => buy(item.id, item.price, item.name, item.type)} disabled={coins < item.price}>
                  {item.price}🪙
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
