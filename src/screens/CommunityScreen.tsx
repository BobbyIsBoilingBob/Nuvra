import { useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, GlassCard, AvatarBadge } from '../components/ui';
import { LEADERBOARD, FRIENDS, POPULAR_ROUTES, type Friend } from '../data';

type Tab = 'leaderboard' | 'friends' | 'routes';

export function CommunityScreen() {
  const { go, profile, totalXp } = useStore();
  const [tab, setTab] = useState<Tab>('leaderboard');
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy' },
    { id: 'friends', label: 'Friends', icon: 'Users' },
    { id: 'routes', label: 'Routes', icon: 'Route' },
  ];

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <div><h1 className="font-display text-2xl font-extrabold text-white">Community</h1><p className="text-xs text-slate-400">Explore together</p></div>
        </div>

        <div className="mt-5 glass rounded-2xl p-1.5 flex">
          {tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-gradient-to-r from-nova-300 to-nova-500 text-ink-950 shadow-glow' : 'text-slate-400 hover:text-slate-200'}`}><Icon name={t.icon} size={14} />{t.label}</button>))}
        </div>

        {tab === 'leaderboard' && (
          <div className="mt-5 stagger">
            <div className="grid grid-cols-3 gap-3 items-end mb-4">
              {[1, 0, 2].map((displayIdx) => {
                const entry = LEADERBOARD[displayIdx];
                const heights = ['h-24', 'h-28', 'h-20'];
                const medals = ['🥈', '🥇', '🥉'];
                const actualPos = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
                return (
                  <div key={entry.rank} className="flex flex-col items-center">
                    <div className="text-2xl mb-1">{medals[actualPos]}</div>
                    <div className="text-2xl mb-1">{entry.avatar}</div>
                    <p className="text-xs font-semibold text-white truncate max-w-full">{entry.name}</p>
                    <p className="text-[10px] text-nova-300 font-mono">{entry.xp.toLocaleString()}</p>
                    <div className={`mt-1.5 w-full ${heights[actualPos]} glass-strong rounded-t-2xl flex items-start justify-center pt-2`}><span className="font-display text-lg font-bold text-slate-300">{entry.rank}</span></div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              {LEADERBOARD.map((e) => (<div key={e.rank} className={`glass rounded-2xl p-3 flex items-center gap-3 ${e.you ? 'border-nova-400/40 shadow-glow' : ''}`}><span className={`font-display text-sm font-bold w-6 text-center ${e.rank <= 3 ? 'text-gold-300' : 'text-slate-400'}`}>{e.rank}</span><div className="text-xl">{e.avatar}</div><div className="flex-1 min-w-0"><p className={`text-sm font-semibold truncate ${e.you ? 'text-nova-300' : 'text-white'}`}>{e.name}{e.you && <span className="ml-2 chip bg-nova-400/15 text-nova-300 !px-2 !py-0.5 !text-[9px]">You</span>}</p></div><span className="font-mono text-xs font-bold text-nova-300">{e.xp.toLocaleString()} XP</span></div>))}
            </div>
          </div>
        )}

        {tab === 'friends' && (
          <div className="mt-5 stagger">
            <div className="flex flex-col gap-3">{FRIENDS.map((f) => <FriendCard key={f.id} friend={f} />)}</div>
            <button className="mt-4 w-full glass rounded-2xl py-3.5 font-semibold text-slate-200 active:scale-95 flex items-center justify-center gap-2"><Icon name="UserPlus" size={18} /> Add Friends</button>
          </div>
        )}

        {tab === 'routes' && (
          <div className="mt-5 stagger">
            <div className="flex flex-col gap-3">
              {POPULAR_ROUTES.map((r) => (<GlassCard key={r.id} className="p-4"><div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.accent} flex items-center justify-center text-xl shrink-0`}>{r.emoji}</div><div className="flex-1 min-w-0"><p className="font-bold text-sm text-white truncate">{r.name}</p><p className="text-xs text-slate-400">by {r.author} · {r.distance}</p><div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400"><span className="flex items-center gap-1 text-gold-300"><Icon name="Star" size={11} /> {r.rating}</span><span className="flex items-center gap-1"><Icon name="Users" size={11} /> {r.plays.toLocaleString()}</span></div></div><button className="glass rounded-xl px-3 py-2 text-xs font-semibold text-nova-300 active:scale-95">Try</button></div></GlassCard>))}
            </div>
          </div>
        )}

        <div className="mt-6 glass rounded-2xl p-4 flex items-center gap-3">
          <AvatarBadge emoji={profile.avatar.emoji} color={profile.avatar.color} size="md" />
          <div className="flex-1"><p className="text-sm font-bold text-white">{profile.username || 'Explorer'}</p><p className="text-xs text-slate-400">Level {profile.level} · {totalXp.toLocaleString()} XP</p></div>
          <button onClick={() => go('profile')} className="text-xs font-semibold text-nova-300">View Profile</button>
        </div>
      </div>
    </div>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  const statusMeta: Record<Friend['status'], { label: string; color: string }> = {
    on_adventure: { label: 'On Adventure', color: 'text-ember-300' },
    online: { label: 'Online', color: 'text-nova-300' },
    idle: { label: 'Idle', color: 'text-slate-400' },
  };
  const meta = statusMeta[friend.status];
  return (
    <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
      <div className="relative"><div className="text-2xl">{friend.avatar}</div><span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-ink-900 ${friend.status === 'on_adventure' ? 'bg-ember-400' : friend.status === 'online' ? 'bg-nova-400' : 'bg-slate-500'}`} /></div>
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-white">{friend.name}</p><p className={`text-[11px] font-semibold ${meta.color}`}>{meta.label} · {friend.distance}</p></div>
      <button className="glass rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 active:scale-95"><Icon name="MessageCircle" size={14} /></button>
    </div>
  );
}
