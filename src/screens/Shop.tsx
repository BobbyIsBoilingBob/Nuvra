import { useStore } from '../store';
import { useShop } from '../hooks/useShop';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { ShoppingBag, Check } from 'lucide-react';

export default function Shop() {
  const goBack = useStore((s) => s.goBack);
  const { items, loading, error, buy, owned } = useShop();
  const coins = useStore((s) => s.coins);
  if (loading) return (<div><Header title="Shop" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  return (
    <div>
      <Header title="Shop" onBack={goBack} subtitle={`🪙 ${coins} coins`} />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const isOwned = owned.includes(item.id);
            const canAfford = coins >= item.price;
            return (
              <Card key={item.id} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center text-3xl mb-2">{item.icon ?? '🎁'}</div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-ink-500 mb-2">{item.description}</p>
                {isOwned ? <span className="text-success-600 text-sm font-medium flex items-center gap-1"><Check size={14} />Owned</span> : <Button size="sm" disabled={!canAfford} onClick={() => buy(item.id)}><ShoppingBag size={14} className="inline mr-1" />{item.price} 🪙</Button>}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
