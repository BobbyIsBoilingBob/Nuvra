import { useState, useEffect, useRef } from 'react';
import { Icon } from './ui';
import { useStore } from '../store';
import { Screen } from '../data';
import { useNotifications, type Notification } from '../hooks/useNotifications';

interface NavItem { id: Screen; label: string; icon: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'adventures', label: 'Adventures', icon: 'Compass' },
  { id: 'customise', label: 'Customise', icon: 'Sparkles' },
  { id: 'shop', label: 'Shop', icon: 'ShoppingBag' },
  { id: 'profile', label: 'Profile', icon: 'User' },
];

const NOTIF_META: Record<string, { icon: string; color: string }> = {
  friend_request: { icon: 'UserPlus', color: 'text-nova-300' },
  friend_accepted: { icon: 'UserCheck', color: 'text-nova-300' },
  party_invite: { icon: 'Users', color: 'text-plasma-300' },
  party_join: { icon: 'UserPlus', color: 'text-cyan-300' },
  party_leave: { icon: 'UserMinus', color: 'text-rose-300' },
  adventure_invite: { icon: 'Compass', color: 'text-gold-300' },
  level_up: { icon: 'TrendingUp', color: 'text-cyan-300' },
  achievement: { icon: 'Trophy', color: 'text-gold-300' },
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function BottomNav() {
  const { screen, setScreen } = useStore();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 safe-bottom" aria-label="Main navigation">
      <div className="max-w-md mx-auto glass-strong rounded-2xl flex items-center justify-around px-2 py-2 shadow-glow">
        {NAV_ITEMS.map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 touch-target ${
                active ? 'text-nova-300 bg-nova-500/10' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon name={item.icon} size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold ${active ? 'text-nova-300' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar({ title, showBack = false, showCurrencies = true }: { title?: string; showBack?: boolean; showCurrencies?: boolean }) {
  const { profile, setScreen, prevScreen } = useStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications(profile.playerId);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 pb-2 safe-top" role="banner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => setScreen(prevScreen ?? 'home')}
              aria-label="Go back"
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white transition-colors touch-target"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
          )}
          {title && <h1 className="text-white font-bold text-lg tracking-tight">{title}</h1>}
        </div>
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs((v) => !v)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white transition-colors touch-target relative"
            >
              <Icon name="Bell" size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-11 w-72 max-w-[calc(100vw-2rem)] glass-strong rounded-2xl shadow-glow overflow-hidden animate-[fade-in_0.2s_ease-out] z-50">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[10px] font-bold text-nova-300 hover:text-nova-200">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Icon name="BellOff" size={24} className="text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/40">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 15).map((n: Notification) => {
                      const meta = NOTIF_META[n.type] ?? { icon: 'Bell', color: 'text-white/40' };
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-2.5 px-4 py-3 border-b border-white/5 ${!n.read ? 'bg-nova-500/5' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon name={meta.icon} size={14} className={meta.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white">{n.title}</div>
                            {n.message && <div className="text-xs text-white/50 mt-0.5">{n.message}</div>}
                            <div className="text-[10px] text-white/30 mt-1">{formatTime(n.createdAt)}</div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {!n.read && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-nova-300 transition-colors"
                                aria-label="Mark as read"
                              >
                                <Icon name="Check" size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => dismissNotification(n.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-300 transition-colors"
                              aria-label="Dismiss notification"
                            >
                              <Icon name="X" size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {showCurrencies && (
            <>
              <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-1.5" aria-label={`${profile.coins} coins`}>
                <Icon name="Coins" size={14} className="text-gold-300" />
                <span className="text-white font-bold text-xs">{profile.coins.toLocaleString()}</span>
              </div>
              <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-1.5" aria-label={`${profile.gems} gems`}>
                <Icon name="Gem" size={14} className="text-plasma-400" />
                <span className="text-white font-bold text-xs">{profile.gems}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
