import { Icon } from './ui';
import { useStore, type Screen } from '../store';
import { useAuth } from '../lib/auth';

export function TopBar({ title, showBack = false, showCurrencies = true }: { title: string; showBack?: boolean; showCurrencies?: boolean }) {
  const { goBack } = useStore();
  const { profile } = useAuth();
  return (
    <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between glass-strong border-b border-white/5">
      <div className="flex items-center gap-2">
        {showBack && <button onClick={goBack} className="w-9 h-9 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform"><Icon name="ChevronLeft" size={18} className="text-white/70" /></button>}
        <h1 className="text-base font-display font-bold text-white">{title}</h1>
      </div>
      {showCurrencies && profile && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 glass rounded-full px-2.5 py-1"><Icon name="Coins" size={12} className="text-gold-400" /><span className="text-xs font-bold text-gold-300">{profile.coins.toLocaleString()}</span></div>
          <div className="flex items-center gap-1 glass rounded-full px-2.5 py-1"><Icon name="Zap" size={12} className="text-zeviqo-400" /><span className="text-xs font-bold text-zeviqo-300">LV{profile.level}</span></div>
        </div>
      )}
    </div>
  );
}

export function BottomNav() {
  const { currentScreen, setScreen } = useStore();
  const navItems: { screen: Screen; icon: string; label: string }[] = [
    { screen: 'home', icon: 'Home', label: 'Home' },
    { screen: 'adventures', icon: 'Compass', label: 'Adventures' },
    { screen: 'quests', icon: 'Target', label: 'Quests' },
    { screen: 'community', icon: 'Users', label: 'Social' },
    { screen: 'profile', icon: 'User', label: 'Profile' }
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/5 px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const active = currentScreen === item.screen;
          return <button key={item.screen} onClick={() => setScreen(item.screen)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 ${active ? 'text-zeviqo-400' : 'text-white/30'}`}><Icon name={item.icon} size={22} className={active ? 'text-zeviqo-400' : ''} /><span className="text-[9px] font-bold">{item.label}</span>{active && <div className="w-1 h-1 rounded-full bg-zeviqo-400" />}</button>;
        })}
      </div>
    </div>
  );
}
