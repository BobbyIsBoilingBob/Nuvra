import { useState, useEffect } from 'react';
import { useStore, type ScreenName } from '../store';
import { Chrome as Home, Compass, Users, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function useViewportHeight() { const [vh, setVh] = useState(window.innerHeight); useEffect(() => { const onResize = () => setVh(window.innerHeight); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, []); return vh; }

const NAV_ITEMS: { screen: ScreenName; icon: LucideIcon; label: string }[] = [
  { screen: 'home', icon: Home, label: 'Home' }, { screen: 'adventures', icon: Compass, label: 'Adventures' },
  { screen: 'friends', icon: Users, label: 'Social' }, { screen: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const { screen, setScreen } = useStore();
  return <nav className="fixed bottom-0 left-0 right-0 bg-ink-900/80 backdrop-blur-lg border-t border-ink-600/20 px-2 py-2 flex justify-around z-50">{NAV_ITEMS.map((item) => { const Icon = item.icon; const active = screen === item.screen; return <button key={item.screen} onClick={() => setScreen(item.screen)} className="flex flex-col items-center gap-1 px-4 py-1.5 transition-colors"><Icon size={22} color={active ? '#fbbf24' : '#64748b'} /><span className={`text-xs font-medium ${active ? 'text-zeviqo-400' : 'text-ink-500'}`}>{item.label}</span></button>; })}</nav>;
}

export function TopBar({ title, showBack }: { title: string; showBack?: boolean }) { const { setScreen } = useStore(); return <div className="flex items-center gap-3 mb-4">{showBack && <button onClick={() => setScreen('home')} className="text-ink-400"><Home size={20} /></button>}<h1 className="font-display text-xl font-bold text-white">{title}</h1></div>; }

export function AdventureBg() {
  const [particles] = useState(() => Array.from({ length: 20 }, (_, i) => ({ id: i, left: Math.random() * 100, top: Math.random() * 100, size: 2 + Math.random() * 4, duration: 3 + Math.random() * 4, delay: Math.random() * 5 })));
  return <div className="fixed inset-0 overflow-hidden pointer-events-none">{particles.map((p) => <div key={p.id} className="absolute rounded-full bg-zeviqo-400/20 animate-pulse" style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />)}</div>;
}
