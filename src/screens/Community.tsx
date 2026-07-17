import { useState, useEffect, useCallback } from 'react';
import { Icon, GlassCard, Pill, Button, EmptyState, Spinner, Modal } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { supabase, type Profile as ProfileRow } from '../lib/supabase';
import { formatTimeAgo } from '../lib/map-utils';

type FriendRow = {
  friend_id: string;
  username: string;
  avatar_emoji: string;
  avatar_color: string;
  level: number;
  xp: number;
  is_online: boolean;
  last_seen: string;
  bio: string | null;
};

type RequestRow = {
  id: string;
  sender_id: string;
  username: string;
  avatar_emoji: string;
  avatar_color: string;
  level: number;
  xp: number;
};

type SearchResult = {
  id: string;
  username: string;
  avatar_emoji: string;
  avatar_color: string;
  level: number;
  xp: number;
  bio: string | null;
};

type NotifRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

type Tab = 'activity' | 'friends' | 'search' | 'requests' | 'notifications';

export function Community() {
  const { setScreen } = useStore();
  const [tab, setTab] = useState<Tab>('activity');
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUserId: string | null = (supabase.auth.getSession() as Promise<{ data: { session: { user: { id: string } } | null } }>).then?.(d => d?.data?.session?.user?.id ?? null) as unknown as string;

  const loadFriends = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, status')
      .eq('user_id', session.user.id)
      .eq('status', 'accepted');
    if (error || !data) { setLoading(false); return; }
    const friendIds = data.map(f => f.friend_id);
    if (friendIds.length === 0) { setFriends([]); setLoading(false); return; }
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_emoji, avatar_color, level, xp, is_online, last_seen, bio')
      .in('id', friendIds);
    if (profiles) {
      setFriends(profiles.map(p => ({
        friend_id: p.id,
        username: p.username,
        avatar_emoji: p.avatar_emoji,
        avatar_color: p.avatar_color,
        level: p.level,
        xp: p.xp,
        is_online: p.is_online ?? false,
        last_seen: p.last_seen ?? new Date().toISOString(),
        bio: p.bio ?? null
      })));
    }
    setLoading(false);
  }, []);

  const loadRequests = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('friends')
      .select('id, sender_id, status')
      .eq('friend_id', session.user.id)
      .eq('status', 'pending');
    if (error || !data) return;
    if (data.length === 0) { setRequests([]); return; }
    const senderIds = data.map(r => r.sender_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_emoji, avatar_color, level, xp')
      .in('id', senderIds);
    if (profiles) {
      const reqMap = new Map(data.map(r => [r.sender_id, r]));
      setRequests(profiles.map(p => ({
        id: reqMap.get(p.id)?.id ?? '',
        sender_id: p.id,
        username: p.username,
        avatar_emoji: p.avatar_emoji,
        avatar_color: p.avatar_color,
        level: p.level,
        xp: p.xp
      })));
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, read, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error && data) setNotifications(data as NotifRow[]);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) { setSearching(false); return; }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_emoji, avatar_color, level, xp, bio')
      .ilike('username', `%${searchQuery.trim()}%`)
      .neq('id', session.user.id)
      .limit(20);
    if (error) { setError('Search failed. Try again.'); setSearching(false); return; }
    setSearchResults((data ?? []) as SearchResult[]);
    setSearching(false);
  }, [searchQuery]);

  useEffect(() => {
    loadFriends();
    loadNotifications();
  }, [loadFriends, loadNotifications]);

  useEffect(() => {
    if (tab === 'requests') loadRequests();
  }, [tab, loadRequests]);

  const sendFriendRequest = async (targetId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('friends')
      .insert({ user_id: session.user.id, friend_id: targetId, status: 'pending' });
    if (error) {
      if (error.code === '23505') setError('Friend request already sent.');
      else setError(error.message);
    } else {
      await supabase.from('notifications').insert({
        user_id: targetId,
        actor_id: session.user.id,
        type: 'friend_request',
        title: 'New Friend Request',
        message: 'Someone wants to be your friend!'
      });
      setError('Friend request sent!');
    }
  };

  const acceptRequest = async (requestId: string, senderId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', requestId);
    await supabase.from('friends').insert({ user_id: senderId, friend_id: session.user.id, status: 'accepted' });
    await supabase.from('notifications').insert({
      user_id: senderId,
      actor_id: session.user.id,
      type: 'friend_accept',
      title: 'Friend Request Accepted',
      message: 'Your friend request was accepted!'
    });
    setRequests(prev => prev.filter(r => r.id !== requestId));
    loadFriends();
  };

  const declineRequest = async (requestId: string) => {
    await supabase.from('friends').delete().eq('id', requestId);
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const removeFriend = async (friendId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await supabase.from('friends').delete().eq('user_id', session.user.id).eq('friend_id', friendId);
    await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', session.user.id);
    setFriends(prev => prev.filter(f => f.friend_id !== friendId));
    if (profileModal) setProfileModal(null);
  };

  const blockUser = async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await supabase.from('blocks').insert({ blocker_id: session.user.id, blocked_id: userId });
    removeFriend(userId);
  };

  const markNotificationRead = async (notifId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'activity', label: 'Activity', icon: 'Activity' },
    { id: 'friends', label: 'Friends', icon: 'Users' },
    { id: 'search', label: 'Search', icon: 'Search' },
    { id: 'requests', label: 'Requests', icon: 'UserPlus' },
    { id: 'notifications', label: 'Alerts', icon: 'Bell' }
  ];

  const renderAvatar = (emoji: string, color: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes: Record<'sm' | 'md' | 'lg', string> = { sm: 'w-8 h-8 text-lg', md: 'w-12 h-12 text-2xl', lg: 'w-16 h-16 text-3xl' };
    return (
      <div className={`${sizes[size]} rounded-2xl flex items-center justify-center flex-shrink-0`} style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        {emoji}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#7a45ff" />
      <div className="relative z-10">
        <TopBar title="Community" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <div className="flex gap-1 p-1 glass rounded-2xl overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(null); }} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?'bg-gradient-to-r from-plasma-400 to-zeviqo-500 text-ink-950':'text-white/50'}`}>
                <Icon name={t.icon} size={12} />{t.label}
                {t.id === 'requests' && requests.length > 0 && <span className="ml-0.5 w-4 h-4 rounded-full bg-ember-500 text-ink-950 text-[9px] flex items-center justify-center">{requests.length}</span>}
                {t.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && <span className="ml-0.5 w-4 h-4 rounded-full bg-ember-500 text-ink-950 text-[9px] flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>}
              </button>
            ))}
          </div>

          {error && <div className="glass rounded-xl px-4 py-2.5 text-xs font-bold text-center text-zeviqo-300">{error}</div>}

          {tab === 'activity' && (
            <EmptyState icon="Activity" title="No activity yet" desc="When you and your friends complete adventures, find treasures, and level up, their activity will appear here." />
          )}

          {tab === 'friends' && (
            loading ? <div className="flex justify-center py-8"><Spinner /></div> :
            friends.length === 0 ? (
              <EmptyState icon="Users" title="No friends yet" desc="Search for players and send friend requests to build your community." action={<Button size="sm" variant="secondary" icon="Search" onClick={() => setTab('search')}>Search Players</Button>} />
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map(f => (
                  <GlassCard key={f.friend_id} className="p-3 flex items-center gap-3">
                    <div className="relative">
                      {renderAvatar(f.avatar_emoji, f.avatar_color)}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink-950 ${f.is_online ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{f.username}</div>
                      <div className="text-[10px] text-white/40">Level {f.level} {f.is_online ? '· Online' : `· ${formatTimeAgo(new Date(f.last_seen).getTime())}`}</div>
                    </div>
                    <Button size="sm" variant="ghost" icon="Eye" onClick={() => setProfileModal({ id: f.friend_id, username: f.username, avatar_emoji: f.avatar_emoji, avatar_color: f.avatar_color, level: f.level, xp: f.xp, bio: f.bio })}>View</Button>
                  </GlassCard>
                ))}
              </div>
            )
          )}

          {tab === 'search' && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by username..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-zeviqo-400/50"
                />
                <Button size="md" icon="Search" onClick={handleSearch} disabled={searching}>{searching ? <Spinner size={14} /> : 'Search'}</Button>
              </div>
              {searchResults.length === 0 && !searching && searchQuery && (
                <EmptyState icon="SearchX" title="No players found" desc="No registered users match your search. Try a different name." />
              )}
              {searchResults.length === 0 && !searching && !searchQuery && (
                <EmptyState icon="Search" title="Search for players" desc="Enter a username to find real registered Zeviqo players. No fake users — only real accounts." />
              )}
              <div className="flex flex-col gap-2">
                {searchResults.map(r => (
                  <GlassCard key={r.id} className="p-3 flex items-center gap-3">
                    {renderAvatar(r.avatar_emoji, r.avatar_color)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{r.username}</div>
                      <div className="text-[10px] text-white/40">Level {r.level} · {r.xp.toLocaleString()} XP</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" icon="Eye" onClick={() => setProfileModal(r)}>View</Button>
                      <Button size="sm" variant="secondary" icon="UserPlus" onClick={() => sendFriendRequest(r.id)}>Add</Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}

          {tab === 'requests' && (
            requests.length === 0 ? (
              <EmptyState icon="UserPlus" title="No friend requests" desc="When someone sends you a friend request, it will appear here." />
            ) : (
              <div className="flex flex-col gap-2">
                {requests.map(r => (
                  <GlassCard key={r.id} className="p-3 flex items-center gap-3">
                    {renderAvatar(r.avatar_emoji, r.avatar_color)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{r.username}</div>
                      <div className="text-[10px] text-white/40">Level {r.level}</div>
                    </div>
                    <Button size="sm" variant="primary" icon="Check" onClick={() => acceptRequest(r.id, r.sender_id)}>Accept</Button>
                    <Button size="sm" variant="ghost" icon="X" onClick={() => declineRequest(r.id)}>Decline</Button>
                  </GlassCard>
                ))}
              </div>
            )
          )}

          {tab === 'notifications' && (
            notifications.length === 0 ? (
              <EmptyState icon="Bell" title="No notifications" desc="Friend requests, level ups, and quest completions will show up here." />
            ) : (
              <div className="flex flex-col gap-2">
                {notifications.map(n => (
                  <GlassCard key={n.id} className={`p-3 flex items-start gap-3 ${!n.read ? 'ring-1 ring-zeviqo-400/30' : ''}`} onClick={() => !n.read && markNotificationRead(n.id)}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zeviqo-400/20 to-plasma-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name={n.type === 'friend_request' ? 'UserPlus' : n.type === 'friend_accept' ? 'Heart' : 'Bell'} size={18} className="text-zeviqo-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{n.title}</div>
                      <div className="text-xs text-white/50">{n.message}</div>
                      <div className="text-[10px] text-white/30 mt-1">{formatTimeAgo(new Date(n.created_at).getTime())}</div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-zeviqo-400 mt-1" />}
                  </GlassCard>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <Modal visible={profileModal !== null} onClose={() => setProfileModal(null)} title="Player Profile">
        {profileModal && (
          <div className="flex flex-col items-center gap-3">
            {renderAvatar(profileModal.avatar_emoji, profileModal.avatar_color, 'lg')}
            <h3 className="text-lg font-display font-bold text-white">{profileModal.username}</h3>
            <div className="flex gap-1.5">
              <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">Level {profileModal.level}</Pill>
              <Pill icon="Star" accent="text-gold-300 border-gold-500/30">{profileModal.xp.toLocaleString()} XP</Pill>
            </div>
            {profileModal.bio && <p className="text-sm text-white/60 text-center">{profileModal.bio}</p>}
            <div className="flex gap-2 w-full mt-2">
              {friends.some(f => f.friend_id === profileModal.id) ? (
                <>
                  <Button variant="secondary" size="sm" fullWidth icon="MessageCircle" onClick={() => {}}>Message</Button>
                  <Button variant="danger" size="sm" fullWidth icon="UserMinus" onClick={() => removeFriend(profileModal.id)}>Remove</Button>
                  <Button variant="ghost" size="sm" icon="Ban" onClick={() => blockUser(profileModal.id)}>Block</Button>
                </>
              ) : (
                <Button variant="primary" size="sm" fullWidth icon="UserPlus" onClick={() => { sendFriendRequest(profileModal.id); setProfileModal(null); }}>Send Friend Request</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
