import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { SHOP_ITEMS } from '../data/gameData';
import { Coins } from 'lucide-react';

export default function Shop() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const coins = useStore((s) => s.coins);
  const spendCoins = useStore((s) => s.spendCoins);
  const addItem = useStore((s) => s.addItem);

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Shop" back={false} />
        <div className="px-4 py-10 text-center"><p className="text-ink-300">Sign in to buy items.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }
  return (
    <div className="pb-24"><Header title="Shop" back={false} right={<span className="flex items-center gap-1 text-accent-400 font-semibold text-sm"><Coins size={16} /> {coins}</span>} />
      <div className="px-4 py-4 max-w-lg mx-auto grid grid-cols-2 gap-3">
        {SHOP_ITEMS.map((item) => (
          <Card key={item.id} className="p-4">
            <p className="text-white font-semibold">{item.name}</p>
            <p className="text-ink-400 text-xs mt-1">{item.description}</p>
            <Button size="sm" className="mt-3 w-full" disabled={coins < item.price} onClick={() => { if (spendCoins(item.price)) addItem({ id: item.id, name: item.name, type: item.type, quantity: 1 }); }}>{item.price} coins</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
