import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, type Friend, type FriendRequest, type NotificationRow, type Profile, type PartyData, type PartyMember } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friends')
      .select('id, friend_id, created_at, friend:profiles!friend_id(*)')
      .eq('user_id', user.id);
    setFriends((data as unknown as Friend[]) ?? []);
  }, [user]);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, updated_at, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    setRequests((data as unknown as FriendRequest[]) ?? []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([loadFriends(), loadRequests()]).finally(() => { if (mounted) setLoading(false); });

    const channel = supabase
      .channel('friends-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `user_id=eq.${user.id}` }, () => { if (mounted) loadFriends(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${user.id}` }, () => { if (mounted) loadRequests(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `sender_id=eq.${user.id}` }, () => { if (mounted) loadRequests(); })
      .subscribe();
    channelRef.current = channel;

    return () => { mounted = false; if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [user, loadFriends, loadRequests]);

  const sendRequest = useCallback(async (receiverId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: receiverId });
    return { error: error?.message ?? null };
  }, [user]);

  const acceptRequest = useCallback(async (requestId: string, senderId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in.' };
    const { error: updateErr } = await supabase.from('friend_requests').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', requestId);
    if (updateErr) return { error: updateErr.message };
    const { error: insertErr1 } = await supabase.from('friends').insert({ user_id: user.id, friend_id: senderId });
    const { error: insertErr2 } = await supabase.from('friends').insert({ user_id: senderId, friend_id: user.id });
    if (insertErr1 || insertErr2) return { error: insertErr1?.message ?? insertErr2?.message ?? null };
    await supabase.from('notifications').insert({ user_id: senderId, type: 'friend_accepted', title: 'Friend request accepted', body: 'Your friend request was accepted!' });
    return { error: null };
  }, [user]);

  const declineRequest = useCallback(async (requestId: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('friend_requests').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', requestId);
    return { error: error?.message ?? null };
  }, []);

  const removeFriend = useCallback(async (friendId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in.' };
    await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friendId);
    await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', user.id);
    return { error: null };
  }, [user]);

  const searchUsers = useCallback(async (query: string): Promise<Profile[]> => {
    if (!query || query.length < 2) return [];
    const { data } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(10);
    return (data as Profile[]) ?? [];
  }, []);

  return { friends, requests, loading, sendRequest, acceptRequest, declineRequest, removeFriend, searchUsers, loadFriends };
}
