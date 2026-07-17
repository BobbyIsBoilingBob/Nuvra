import { useState, useCallback, useRef } from 'react';
import { Icon, GlassCard, Button, Spinner, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useFriends, type PlayerOnlineStatus } from '../hooks/useFriends';

const STATUS_META: Record<PlayerOnlineStatus, { label: string; color: string }> = {
  online: { label: 'Online', color: 'bg-nova-400' },
  offline: { label: 'Offline', color: 'bg-white/20' },
  walking: { label: 'Walking', color: 'bg-cyan-400' },
  in_adventure: { label: 'On Adventure', color: 'bg-ember-400' },
};

type Tab = 'friends' | 'requests' | 'outgoing' | 'search';

export function Friends(): React.ReactElement {
  const { profile, setScreen } = useStore();
  const friends = useFriends(profile.playerId);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; avatar: string; level: number; isFriend: boolean; hasOutgoingRequest: boolean }>>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<Tab>('friends');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchQueryRef = useRef('');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    searchQueryRef.current = q;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (q.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      const results = await friends.searchPlayers(searchQueryRef.current);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  }, [friends]);

  const handleSendRequest = useCallback(async (toId: string) => {
    const result = await friends.sendRequest(toId);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setSearchResults((prev) => prev.map((p) => p.id === toId ? { ...p, hasOutgoingRequest: true } : p));
    }
  }, [friends, showToast]);

  const handleCancelRequest = useCallback(async (requestId: string, toId: string) => {
    await friends.cancelRequest(requestId, toId);
    showToast('Request cancelled', 'success');
  }, [friends, showToast]);

  const handleRemoveFriend = useCallback(async (friendId: string) => {
    await friends.removeFriend(friendId);
    showToast('Friend removed', 'success');
  }, [friends, showToast]);

  const handleBlock = useCallback(async (friendId: string) => {
    await friends.blockUser(friendId);
    showToast('User blocked', 'success');
  }, [friends, showToast]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#40f5cb" />
      <div className="relative z-10">
        <TopBar showBack showCurrencies title="Friends" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-1.5">
            {([
              { key: 'friends', label: 'Friends', count: friends.friends.length },
              { key: 'requests', label: 'Requests', count: friends.requests.length },
              { key: 'outgoing', label: 'Sent', count: friends.outgoing.length },
              { key: 'search', label: 'Search', count: null },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  tab === t.key
                    ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950'
                    : 'glass text-white/60'
                }`}
              >
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-white/20">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Toast */}
          {toast && (
            <div className={`glass-strong rounded-xl px-4 py-2.5 flex items-center gap-2 animate-[fade-in_0.2s_ease-out] ${
              toast.type === 'success' ? 'text-nova-300' : 'text-rose-300'
            }`}>
              <Icon name={toast.type === 'success' ? 'Check' : 'AlertCircle'} size={14} />
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          )}

          {/* Friends tab */}
          {tab === 'friends' && (
            <>
              {friends.friends.length === 0 ? (
                <EmptyState
                  icon="Users"
                  title="No friends yet"
                  desc="Search for players and send friend requests to start walking together."
                  action={<Button size="sm" variant="secondary" icon="Search" onClick={() => setTab('search')}>Search Players</Button>}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.friends.map((f) => {
                    const statusMeta = STATUS_META[f.onlineStatus] ?? STATUS_META.offline;
                    return (
                      <GlassCard key={f.id} className="p-3 flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nova-400 to-cyan-400 flex items-center justify-center text-lg">
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
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="sm" variant="ghost" icon="UserPlus" onClick={() => setScreen('party')}>
                            Invite
                          </Button>
                          <button
                            onClick={() => handleRemoveFriend(f.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-300 transition-colors"
                            aria-label={`Remove ${f.username}`}
                          >
                            <Icon name="UserMinus" size={14} />
                          </button>
                          <button
                            onClick={() => handleBlock(f.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-300 transition-colors"
                            aria-label={`Block ${f.username}`}
                          >
                            <Icon name="Ban" size={14} />
                          </button>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Requests tab */}
          {tab === 'requests' && (
            <>
              {friends.requests.length === 0 ? (
                <EmptyState
                  icon="Mail"
                  title="No pending requests"
                  desc="Friend requests from other players will appear here."
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.requests.map((r) => (
                    <GlassCard key={r.id} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-ember-400 flex items-center justify-center text-lg flex-shrink-0">
                        {r.fromAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{r.fromUsername}</div>
                        <div className="text-xs text-white/40">Level {r.fromLevel}</div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="primary" icon="Check" onClick={() => friends.acceptRequest(r.id, r.fromId)} disabled={friends.loading}>
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" icon="X" onClick={() => friends.declineRequest(r.id)}>
                          Decline
                        </Button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Outgoing tab */}
          {tab === 'outgoing' && (
            <>
              {friends.outgoing.length === 0 ? (
                <EmptyState
                  icon="Send"
                  title="No outgoing requests"
                  desc="Friend requests you've sent will appear here until they're accepted."
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.outgoing.map((r) => (
                    <GlassCard key={r.id} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-400 flex items-center justify-center text-lg flex-shrink-0">
                        {r.toAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{r.toUsername}</div>
                        <div className="text-xs text-white/40">Level {r.toLevel} · Pending</div>
                      </div>
                      <Button size="sm" variant="ghost" icon="X" onClick={() => handleCancelRequest(r.id, r.toId)}>
                        Cancel
                      </Button>
                    </GlassCard>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Search tab */}
          {tab === 'search' && (
            <>
              <GlassCard className="p-3">
                <div className="flex items-center gap-2">
                  <Icon name="Search" size={16} className="text-white/50 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by username..."
                    className="flex-1 bg-transparent text-white text-sm font-medium placeholder:text-white/30 outline-none"
                    aria-label="Search players"
                  />
                  {searching && <Spinner size={16} />}
                </div>
              </GlassCard>

              {searchResults.length > 0 && (
                <div className="flex flex-col gap-2">
                  {searchResults.map((p) => (
                    <GlassCard key={p.id} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-400 flex items-center justify-center text-lg flex-shrink-0">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{p.username}</div>
                        <div className="text-xs text-white/40">Level {p.level}</div>
                      </div>
                      {p.isFriend ? (
                        <span className="text-xs font-bold text-nova-300 px-3 py-1.5">Friends</span>
                      ) : p.hasOutgoingRequest ? (
                        <span className="text-xs font-bold text-white/40 px-3 py-1.5">Pending</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon="UserPlus"
                          onClick={() => handleSendRequest(p.id)}
                          disabled={friends.loading}
                        >
                          Add
                        </Button>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}

              {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
                <EmptyState icon="SearchX" title="No players found" desc="Try a different search term." />
              )}

              {searchQuery.trim().length < 2 && (
                <EmptyState icon="Search" title="Search for players" desc="Find explorers by their username to send friend requests." />
              )}

              {friends.error && (
                <p className="text-xs text-rose-300 text-center">{friends.error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
