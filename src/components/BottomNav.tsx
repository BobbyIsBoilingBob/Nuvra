import { type ReactNode, useEffect, useState } from 'react';

export function AdventureBg() {
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 8,
    })),
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-zeviqo-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-nova-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-zeviqo-400/10"
          style={{
            left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size,
            animation: `float ${p.duration}s ease-in-out infinite`, animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-ink-950/80 backdrop-blur-md border-b border-ink-700/30 px-4 py-3 flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="text-ink-400 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
      )}
      <h1 className="font-display text-xl font-bold text-white flex-1 truncate">{title}</h1>
      {right}
    </header>
  );
}

export function BottomNav({ current, onNavigate }: { current: string; onNavigate: (s: string) => void }) {
  const items = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'adventures', label: 'Explore', icon: CompassIcon },
    { id: 'quests', label: 'Quests', icon: TrophyIcon },
    { id: 'community', label: 'Social', icon: UsersIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-ink-950/90 backdrop-blur-md border-t border-ink-700/30">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${active ? 'text-zeviqo-400' : 'text-ink-500 hover:text-ink-400'}`}
            >
              <item.icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

type IconProps = { size?: number };
function HomeIcon({ size = 22 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function CompassIcon({ size = 22 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
}
function TrophyIcon({ size = 22 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>;
}
function UsersIcon({ size = 22 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function UserIcon({ size = 22 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

// Hook to detect viewport height for mobile
export function useViewportHeight() {
  const [vh, setVh] = useState(window.innerHeight);
  useEffect(() => {
    const handler = () => setVh(window.innerHeight);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return vh;
}
