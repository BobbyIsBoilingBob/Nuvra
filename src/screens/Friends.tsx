import { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import { useNotifications } from '../hooks/useNotifications';
import { Card, Screen, Button, EmptyState, Spinner } from '../components/ui';
import { Users, Search, UserPlus, Bell, Check, X, UserX, Activity } from 'lucide-react';

type Tab = 'activity' | 'friends' | 'search' | 'requests' | 'notifications';

export default function Friends() {
  const [tab, setTab] = useState<Tab>('friends');
  const { friends, requests, loading, searchResults, searching, searchPlayers, sendRequest, acceptRequest, declineRequest, removeFriend } = useFriends();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: Tab; label: string; icon: typeof Users; badge?: number }[] = [
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'requests', label: 'Requests', icon: UserPlus, badge: requests.length },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
  ];

  const handleSearch = (q: string) => { setSearchQuery(q); searchPlayers(q); };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Social</h1>
      <div className="flex gap-1 mb-4 overflow-x-auto no-select pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>
            <t.icon size={16} /> {t.label}
            {t.badge ? <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-8"><Spinner /></div>}

      {!loading && tab === 'activity' && (
        friends.length === 0 ? <EmptyState icon={Activity} title="No activity yet" subtitle="Add friends to see their activity" />
        : <div className="space-y-2">{friends.map(f => (
          <Card key={f.id} className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{f.profile.avatar_emoji}</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{f.profile.username}</p>
              <p className="text-ink-400 text-xs flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${f.profile.is_online ? 'bg-green-500' : 'bg-ink-500'}`} />
                {f.profile.is_online ? 'Online' : `Last seen ${new Date(f.profile.last_seen ?? f.created_at).toLocaleDateString()}`}
              </p>
            </div>
          </Card>
        ))}</div>
      )}

      {!loading && tab === 'friends' && (
        friends.length === 0 ? <EmptyState icon={Users} title="No friends yet" subtitle="Search for players to add them" />
        : <div className="space-y-2">{friends.map(f => (
          <Card key={f.id} className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{f.profile.avatar_emoji}</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{f.profile.username}</p>
              <p className="text-ink-400 text-xs flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${f.profile.is_online ? 'bg-green-500' : 'bg-ink-500'}`} />
                {f.profile.is_online ? 'Online' : 'Offline'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeFriend(f.friend_id)}><UserX size={16} /></Button>
          </Card>
        ))}</div>
      )}

      {!loading && tab === 'search' && (
        <div>
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Search players by username..."
              className="w-full bg-ink-800/60 border border-ink-600/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" />
          </div>
          {searching && <div className="flex justify-center py-4"><Spinner /></div>}
          {!searching && searchResults.length === 0 && searchQuery && <EmptyState icon={Search} title="No players found" />}
          <div className="space-y-2">
            {searchResults.map(p => (
              <Card key={p.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{p.avatar_emoji}</div>
                <div className="flex-1"><p className="text-white font-semibold text-sm">{p.username}</p><p className="text-ink-400 text-xs">Level {p.level}</p></div>
                <Button size="sm" variant="primary" onClick={() => sendRequest(p.id)} className="flex items-center gap-1"><UserPlus size={14} /> Add</Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'requests' && (
        requests.length === 0 ? <EmptyState icon={UserPlus} title="No pending requests" />
        : <div className="space-y-2">{requests.map(r => (
          <Card key={r.id} className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{r.sender.avatar_emoji}</div>
            <div className="flex-1"><p className="text-white font-semibold text-sm">{r.sender.username}</p><p className="text-ink-400 text-xs">wants to be your friend</p></div>
            <div className="flex gap-1">
              <Button size="sm" variant="primary" onClick={() => acceptRequest(r.id, r.sender_id)}><Check size={16} /></Button>
              <Button size="sm" variant="danger" onClick={() => declineRequest(r.id)}><X size={16} /></Button>
            </div>
          </Card>
        ))}</div>
      )}

      {!loading && tab === 'notifications' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-ink-400 text-sm">{notifications.length} notifications</p>
            {unreadCount > 0 && <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>}
          </div>
          {notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" />
          : <div className="space-y-2">{notifications.map(n => (
            <Card key={n.id} className={`p-3 ${!n.read ? 'border-zeviqo-500/30' : ''}`} onClick={() => markRead(n.id)}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-ink-700/50 flex items-center justify-center"><Bell size={16} color="#00c4ff" /></div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{n.title}</p>
                  {n.body && <p className="text-ink-400 text-xs">{n.body}</p>}
                  <p className="text-ink-500 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-zeviqo-400" />}
              </div>
            </Card>
          ))}</div>}
        </div>
      )}
    </Screen>
  );
}
