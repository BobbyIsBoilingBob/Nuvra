import { Icon } from './ui';
import { useStore } from '../store';
import type { Screen } from '../data';

interface NavItem { id: Screen; label: string; icon: string }
const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'adventures', label: 'Adventures', icon: 'Compass' },
  { id: 'quests', label: 'Quests', icon: 'ScrollText' },
  { id: 'profile', label: 'Profile', icon: 'User' },
];

export function BottomNav(): React.ReactElement {
  const { screen, setScreen } = useStore();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 safe-bottom">
      <div className="max-w-md mx-auto glass-strong rounded-2xl flex items-center justify-around px-2 py-2 shadow-glow">
        {NAV_ITEMS.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} aria-label={item.label} aria-current={active?'page':undefined}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 touch-target ${active?'text-nova-300 bg-nova-500/10':'text-white/40 hover:text-white/70'}`}>
              <Icon name={item.icon} size={22} strokeWidth={active?2.5:2} />
              <span className={`text-[10px] font-semibold ${active?'text-nova-300':''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar({ title, showBack = false, showCurrencies = true }: { title?: string; showBack?: boolean; showCurrencies?: boolean }): React.ReactElement {
  const { profile, setScreen, prevScreen } = useStore();
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 pb-2 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && <button onClick={() => setScreen(prevScreen ?? 'home')} aria-label="Go back" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white transition-colors touch-target"><Icon name="ChevronLeft" size={20} /></button>}
          {title && <h1 className="text-white font-bold text-lg tracking-tight">{title}</h1>}
        </div>
        {showCurrencies && (
          <div className="flex items-center gap-2">
            <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-1.5"><Icon name="Coins" size={14} className="text-gold-300" /><span className="text-white font-bold text-xs">{profile.coins.toLocaleString()}</span></div>
            <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-1.5"><Icon name="Gem" size={14} className="text-plasma-400" /><span className="text-white font-bold text-xs">{profile.gems}</span></div>
          </div>
        )}
      </div>
    </header>
  );
}
