import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { Users, UserPlus, Search, Check, X } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import type { FriendRequest } from '../types';

export default function Friends() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const [tab, setTab] = useState<'friends' | 'requests' | 'search' | 'notifications'>('friends');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; avatar_emoji?: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const { friends, requests, notifications, loading, error, acceptRequest, declineRequest, searchPlayers, sendRequest } = useFriends();

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

  const doSearch = async () => {
    setSearching(true);
    setActionError(null);
    const r = await searchPlayers(query);
    setSearchResults(r);
    setSearching(false);
  };

  const handleSend = async (userId: string) => {
    setActionError(null);
    const res = await sendRequest(userId);
    if (res.error) { setActionError(res.error); return; }
    setSentTo((prev) => new Set(prev).add(userId));
  };

  const handleAccept = async (req: FriendRequest) => {
    setActionError(null);
    const res = await acceptRequest(req);
    if (res.error) setActionError(res.error);
  };

  const handleDecline = async (req: FriendRequest) => {
    setActionError(null);
    const res = await declineRequest(req);
    if (res.error) setActionError(res.error);
  };

  return (
    <div className="pb-24"><Header title="Friends" />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(['friends', 'requests', 'search', 'notifications'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${tab === t ? 'bg-brand-500 text-white' : 'bg-ink-800 text-ink-300'}`}>{t}</button>
          ))}
        </div>

        {actionError && <p className="text-error-400 text-sm mb-3">{actionError}</p>}
        {error && <p className="text-error-400 text-sm mb-3">{error}</p>}
        {loading && <Spinner label="Loading…" />}

        {tab === 'friends' && (
          <div className="space-y-2">
            {friends.length === 0 && !loading && <p className="text-ink-400 text-sm text-center py-8">No friends yet. Search for players to add.</p>}
            {friends.map((f) => (
              <Card key={f.id} className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center text-lg">{f.avatar ?? '🧭'}</div>
                <div className="flex-1"><p className="text-white font-medium">{f.username}</p><p className="text-ink-400 text-xs capitalize">{f.status}</p></div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-2">
            {requests.length === 0 && !loading && <p className="text-ink-400 text-sm text-center py-8">No pending requests.</p>}
            {requests.map((r: FriendRequest) => (
              <Card key={r.id} className="p-3 flex items-center gap-3">
                <div className="flex-1"><p className="text-white font-medium">{r.fromUsername}</p><p className="text-ink-400 text-xs">wants to be your friend</p></div>
                <button onClick={() => handleAccept(r)} aria-label="Accept" className="text-success-400 hover:text-success-500 p-2"><Check size={20} /></button>
                <button onClick={() => handleDecline(r)} aria-label="Decline" className="text-ink-400 hover:text-error-400 p-2"><X size={20} /></button>
              </Card>
            ))}
          </div>
        )}

        {tab === 'search' && (
          <div>
            <div className="flex gap-2 mb-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players…" onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
                className="flex-1 px-3 py-2 rounded-xl bg-ink-900 border border-ink-700 text-white outline-none focus:border-brand-500" />
              <Button onClick={doSearch} disabled={searching || !query.trim()}><Search size={16} /></Button>
            </div>
            {searching && <Spinner label="Searching…" />}
            <div className="space-y-2">
              {searchResults.map((p) => (
                <Card key={p.id} className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center text-lg">{p.avatar_emoji ?? '🧭'}</div>
                  <div className="flex-1"><p className="text-white font-medium">{p.username}</p></div>
                  {sentTo.has(p.id) ? (
                    <span className="text-success-400 text-sm flex items-center gap-1"><Check size={16} /> Sent</span>
                  ) : (
                    <Button size="sm" onClick={() => handleSend(p.id)}><UserPlus size={16} /> Add</Button>
                  )}
                </Card>
              ))}
              {!searching && searchResults.length === 0 && query && <p className="text-ink-400 text-sm text-center py-8">No results.</p>}
              {!searching && searchResults.length === 0 && !query && <p className="text-ink-400 text-sm text-center py-8">Type a username to search.</p>}
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-2">
            {notifications.length === 0 && !loading && <p className="text-ink-400 text-sm text-center py-8">No notifications.</p>}
            {notifications.map((n) => (
              <Card key={n.id} className="p-3"><p className="text-white font-medium text-sm">{n.title}</p><p className="text-ink-400 text-xs mt-0.5">{n.body}</p></Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
