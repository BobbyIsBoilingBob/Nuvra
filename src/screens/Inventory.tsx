import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Package } from 'lucide-react';

export default function Inventory() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const inventory = useStore((s) => s.inventory);
  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="Inventory" />
        <div className="px-4 py-10 text-center"><Package size={48} className="text-ink-500 mx-auto" /><p className="text-ink-300 mt-4">Sign in to view your inventory.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header title="Inventory" />
      <div className="px-4 py-4 max-w-lg mx-auto grid grid-cols-2 gap-3">
        {inventory.length === 0 && <p className="text-ink-400 text-sm col-span-2">Your inventory is empty.</p>}
        {inventory.map((item) => (
          <Card key={item.id} className="p-4"><p className="text-white font-semibold">{item.name}</p><p className="text-ink-400 text-xs capitalize">{item.type}</p><p className="text-brand-300 text-sm mt-1">x{item.quantity}</p></Card>
        ))}
      </div>
    </div>
  );
}
