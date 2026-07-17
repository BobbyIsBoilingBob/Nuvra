import { useState, useEffect, useCallback } from 'react';
import { Icon, GlassCard, Pill, Spinner, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useFriends, type PlayerOnlineStatus } from '../hooks/useFriends';
import { supabase } from '../lib/supabase';

type Tab = 'activity' | 'friends' | 'leaderboard';

const STATUS_META: Record<PlayerOnlineStatus, { label: string; color: string }> = {
  online: { label: 'Online', color: 'bg-nova-400' },
  offline: { label: 'Offline', color: 'bg-white/20' },
  walking: { label: 'Walking', color: 'bg-cyan-400' },
  in_adventure: { label: 'On Adventure', color: 'bg-ember-400' },
};

const ACTIVITY_META: Record<string, { icon: string; color: string; label: string }> = {
  adventure_completed: { icon: 'Flag', color: 'text-nova-300', label: 'completed an adventure' },
  challenge_completed: { icon: 'Swords', color: 'text-ember-300', label: 'completed a challenge' },
  achievement_unlocked: { icon: 'Trophy', color: 'text-gold-300', label: 'unlocked an achievement' },
  level_up: { icon: 'TrendingUp', color: 'text-cyan-300', label: 'reached a new level' },
  friend_added: { icon: 'UserPlus', color: 'text-plasma-300', label: 'added a new friend' },
  treasure_found: { icon: 'Gem', color: 'text-gold-300', label: 'found a treasure' },
  party_joined: { icon: 'Users', color: 'text-plasma-300', label: 'joined a party' },
};

interface ActivityEntry {
  id: string;
  username: string;
  avatar: string;
  activityType: string;
  description: string;
  createdAt: number;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
}

export function Community(): React.ReactElement {
  const { setScreen } = useStore();
  const { profile } = useStore();
  const friends = useFriends(profile.playerId);
  const [tab, setTab] = useState<Tab>('activity');
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const loadActivity = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('nuvra_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) throw error;

      setActivity((data ?? []).map((a: Record<string, unknown>) => ({
        id: a.id as string,
        username: a.username as string,
        avatar: a.avatar as string,
        activityType: a.activity_type as string,
        description: (a.description as string) ?? '',
        createdAt: new Date(a.created_at as string).getTime(),
      })));
    } catch {
      // Best-effort
    } finally {
      setActivityLoading(false);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('nuvra_players')
        .select('*')
        .order('xp', { ascending: false })
        .limit(20);

      if (error) throw error;

      setLeaderboard((data ?? []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        username: p.username as string,
        avatar: p.avatar as string,
        level: p.level as number,
        xp: p.xp as number,
      })));
    } catch {
      // Best-effort
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
    loadLeaderboard();

    const channel = supabase
      .channel('activity_feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nuvra_activity_log',
      }, (payload) => {
        const data = payload.new as Record<string, unknown>;
        if (!data) return;
        setActivity((prev) => [{
          id: data.id as string,
          username: data.username as string,
          avatar: data.avatar as string,
          activityType: data.activity_type as string,
          description: (data.description as string) ?? '',
          createdAt: Date.now(),
        }, ...prev].slice(0, 25));
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [loadActivity, loadLeaderboard]);

  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'activity', label: 'Activity', icon: 'Activity' },
    { id: 'friends', label: 'Friends', icon: 'Users' },
    { id: 'leaderboard', label: 'Leaders', icon: 'Trophy' },
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

          {/* Activity feed */}
          {tab === 'activity' && (
            <>
              {activityLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : activity.length === 0 ? (
                <EmptyState
                  icon="Activity"
                  title="No activity yet"
                  desc="When you and your friends complete adventures, find treasures, and level up, their activity will appear here."
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {activity.map((a) => {
                    const meta = ACTIVITY_META[a.activityType] ?? { icon: 'Circle', color: 'text-white/40', label: a.description };
                    return (
                      <GlassCard key={a.id} className="p-3 flex items-center gap-3 animate-[fade-in_0.3s_ease-out]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-lg flex-shrink-0">
                          {a.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-bold text-white">{a.username}</span>{' '}
                            <span className="text-white/60">{a.description || meta.label}</span>
                          </div>
                          <div className="text-xs text-white/30 mt-0.5">{formatTime(a.createdAt)}</div>
                        </div>
                        <Icon name={meta.icon} size={16} className={`${meta.color} flex-shrink-0`} />
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Friends tab */}
          {tab === 'friends' && (
            <>
              {friends.friends.length === 0 ? (
                <EmptyState
                  icon="Users"
                  title="No friends yet"
                  desc="Search for players and send friend requests to build your community."
                  action={<button onClick={() => setScreen('friends')} className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950">Find Friends</button>}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.friends.map((f) => {
                    const statusMeta = STATUS_META[f.onlineStatus] ?? STATUS_META.offline;
                    return (
                      <GlassCard key={f.id} className="p-3 flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-lg">
                            {f.avatar}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink-950 ${statusMeta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{f.username}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-white/40">Level {f.level}</span>
                            <span className="text-xs text-white/20">·</span>
                            <span className="text-xs text-white/40">{statusMeta.label}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setScreen('party')}
                          className="w-9 h-9 rounded-xl glass flex items-center justify-center text-nova-300 hover:bg-white/10 transition-colors flex-shrink-0"
                          aria-label={`Invite ${f.username} to party`}
                        >
                          <Icon name="UserPlus" size={14} />
                        </button>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Leaderboard tab */}
          {tab === 'leaderboard' && (
            <>
              {leaderboardLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : leaderboard.length === 0 ? (
                <EmptyState
                  icon="Trophy"
                  title="No rankings yet"
                  desc="Play adventures to earn XP and climb the leaderboard. Rankings will appear once players start exploring."
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {leaderboard.slice(0, 3).map((entry, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                    const isTop = i === 0;
                    return (
                      <GlassCard key={entry.id} className={`p-3 flex items-center gap-3 ${isTop ? 'ring-1 ring-gold-400/30' : ''}`}>
                        <div className="text-2xl">{medal}</div>
                        <div className={`rounded-full bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center ${isTop ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-lg'}`}>
                          {entry.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{entry.username}</div>
                          <div className="text-xs text-nova-300 font-semibold">{entry.xp.toLocaleString()} XP</div>
                        </div>
                        <Pill accent="text-gold-300 border-gold-500/30">Lv {entry.level}</Pill>
                      </GlassCard>
                    );
                  })}
                  {leaderboard.length > 3 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {leaderboard.slice(3).map((entry, i) => (
                        <GlassCard key={entry.id} className={`p-2.5 flex items-center gap-3 ${entry.id === profile.playerId ? 'ring-1 ring-nova-400/40' : ''}`}>
                          <div className="w-8 h-8 rounded-lg glass flex items-center justify-center text-sm font-black text-white/60 flex-shrink-0">
                            {i + 4}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-base flex-shrink-0">
                            {entry.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">{entry.username}</span>
                              {entry.id === profile.playerId && (
                                <Pill accent="text-nova-300 border-nova-500/30" className="flex-shrink-0">You</Pill>
                              )}
                            </div>
                            <div className="text-xs text-nova-300 font-semibold">{entry.xp.toLocaleString()} XP</div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
