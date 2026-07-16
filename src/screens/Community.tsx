import { useState } from 'react';
import { Icon, GlassCard, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { LEADERBOARD, FRIENDS, POPULAR_ROUTES } from '../data';
import { useStore } from '../store';

type Tab = 'leaderboard' | 'friends' | 'routes';

const STATUS_META: Record<string, { label: string; color: string }> = {
  online: { label: 'Online', color: 'bg-nova-400' },
  offline: { label: 'Offline', color: 'bg-white/20' },
  on_adventure: { label: 'On Adventure', color: 'bg-ember-400' },
};

export function Community(): React.ReactElement {
  const { setScreen } = useStore();
  const [tab, setTab] = useState<Tab>('leaderboard');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy' },
    { id: 'friends', label: 'Friends', icon: 'Users' },
    { id: 'routes', label: 'Routes', icon: 'Map' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#a78bfa" />

      <div className="relative z-10">
        <TopBar showBack title="Community" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Tab switcher */}
          <div className="flex gap-2 p-1 glass rounded-2xl">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-plasma-400 to-nova-500 text-ink-950 shadow-glow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Icon name={t.icon} size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Leaderboard tab */}
          {tab === 'leaderboard' && (
            <div className="flex flex-col gap-2.5">
              {/* Top 3 podium */}
              <div className="grid grid-cols-3 gap-3 items-end">
                {LEADERBOARD.slice(0, 3).map((entry) => {
                  const isTop = entry.rank === 1;
                  const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉';
                  return (
                    <GlassCard
                      key={entry.rank}
                      className={`p-3 flex flex-col items-center gap-1.5 text-center ${
                        isTop ? 'order-1 -mb-2' : entry.rank === 2 ? 'order-0' : 'order-2'
                      }`}
                    >
                      <div className="text-2xl">{medal}</div>
                      <div
                        className={`rounded-full bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center ${
                          isTop ? 'w-14 h-14 text-3xl' : 'w-12 h-12 text-2xl'
                        }`}
                      >
                        {entry.avatar}
                      </div>
                      <div className="text-xs font-bold text-white truncate max-w-full">
                        {entry.name}
                      </div>
                      <div className="text-[10px] font-semibold text-nova-300">
                        {entry.xp.toLocaleString()} XP
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Full leaderboard list */}
              <div className="flex flex-col gap-2">
                {LEADERBOARD.map((entry) => (
                  <GlassCard
                    key={entry.rank}
                    className={`p-3 flex items-center gap-3 ${entry.you ? 'ring-1 ring-nova-400/40' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      entry.rank <= 3
                        ? 'bg-gradient-to-br from-gold-300 to-ember-500 text-ink-950'
                        : 'glass text-white/60'
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-xl flex-shrink-0">
                      {entry.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{entry.name}</span>
                        {entry.you && (
                          <Pill accent="text-nova-300 border-nova-500/30" className="flex-shrink-0">
                            You
                          </Pill>
                        )}
                      </div>
                      <div className="text-xs text-nova-300 font-semibold">
                        {entry.xp.toLocaleString()} XP
                      </div>
                    </div>
                    {entry.rank <= 3 && (
                      <Icon name="Trophy" size={18} className="text-gold-300 flex-shrink-0" />
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Friends tab */}
          {tab === 'friends' && (
            <div className="flex flex-col gap-2.5">
              {FRIENDS.map((friend) => {
                const status = STATUS_META[friend.status];
                return (
                  <GlassCard key={friend.id} className="p-3 flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-xl">
                        {friend.avatar}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-ink-950 ${status.color}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{friend.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                        <span className="text-xs text-white/50">{status.label}</span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs text-white/40">{friend.distance}</span>
                      </div>
                    </div>
                    <button
                      aria-label={`Wave at ${friend.name}`}
                      className="w-9 h-9 rounded-xl glass flex items-center justify-center text-nova-300 hover:bg-white/[0.1] transition-colors flex-shrink-0"
                    >
                      <Icon name="Hand" size={16} />
                    </button>
                  </GlassCard>
                );
              })}

              {/* Add friends card */}
              <GlassCard className="p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center">
                  <Icon name="UserPlus" size={24} className="text-ink-950" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Add Friends</h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    Search for players and invite friends to join your adventures.
                  </p>
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={() => setScreen('friends')} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow transition-all duration-200 active:scale-95">
                    <Icon name="Search" size={14} />
                    Find Friends
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold glass text-white hover:bg-white/[0.1] transition-all duration-200 active:scale-95">
                    <Icon name="Share2" size={14} />
                    Invite
                  </button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Routes tab */}
          {tab === 'routes' && (
            <div className="flex flex-col gap-2.5">
              {POPULAR_ROUTES.map((route) => (
                <GlassCard
                  key={route.id}
                  onClick={() => undefined}
                  className="p-3.5 flex items-center gap-3 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${route.accent} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {route.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{route.name}</h4>
                    <p className="text-xs text-white/50 truncate">by {route.author}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Pill icon="Star" accent="text-gold-300 border-gold-500/30">
                        {route.rating.toFixed(1)}
                      </Pill>
                      <Pill icon="Play" accent="text-nova-300 border-nova-500/30">
                        {route.plays.toLocaleString()}
                      </Pill>
                      <span className="text-[10px] text-white/40">{route.distance}</span>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-white/30 flex-shrink-0" />
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
