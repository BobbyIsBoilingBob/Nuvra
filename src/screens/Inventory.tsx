import { useStore } from '../store';
import { useInventory } from '../hooks/useInventory';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Package } from 'lucide-react';

export default function Inventory() {
  const goBack = useStore((s) => s.goBack);
  const { items, loading, error } = useInventory();
  if (loading) return (<div><Header title="Inventory" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  return (
    <div>
      <Header title="Inventory" onBack={goBack} subtitle={`${items.length} items`} />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        {items.length === 0 && !loading ? (
          <div className="text-center py-12 text-ink-400"><Package className="mx-auto mb-2" /><p>Your inventory is empty. Earn rewards from adventures!</p></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <Card key={item.id} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center text-3xl mb-2">{item.icon ?? '🎁'}</div>
                <h3 className="font-semibold text-sm">{item.name}</h3><p className="text-xs text-ink-500">x{item.quantity}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
