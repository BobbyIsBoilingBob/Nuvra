import { useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, AvatarDisplay, Pill, Button, LoadingScreen } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useFriends } from '../hooks/useFriends';
import { type Profile } from '../lib/supabase';

export function Friends() {
  const { goBack } = useStore();
  const { friends, requests, loading, sendRequest, acceptRequest, declineRequest, removeFriend, searchUsers } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setSearching(false);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Friends" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <div>
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
            <Icon name="Search" size={16} className="text-white/40" />
            <input
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by username..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
          {searching && <p className="text-[10px] text-white/40 mt-1">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="space-y-2 mt-2">
              {searchResults.map(user => (
                <GlassCard key={user.id} className="p-3 flex items-center gap-3">
                  <AvatarDisplay emoji={user.avatar_emoji ?? '🧭'} color={user.avatar_color ?? '#00c4ff'} size={36} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{user.username}</p>
                    <p className="text-[10px] text-white/40">{user.xp ?? 0} XP</p>
                  </div>
                  <Button size="sm" icon="UserPlus" onClick={() => sendRequest(user.id)}>Add</Button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {requests.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Icon name="Bell" size={14} className="text-zeviqo-400" />
              Pending Requests ({requests.length})
            </h3>
            <div className="space-y-2">
              {requests.map(req => (
                <GlassCard key={req.id} className="p-3 flex items-center gap-3">
                  <AvatarDisplay emoji={req.sender?.avatar_emoji ?? '🧭'} color={req.sender?.avatar_color ?? '#00c4ff'} size={36} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{req.sender?.username ?? 'Unknown'}</p>
                    <p className="text-[10px] text-white/40">wants to be your friend</p>
                  </div>
                  <Button size="sm" icon="Check" onClick={() => acceptRequest(req.id, req.sender_id)}>Accept</Button>
                  <Button size="sm" variant="ghost" icon="X" onClick={() => declineRequest(req.id)}>Decline</Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Icon name="Users" size={14} className="text-zeviqo-400" />
            Your Friends ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <Icon name="UserPlus" size={24} className="text-white/30 mx-auto mb-2" />
              <p className="text-xs text-white/40">No friends yet. Search above to add some!</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {friends.map(f => (
                <GlassCard key={f.id} className="p-3 flex items-center gap-3">
                  <div className="relative">
                    <AvatarDisplay emoji={f.profile?.avatar_emoji ?? '🧭'} color={f.profile?.avatar_color ?? '#00c4ff'} size={36} />
                    {f.profile?.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-ink-900" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{f.profile?.username ?? 'Unknown'}</p>
                    <p className="text-[10px] text-white/40">{f.profile?.is_online ? 'Online' : 'Offline'}</p>
                  </div>
                  <Button size="sm" variant="ghost" icon="X" onClick={() => removeFriend(f.friend_id)}>Remove</Button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
