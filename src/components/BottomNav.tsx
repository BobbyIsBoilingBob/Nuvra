import { Icon } from './ui';
import { useStore, type Screen } from '../store';
import { useAuth } from '../lib/auth';

export function TopBar({ title = '', showBack = false, showCurrencies = true }: { title?: string; showBack?: boolean; showCurrencies?: boolean }) {
  const { goBack } = useStore();
  const { profile } = useAuth();
  return (
    <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between glass-strong border-b border-white/5">
      <div className="flex items-center gap-2">
        {showBack && <button onClick={goBack} className="w-9 h-9 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform"><Icon name="ChevronLeft" size={18} className="text-white/70" /></button>}
        {title && <h1 className="text-base font-display font-bold text-white">{title}</h1>}
      </div>
      {showCurrencies && profile && (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 glass rounded-lg px-2 py-1 text-xs font-bold text-gold-400"><Icon name="Coins" size={12} />{profile.coins.toLocaleString()}</span>
          <span className="flex items-center gap-1 glass rounded-lg px-2 py-1 text-xs font-bold text-zeviqo-300"><Icon name="Gem" size={12} />{profile.gems ?? 0}</span>
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS: { screen: Screen; icon: string; label: string }[] = [
  { screen: 'home', icon: 'Home', label: 'Home' },
  { screen: 'adventures', icon: 'Compass', label: 'Explore' },
  { screen: 'quests', icon: 'Target', label: 'Quests' },
  { screen: 'profile', icon: 'User', label: 'Profile' },
];

export function BottomNav() {
  const { currentScreen, setScreen } = useStore();
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 glass-strong border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map(item => {
          const active = currentScreen === item.screen;
          return (
            <button key={item.screen} onClick={() => setScreen(item.screen)} className="flex flex-col items-center gap-1 px-3 py-1.5 transition-all active:scale-90">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-gradient-to-br from-zeviqo-400 to-zeviqo-500 shadow-lg shadow-zeviqo-500/30' : ''}`}>
                <Icon name={item.icon} size={18} className={active ? 'text-ink-950' : 'text-white/50'} />
              </div>
              <span className={`text-[9px] font-bold ${active ? 'text-zeviqo-300' : 'text-white/40'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
