import { Chrome as Home, Compass, User, Trophy, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';
import type { Screen } from '../types';

const NAV_ITEMS: { screen: Screen; label: string; icon: typeof Home }[] = [
  { screen: 'home', label: 'Home', icon: Home },
  { screen: 'adventures', label: 'Adventures', icon: Compass },
  { screen: 'rewards', label: 'Rewards', icon: Trophy },
  { screen: 'shop', label: 'Shop', icon: ShoppingBag },
  { screen: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const screen = useStore((s) => s.screen);
  const setScreen = useStore((s) => s.setScreen);
  return (
    <nav className="sticky bottom-0 z-20 flex items-center justify-around px-2 py-2 bg-ink-900/90 backdrop-blur-md border-t border-ink-800">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = screen === item.screen;
        return (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${active ? 'text-brand-400' : 'text-ink-400 hover:text-ink-200'}`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
