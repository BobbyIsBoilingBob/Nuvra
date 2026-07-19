import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type Friend = { id: string; username: string; avatar_emoji: string; avatar_color: string; status: string };
type Request = { id: string; sender_id: string; username: string; avatar_emoji: string; avatar_color: string };

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: fr }, { data: rq }] = await Promise.all([
      supabase.from('friends').select('friend_id, status').eq('status', 'accepted'),
      supabase.from('friend_requests').select('id, sender_id, status').eq('status', 'pending'),
    ]);
    const friendIds = (fr as any[])?.map(r => r.friend_id) ?? [];
    const senderIds = (rq as any[])?.map(r => r.sender_id) ?? [];
    const ids = [...friendIds, ...senderIds];
    let profiles: any[] = [];
    if (ids.length) {
      const { data } = await supabase.from('profiles').select('id, username, avatar_emoji, avatar_color').in('id', ids);
      profiles = data ?? [];
    }
    const pmap = new Map(profiles.map(p => [p.id, p]));
    setFriends(friendIds.map(id => ({ id, ...pmap.get(id), status: 'accepted' } as Friend)).filter(f => pmap.get(f.id)));
    setRequests((rq as any[])?.map(r => ({ id: r.id, sender_id: r.sender_id, ...pmap.get(r.sender_id) } as Request)).filter(r => pmap.get(r.sender_id)) ?? []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    const { data, error } = await supabase.from('profiles').select('id, username, avatar_emoji, avatar_color').ilike('username', `%${query}%`).limit(20);
    if (error) throw error;
    return (data as any[]) ?? [];
  }, []);

  const sendRequest = useCallback(async (receiverId: string) => {
    const { error } = await supabase.from('friend_requests').insert({ receiver_id: receiverId, status: 'pending' });
    if (error) throw error;
    await load();
  }, [load]);

  const accept = useCallback(async (requestId: string, senderId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const me = user?.id;
    if (!me) throw new Error('Not authenticated');
    const { error: e1 } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
    if (e1) throw e1;
    const { error: e2 } = await supabase.from('friends').insert([
      { user_id: me, friend_id: senderId, status: 'accepted' },
      { user_id: senderId, friend_id: me, status: 'accepted' },
    ]);
    if (e2) throw e2;
    await load();
  }, [load])

  const decline = useCallback(async (requestId: string) => {
    const { error } = await supabase.from('friend_requests').update({ status: 'declined' }).eq('id', requestId);
    if (error) throw error;
    await load();
  }, [load]);

  return { friends, requests, loading, error, search, sendRequest, accept, decline, reload: load };
}
