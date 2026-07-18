import { useState, useEffect, useCallback } from 'react';
import { useFriends, type PlayerSearchResult } from '../hooks/useFriends';
import { useNotifications } from '../hooks/useNotifications';
import { Card, Screen, Button, Badge, EmptyState, Spinner } from '../components/ui';
import { Users, Search, UserPlus, Check, X, Bell, UserMinus, Activity, Clock, Zap, Trophy, Footprints } from 'lucide-react';

type Tab = 'activity' | 'friends' | 'search' | 'requests' | 'notifications';

export default function Friends() {
  const { friends, friendIds, pendingSent, pendingReceived, sendingTo, loading, error, setError, sendRequest, acceptRequest, declineRequest, removeFriend, searchPlayers } = useFriends();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const showMessage = useCallback((type: 'error' | 'success', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }, []);

  useEffect(() => {
    if (error) showMessage('error', error);
  }, [error, showMessage]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await searchPlayers(query);
      setResults(r);
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, searchPlayers]);

  const handleSend = async (receiverId: string) => {
    const res = await sendRequest(receiverId);
    if (res.ok) showMessage('success', 'Friend request sent!');
    else if (res.error) showMessage('error', res.error);
    setResults((prev) => prev.map((p) => (p.id === receiverId ? { ...p, pending_sent: true } : p)));
  };

  const handleAccept = async (senderId: string) => {
    const res = await acceptRequest(senderId);
    if (res.ok) showMessage('success', 'Friend added!');
    else if (res.error) showMessage('error', res.error);
  };

  const handleDecline = async (senderId: string) => {
    const res = await declineRequest(senderId);
    if (!res.ok && res.error) showMessage('error', res.error);
  };

  const handleRemove = async (friendId: string) => {
    const res = await removeFriend(friendId);
    if (res.ok) showMessage('success', 'Friend removed');
    else if (res.error) showMessage('error', res.error);
  };

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'friends', label: 'Friends', icon: Users, badge: friends.length },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'requests', label: 'Requests', icon: UserPlus, badge: pendingReceived.size },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
  ];

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Social</h1>

      <div className="flex gap-1 mb-4 overflow-x-auto no-select pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setError(null); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${active ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>
              <Icon size={14} /> {t.label}
              {t.badge ? <span className={`text-xs rounded-full px-1.5 ${active ? 'bg-ink-950/20' : 'bg-zeviqo-500/20 text-zeviqo-400'}`}>{t.badge}</span> : null}
            </button>
          );
        })}
      </div>

      {msg && (
        <div className={`mb-3 p-3 rounded-xl text-sm ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>{msg.text}</div>
      )}

      {loading && tab !== 'search' && <div className="flex justify-center py-8"><Spinner /></div>}

      {/* ACTIVITY */}
      {tab === 'activity' && !loading && (
        <div className="space-y-2">
          {friends.length === 0 ? <EmptyState icon={Activity} title="No recent activity" subtitle="Add friends to see their activity here" /> : friends.map((f) => (
            <Card key={f.id} className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{f.avatar_emoji}</div>
              <div className="flex-1"><p className="text-white font-semibold text-sm">{f.username}</p><p className="text-ink-400 text-xs">{f.is_online ? 'Online now' : `Last seen ${new Date(f.last_seen ?? f.created_at).toLocaleDateString()}`}</p></div>
              <Badge color="#22c55e">{f.is_online ? 'Online' : 'Offline'}</Badge>
            </Card>
          ))}
        </div>
      )}

      {/* FRIENDS LIST */}
      {tab === 'friends' && !loading && (
        <div className="space-y-2">
          {friends.length === 0 ? <EmptyState icon={Users} title="No friends yet" subtitle="Search for players to add friends" /> : friends.map((f) => (
            <Card key={f.id} className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{f.avatar_emoji}</div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{f.username}</p>
                <div className="flex gap-2 mt-0.5"><Badge color="#3b82f6">Level {f.level}</Badge><Badge color="#22c55e"><Footprints size={10} className="inline" /> {(f.distance_walked / 1000).toFixed(1)}km</Badge></div>
              </div>
              <button onClick={() => handleRemove(f.id)} className="p-2 text-ink-400 hover:text-red-400"><UserMinus size={16} /></button>
            </Card>
          ))}
        </div>
      )}

      {/* SEARCH PLAYERS */}
      {tab === 'search' && (
        <div>
          <div className="relative mb-4">
            <Search size={18} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players by username..." className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" />
          </div>

          {searching && <div className="flex justify-center py-8"><Spinner /></div>}

          {!searching && query.trim().length < 2 && <EmptyState icon={Search} title="Search for players" subtitle="Type at least 2 characters to find players" />}

          {!searching && query.trim().length >= 2 && results.length === 0 && <EmptyState icon={Search} title="No players found" subtitle="Try a different search term" />}

          {!searching && results.length > 0 && (
            <div className="space-y-2">
              {results.map((p) => {
                const isSending = sendingTo.has(p.id);
                return (
                  <Card key={p.id} className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{p.avatar_emoji}</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{p.username}</p>
                      <div className="flex gap-2 mt-0.5"><Badge color="#3b82f6">Level {p.level}</Badge><Badge color="#fbbf24"><Zap size={10} className="inline" /> {p.xp.toLocaleString()}</Badge></div>
                    </div>
                    {p.is_friend ? (
                      <Badge color="#22c55e"><Check size={12} className="inline" /> Friend</Badge>
                    ) : p.pending_sent ? (
                      <Badge color="#fbbf24"><Clock size={12} className="inline" /> Pending</Badge>
                    ) : p.pending_received ? (
                      <Badge color="#a78bfa">Wants to be friends</Badge>
                    ) : isSending ? (
                      <Spinner size={20} />
                    ) : (
                      <Button size="sm" onClick={() => handleSend(p.id)} className="flex items-center gap-1"><UserPlus size={14} /> Add</Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FRIEND REQUESTS */}
      {tab === 'requests' && !loading && (
        <div className="space-y-2">
          {pendingReceived.size === 0 ? <EmptyState icon={UserPlus} title="No pending requests" subtitle="Friend requests will appear here" /> : (
            <div className="space-y-2">
              {friends.length > 0 && <p className="text-ink-400 text-xs">Pending received:</p>}
              {Array.from(pendingReceived).map((senderId) => {
                const sender = friends.find((f) => f.id === senderId);
                return (
                  <Card key={senderId} className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{sender?.avatar_emoji ?? '👤'}</div>
                    <div className="flex-1"><p className="text-white font-semibold text-sm">{sender?.username ?? 'Unknown player'}</p><p className="text-ink-400 text-xs">Sent you a friend request</p></div>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => handleAccept(senderId)} className="flex items-center gap-1"><Check size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDecline(senderId)} className="flex items-center gap-1"><X size={14} /></Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          {pendingSent.size > 0 && (
            <>
              <p className="text-ink-400 text-xs mt-4">Pending sent:</p>
              {Array.from(pendingSent).map((receiverId) => {
                const receiver = friends.find((f) => f.id === receiverId);
                return (
                  <Card key={receiverId} className="p-3 flex items-center gap-3 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{receiver?.avatar_emoji ?? '👤'}</div>
                    <div className="flex-1"><p className="text-white font-semibold text-sm">{receiver?.username ?? 'Unknown player'}</p><p className="text-ink-400 text-xs">Waiting for response</p></div>
                    <Badge color="#fbbf24"><Clock size={12} className="inline" /> Sent</Badge>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div>
          {unreadCount > 0 && <Button size="sm" variant="ghost" className="mb-3" onClick={markAllRead}>Mark all as read</Button>}
          {notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" subtitle="You'll see friend requests and updates here" /> : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <Card key={n.id} className={`p-3 flex items-center gap-3 ${!n.read ? 'border-zeviqo-500/30' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-zeviqo-500/20 flex items-center justify-center"><Bell size={18} color="#fbbf24" /></div>
                  <div className="flex-1 cursor-pointer" onClick={() => markRead(n.id)}>
                    <p className="text-white font-semibold text-sm">{n.title}</p>
                    <p className="text-ink-400 text-sm">{n.message}</p>
                    <p className="text-ink-500 text-xs">{new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-zeviqo-400" />}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Screen>
  );
}
