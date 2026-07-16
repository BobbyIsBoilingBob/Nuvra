import { useState, useCallback } from 'react';
import { Icon, GlassCard, Button, Spinner, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useFriends } from '../hooks/useFriends';

export function Friends(): React.ReactElement {
  const { profile, setScreen } = useStore();
  const friends = useFriends(profile.playerId);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; avatar: string; level: number }>>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await friends.searchPlayers(q);
    setSearchResults(results);
    setSearching(false);
  }, [friends]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#40f5cb" />
      <div className="relative z-10">
        <TopBar showBack showCurrencies title="Friends" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {([
              { key: 'friends', label: 'Friends', count: friends.friends.length },
              { key: 'requests', label: 'Requests', count: friends.requests.length },
              { key: 'search', label: 'Search', count: null },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
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
                  {friends.friends.map((f) => (
                    <GlassCard key={f.id} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nova-400 to-cyan-400 flex items-center justify-center text-lg flex-shrink-0">
                        {f.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{f.username}</div>
                        <div className="text-xs text-white/40">Level {f.level}</div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" icon="UserPlus" onClick={() => setScreen('party')}>
                          Invite
                        </Button>
                        <button
                          onClick={() => friends.removeFriend(f.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-300 transition-colors"
                          aria-label={`Remove ${f.username}`}
                        >
                          <Icon name="UserMinus" size={14} />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
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
                        <Button size="sm" variant="primary" icon="Check" onClick={() => friends.acceptRequest(r.id, r.fromId)}>
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
                  {searching && <Spinner />}
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
                      <Button
                        size="sm"
                        variant="secondary"
                        icon="UserPlus"
                        onClick={() => friends.sendRequest(p.id)}
                        disabled={friends.loading}
                      >
                        Add
                      </Button>
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
