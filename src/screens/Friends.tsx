import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { Users, UserPlus, Search } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import type { FriendRequest } from '../types';

export default function Friends() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const [tab, setTab] = useState<'friends' | 'requests' | 'search' | 'notifications'>('friends');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { friends, requests, notifications, acceptRequest, declineRequest, searchPlayers, sendRequest } = useFriends();

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Friends" />
        <div className="px-4 py-10 max-w-md mx-auto text-center">
          <Users size={48} className="text-ink-500 mx-auto" />
          <h2 className="font-display text-xl font-bold text-white mt-4">Sign in to connect with friends</h2>
          <p className="text-ink-300 mt-2">Add friends, send requests, and walk together.</p>
          <Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const doSearch = async () => { const r = await searchPlayers(query); setSearchResults(r); };

  return (
    <div className="pb-24"><Header title="Friends" />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <div className="flex gap-2 mb-4">
          {(['friends', 'requests', 'search', 'notifications'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-brand-500 text-white' : 'bg-ink-800 text-ink-300'}`}>{t}</button>
          ))}
        </div>
        {tab === 'friends' && (
          <div className="space-y-2">
            {friends.length === 0 && <p className="text-ink-400 text-sm">No friends yet. Search for players to add.</p>}
            {friends.map((f) => (
              <Card key={f.id} className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center"><UserPlus size={18} className="text-brand-300" /></div>
                <div className="flex-1"><p className="text-white font-medium">{f.username}</p><p className="text-ink-400 text-xs capitalize">{f.status}</p></div>
              </Card>
            ))}
          </div>
        )}
        {tab === 'requests' && (
          <div className="space-y-2">
            {requests.length === 0 && <p className="text-ink-400 text-sm">No pending requests.</p>}
            {requests.map((r: FriendRequest) => (
              <Card key={r.id} className="p-3 flex items-center gap-3">
                <div className="flex-1"><p className="text-white font-medium">{r.fromUsername}</p><p className="text-ink-400 text-xs">wants to be your friend</p></div>
                <Button size="sm" onClick={() => acceptRequest(r)}>Accept</Button>
                <Button size="sm" variant="ghost" onClick={() => declineRequest(r)}>Decline</Button>
              </Card>
            ))}
          </div>
        )}
        {tab === 'search' && (
          <div>
            <div className="flex gap-2 mb-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players…"
                className="flex-1 px-3 py-2 rounded-xl bg-ink-900 border border-ink-700 text-white outline-none focus:border-brand-500" />
              <Button onClick={doSearch}><Search size={16} /></Button>
            </div>
            <div className="space-y-2">
              {searchResults.map((p) => (
                <Card key={p.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1"><p className="text-white font-medium">{p.username}</p></div>
                  <Button size="sm" onClick={() => sendRequest(p.id)}>Add</Button>
                </Card>
              ))}
              {searchResults.length === 0 && query && <p className="text-ink-400 text-sm">No results.</p>}
            </div>
          </div>
        )}
        {tab === 'notifications' && (
          <div className="space-y-2">
            {notifications.length === 0 && <p className="text-ink-400 text-sm">No notifications.</p>}
            {notifications.map((n) => (
              <Card key={n.id} className="p-3"><p className="text-white font-medium text-sm">{n.title}</p><p className="text-ink-400 text-xs mt-0.5">{n.body}</p></Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
