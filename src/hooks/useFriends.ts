import { useEffect, useState, useCallback } from 'react';
import { supabase, type Friend, type FriendRequest, type Profile } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export type FriendsState = {
  friends: Friend[];
  requests: FriendRequest[];
  loading: boolean;
  searchResults: Profile[];
  searching: boolean;
};

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friends')
      .select('id, friend_id, created_at, friend:profiles!friends_friend_id_fkey(*)')
      .eq('user_id', user.id);
    if (data) setFriends(data as unknown as Friend[]);
  }, [user]);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, updated_at, sender:profiles!friend_requests_sender_id_fkey(*), receiver:profiles!friend_requests_receiver_id_fkey(*)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    if (data) setRequests(data as unknown as FriendRequest[]);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([loadFriends(), loadRequests()]).finally(() => setLoading(false));

    const channel = supabase.channel('friends-realtime');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `user_id=eq.${user.id}` }, () => loadFriends())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${user.id}` }, () => loadRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadFriends, loadRequests]);

  const searchPlayers = useCallback(async (query: string) => {
    if (!query.trim() || !user) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .neq('id', user.id)
      .limit(20);
    setSearchResults((data as Profile[]) ?? []);
    setSearching(false);
  }, [user]);

  const sendRequest = useCallback(async (receiverId: string) => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase.from('friend_requests').insert({
      sender_id: user.id, receiver_id: receiverId, status: 'pending',
    });
    return { error: error?.message ?? null };
  }, [user]);

  const acceptRequest = useCallback(async (requestId: string, senderId: string) => {
    if (!user) return { error: 'Not signed in' };
    const { error: e1 } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
    if (e1) return { error: e1.message };
    await supabase.from('friends').insert([
      { user_id: user.id, friend_id: senderId },
      { user_id: senderId, friend_id: user.id },
    ]);
    loadFriends(); loadRequests();
    return { error: null };
  }, [user, loadFriends, loadRequests]);

  const declineRequest = useCallback(async (requestId: string) => {
    const { error } = await supabase.from('friend_requests').update({ status: 'declined' }).eq('id', requestId);
    if (error) return { error: error.message };
    loadRequests();
    return { error: null };
  }, [loadRequests]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!user) return { error: 'Not signed in' };
    await supabase.from('friends').delete().or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq('friend_id', friendId);
    await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', user.id);
    loadFriends();
    return { error: null };
  }, [user, loadFriends]);

  return { friends, requests, loading, searchResults, searching, searchPlayers, sendRequest, acceptRequest, declineRequest, removeFriend, reload: () => { loadFriends(); loadRequests(); } };
}
