import { useState } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { SHOP_ITEMS } from '../data/gameData';
import { Coins, Check } from 'lucide-react';

export default function Shop() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const coins = useStore((s) => s.coins);
  const spendCoins = useStore((s) => s.spendCoins);
  const addItem = useStore((s) => s.addItem);
  const [bought, setBought] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Shop" back={false} />
        <div className="px-4 py-10 text-center"><p className="text-ink-300">Sign in to buy items.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    setError(null);
    if (coins < item.price) { setError('Not enough coins.'); return; }
    if (spendCoins(item.price)) {
      addItem({ id: item.id, name: item.name, type: item.type, quantity: 1 });
      setBought((prev) => new Set(prev).add(item.id));
      setTimeout(() => setBought((prev) => { const n = new Set(prev); n.delete(item.id); return n; }), 2000);
    } else { setError('Purchase failed.'); }
  };

  return (
    <div className="pb-24"><Header title="Shop" back={false} right={<span className="flex items-center gap-1 text-accent-400 font-semibold text-sm"><Coins size={16} /> {coins}</span>} />
      <div className="px-4 py-4 max-w-lg mx-auto">
        {error && <p className="text-error-400 text-sm mb-3">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => (
            <Card key={item.id} className="p-4">
              <p className="text-white font-semibold">{item.name}</p>
              <p className="text-ink-400 text-xs mt-1">{item.description}</p>
              <Button size="sm" className="mt-3 w-full" disabled={coins < item.price || bought.has(item.id)} onClick={() => handleBuy(item)}>
                {bought.has(item.id) ? <><Check size={16} /> Bought!</> : <><Coins size={14} /> {item.price}</>}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
