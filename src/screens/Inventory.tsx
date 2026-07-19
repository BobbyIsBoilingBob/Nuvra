import { useStore } from '../store';
import { Header } from '../components/Header';
import { Card } from '../components/Card';

export default function Inventory() {
  const goBack = useStore((s) => s.goBack);
  const inventory = useStore((s) => s.inventory);

  return (
    <div>
      <Header title="Inventory" onBack={goBack} subtitle={`${inventory.length} items`} />
      <div className="px-4 py-4 space-y-3">
        {inventory.length === 0 ? (
          <p className="text-center text-ink-500 py-8">No items yet. Visit the shop or complete adventures!</p>
        ) : (
          inventory.map((item) => (
            <Card key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-2xl">📦</div>
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-ink-500">Quantity: {item.quantity}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
