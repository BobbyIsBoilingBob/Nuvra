import { Chrome as Home, Compass, Gift, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../store';
import type { Screen } from '../types';

const ITEMS: { screen: Screen; label: string; icon: typeof Home }[] = [
  { screen: 'home', label: 'Home', icon: Home },
  { screen: 'adventures', label: 'Adventures', icon: Compass },
  { screen: 'rewards', label: 'Rewards', icon: Gift },
  { screen: 'shop', label: 'Shop', icon: ShoppingBag },
  { screen: 'profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const screen = useStore((s) => s.screen);
  const navigate = useStore((s) => s.navigate);
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-ink-100 flex justify-around py-1.5 z-20">
      {ITEMS.map(({ screen: s, label, icon: Icon }) => {
        const active = screen === s;
        return (
          <button
            key={s}
            onClick={() => navigate(s)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${active ? 'text-brand-600' : 'text-ink-400 hover:text-ink-700'}`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
