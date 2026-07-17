import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { supabase, type Profile as ProfileT, type AppNotification } from '../lib/supabase';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, Pill, ProfileAvatar, Skeleton, SkeletonList, ErrorState, EmptyState, Modal } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getLevelInfo } from '../data';
import { formatTimeAgo } from '../lib/map-utils';
import { vibrate } from '../lib/settings';

type Tab = 'activity' | 'friends' | 'search' | 'requests' | 'notifications';
type FriendRow = { id: string; profile: ProfileT; status: string };

export function Community() {
  const { profile, user } = useAuth();
  const { addRecentlyViewedProfile, recentlyViewedProfiles } = useStore();
  const [tab, setTab] = useState<Tab>('activity');
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [requests, setRequests] = useState<FriendRow[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewProfile, setViewProfile] = useState<ProfileT | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    const { data, error } = await supabase
      .from('friends')
      .select('id, friend_id, status, created_at, profiles!friends_friend_id_fkey(*)')
      .eq('user_id', user.id);
    setLoading(false);
    if (error) { setError('Could not load friends.'); return; }
    const rows: FriendRow[] = (data as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      profile: r.profiles as ProfileT,
      status: r.status as string
    }));
    setFriends(rows.filter(r => r.status === 'accepted'));
    setRequests(rows.filter(r => r.status === 'pending'));
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    setNotifications((data as AppNotification[]) ?? []);
  }, [user]);

  useEffect(() => {
    if (tab === 'friends' || tab === 'requests') loadFriends();
    if (tab === 'notifications') loadNotifications();
  }, [tab, loadFriends, loadNotifications]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    setLoading(true); setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${searchQuery.trim()}%`)
      .neq('id', user.id)
      .limit(20);
    setLoading(false);
    if (error) { setError('Search failed. Try again.'); return; }
    setSearchResults((data as ProfileT[]) ?? []);
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!user) return;
    setActionLoading(targetId);
    await supabase.from('friends').insert({ user_id: user.id, friend_id: targetId, status: 'pending' });
    await supabase.from('notifications').insert({ user_id: targetId, actor_id: user.id, type: 'friend_request', title: 'New Friend Request', message: `${profile?.username ?? 'Someone'} sent you a friend request.`, read: false });
    vibrate(20);
    setActionLoading(null);
    handleSearch();
  };

  const acceptRequest = async (rowId: string, friendId: string) => {
    if (!user) return;
    setActionLoading(rowId);
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', rowId);
    await supabase.from('friends').insert({ user_id: friendId, friend_id: user.id, status: 'accepted' });
    await supabase.from('notifications').insert({ user_id: friendId, actor_id: user.id, type: 'friend_accepted', title: 'Friend Request Accepted', message: `${profile?.username ?? 'Someone'} accepted your friend request.`, read: false });
    vibrate([20, 40, 20]);
    setActionLoading(null);
    loadFriends();
  };

  const removeFriend = async (rowId: string, friendId: string) => {
    if (!user) return;
    setActionLoading(rowId);
    await supabase.from('friends').delete().eq('id', rowId);
    await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', user.id);
    vibrate(20);
    setActionLoading(null);
    loadFriends();
  };

  const openProfile = (p: ProfileT) => {
    setViewProfile(p);
    addRecentlyViewedProfile({ id: p.id, username: p.username, avatar_emoji: p.avatar_emoji, avatar_color: p.avatar_color, level: p.level });
  };

  const isFriend = (id: string) => friends.some(f => f.profile.id === id);

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'activity', icon: 'Activity', label: 'Activity' },
    { key: 'friends', icon: 'Users', label: 'Friends' },
    { key: 'search', icon: 'Search', label: 'Search' },
    { key: 'requests', icon: 'UserPlus', label: 'Requests' },
    { key: 'notifications', icon: 'Bell', label: 'Alerts' }
  ];

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#3dd4ff" />
      <TopBar title="Community" showBack={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <div className="flex gap-1 overflow-x-auto no-scrollbar animate-fade-in">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tab===t.key?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>
              <Icon name={t.icon} size={12} />{t.label}
              {t.key === 'requests' && requests.length > 0 && <span className="ml-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">{requests.length}</span>}
              {t.key === 'notifications' && notifications.some(n => !n.read) && <span className="ml-1 w-2 h-2 rounded-full bg-rose-400" />}
            </button>
          ))}
        </div>

        {tab === 'activity' && (
          <div className="space-y-3 animate-fade-in">
            <GlassCard className="p-4">
              <h3 className="text-sm font-display font-bold text-white mb-2">Recent Activity</h3>
              {recentlyViewedProfiles.length === 0 ? (
                <p className="text-xs text-white/40">Profiles you view will appear here.</p>
              ) : (
                <div className="space-y-2">
                  {recentlyViewedProfiles.slice(0, 5).map(p => (
                    <button key={p.id} onClick={() => { const full = searchResults.find(s => s.id === p.id); if (full) openProfile(full); }} className="w-full flex items-center gap-3 p-2 rounded-xl glass">
                      <ProfileAvatar emoji={p.avatar_emoji} color={p.avatar_color} size="sm" />
                      <div className="flex-1 text-left"><p className="text-xs font-bold text-white">{p.username}</p><p className="text-[10px] text-white/40">Viewed {formatTimeAgo(p.viewedAt)}</p></div>
                      <Pill accent="text-zeviqo-300 border-zeviqo-500/20">LV {p.level}</Pill>
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
            <EmptyState icon="Activity" title="No recent activity" desc="Start exploring to see community activity here." />
          </div>
        )}

        {tab === 'friends' && (
          <div className="space-y-3 animate-fade-in">
            {loading ? <SkeletonList count={4} /> : error ? <ErrorState message={error} onRetry={loadFriends} /> : friends.length === 0 ? (
              <EmptyState icon="Users" title="No friends yet" desc="Search for players and send friend requests to build your network." action={<Button size="sm" icon="Search" onClick={() => setTab('search')}>Find Players</Button>} />
            ) : (
              friends.map(row => (
                <GlassCard key={row.id} className="p-3 flex items-center gap-3 animate-slide-up">
                  <button onClick={() => openProfile(row.profile)}><ProfileAvatar emoji={row.profile.avatar_emoji} color={row.profile.avatar_color} size="md" online={row.profile.is_online} /></button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{row.profile.username}</p>
                    <p className="text-[10px] text-white/40">{row.profile.is_online ? 'Online now' : `Last seen ${formatTimeAgo(new Date(row.profile.last_seen).getTime())}`}</p>
                  </div>
                  <Pill accent="text-zeviqo-300 border-zeviqo-500/20">LV {row.profile.level}</Pill>
                  <Button size="sm" variant="ghost" icon="X" onClick={() => removeFriend(row.id, row.profile.id)} disabled={actionLoading === row.id}> </Button>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {tab === 'search' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search by username..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-zeviqo-400/50" />
              </div>
              <Button size="md" icon="Search" onClick={handleSearch} disabled={loading}>Search</Button>
            </div>
            {loading ? <SkeletonList count={5} /> : error ? <ErrorState message={error} onRetry={handleSearch} /> : searchResults.length === 0 && searchQuery ? (
              <EmptyState icon="Search" title="No players found" desc="Try a different username." />
            ) : (
              searchResults.map(p => (
                <GlassCard key={p.id} className="p-3 flex items-center gap-3 animate-slide-up">
                  <button onClick={() => openProfile(p)}><ProfileAvatar emoji={p.avatar_emoji} color={p.avatar_color} size="md" online={p.is_online} /></button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{p.username}</p>
                    <p className="text-[10px] text-white/40">{p.is_online ? 'Online now' : `Last seen ${formatTimeAgo(new Date(p.last_seen).getTime())}`}</p>
                  </div>
                  <Pill accent="text-zeviqo-300 border-zeviqo-500/20">LV {p.level}</Pill>
                  {isFriend(p.id) ? (
                    <Pill icon="Check" accent="text-emerald-300 border-emerald-500/20">Friend</Pill>
                  ) : (
                    <Button size="sm" icon="UserPlus" onClick={() => sendFriendRequest(p.id)} disabled={actionLoading === p.id}>Add</Button>
                  )}
                </GlassCard>
              ))
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-3 animate-fade-in">
            {loading ? <SkeletonList count={3} /> : error ? <ErrorState message={error} onRetry={loadFriends} /> : requests.length === 0 ? (
              <EmptyState icon="UserPlus" title="No friend requests" desc="Pending friend requests will appear here." />
            ) : (
              requests.map(row => (
                <GlassCard key={row.id} className="p-3 flex items-center gap-3 animate-slide-up">
                  <button onClick={() => openProfile(row.profile)}><ProfileAvatar emoji={row.profile.avatar_emoji} color={row.profile.avatar_color} size="md" /></button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{row.profile.username}</p>
                    <p className="text-[10px] text-white/40">Sent {formatTimeAgo(new Date(row.profile.created_at).getTime())}</p>
                  </div>
                  <Button size="sm" icon="Check" onClick={() => acceptRequest(row.id, row.profile.id)} disabled={actionLoading === row.id}>Accept</Button>
                  <Button size="sm" variant="ghost" icon="X" onClick={() => removeFriend(row.id, row.profile.id)} disabled={actionLoading === row.id}> </Button>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-3 animate-fade-in">
            {notifications.length === 0 ? (
              <EmptyState icon="Bell" title="No notifications" desc="You're all caught up!" />
            ) : (
              notifications.map(n => (
                <GlassCard key={n.id} className={`p-3 flex items-start gap-3 animate-slide-up ${!n.read ? 'border-zeviqo-500/20' : ''}`}>
                  <div className="w-9 h-9 rounded-xl glass flex items-center justify-center"><Icon name="Bell" size={16} className="text-zeviqo-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{n.title}</p>
                    <p className="text-[11px] text-white/50">{n.message}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{formatTimeAgo(new Date(n.created_at).getTime())}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-zeviqo-400 mt-2" />}
                </GlassCard>
              ))
            )}
          </div>
        )}
      </div>

      <Modal visible={viewProfile !== null} onClose={() => setViewProfile(null)} title="Player Profile">
        {viewProfile && (
          <div className="flex flex-col items-center text-center">
            <ProfileAvatar emoji={viewProfile.avatar_emoji} color={viewProfile.avatar_color} size="lg" online={viewProfile.is_online} />
            <h3 className="text-lg font-display font-bold text-white mt-3">{viewProfile.username}</h3>
            <p className="text-xs text-white/40">{viewProfile.is_online ? 'Online now' : `Last seen ${formatTimeAgo(new Date(viewProfile.last_seen).getTime())}`}</p>
            {viewProfile.bio && <p className="text-sm text-white/60 mt-2">{viewProfile.bio}</p>}
            <div className="grid grid-cols-3 gap-3 mt-4 w-full">
              <div className="glass rounded-xl p-2"><p className="text-sm font-bold text-zeviqo-300">LV {viewProfile.level}</p><p className="text-[9px] text-white/40">Level</p></div>
              <div className="glass rounded-xl p-2"><p className="text-sm font-bold text-ember-300">{viewProfile.completed_adventures}</p><p className="text-[9px] text-white/40">Adventures</p></div>
              <div className="glass rounded-xl p-2"><p className="text-sm font-bold text-gold-300">{viewProfile.distance_walked.toFixed(1)}km</p><p className="text-[9px] text-white/40">Walked</p></div>
            </div>
            {!isFriend(viewProfile.id) && viewProfile.id !== user?.id && (
              <Button fullWidth size="md" icon="UserPlus" className="mt-4" onClick={() => { sendFriendRequest(viewProfile.id); setViewProfile(null); }}>Send Friend Request</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
