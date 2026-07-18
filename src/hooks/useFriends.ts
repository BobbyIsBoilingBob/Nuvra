import { useState, useEffect, useCallback } from 'react';
import { supabase, type Profile, type FriendRequest } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export type PlayerSearchResult = Profile & { is_friend?: boolean; pending_sent?: boolean; pending_received?: boolean };

export function useFriends() {
  const { session } = useAuth();
  const uid = session?.user?.id;
  const [friends, setFriends] = useState<Profile[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());
  const [pendingReceived, setPendingReceived] = useState<Set<string>>(new Set());
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!uid) return; setLoading(true); setError(null);
    try {
      const [friendsRes, sentRes, receivedRes] = await Promise.all([
        supabase.from('friends').select('*, friend:profiles!friends_friend_id_fkey(*)').eq('user_id', uid),
        supabase.from('friend_requests').select('*').eq('sender_id', uid).eq('status', 'pending'),
        supabase.from('friend_requests').select('*').eq('receiver_id', uid).eq('status', 'pending'),
      ]);
      if (friendsRes.data) { const fp = friendsRes.data.map((r: any) => r.friend as Profile); setFriends(fp); setFriendIds(new Set(fp.map((p) => p.id))); }
      if (sentRes.data) setPendingSent(new Set((sentRes.data as FriendRequest[]).map((r) => r.receiver_id)));
      if (receivedRes.data) setPendingReceived(new Set((receivedRes.data as FriendRequest[]).map((r) => r.sender_id)));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [uid]);

  useEffect(() => { load(); if (!uid) return; const sub = supabase.channel('friends-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `user_id=eq.${uid}` }, () => load()).on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${uid}` }, () => load()).on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `sender_id=eq.${uid}` }, () => load()).subscribe(); return () => { sub.unsubscribe(); }; }, [uid, load]);

  const sendRequest = useCallback(async (receiverId: string): Promise<{ ok: boolean; error?: string }> => {
    if (!uid) return { ok: false, error: 'Not signed in' }; if (receiverId === uid) return { ok: false, error: "You can't friend yourself" }; if (friendIds.has(receiverId)) return { ok: false, error: 'Already friends' }; if (pendingSent.has(receiverId)) return { ok: false, error: 'Request already sent' };
    setSendingTo((prev) => new Set(prev).add(receiverId)); setError(null);
    try {
      const { error: insertErr } = await supabase.from('friend_requests').insert({ sender_id: uid, receiver_id: receiverId, status: 'pending' });
      if (insertErr) { if (insertErr.code === '23505') return { ok: false, error: 'Request already exists' }; throw new Error(insertErr.message); }
      await supabase.from('notifications').insert({ user_id: receiverId, actor_id: uid, type: 'friend_request', title: 'Friend Request', message: 'sent you a friend request', read: false });
      setPendingSent((prev) => new Set(prev).add(receiverId)); return { ok: true };
    } catch (e: any) { setError(e.message); return { ok: false, error: e.message }; } finally { setSendingTo((prev) => { const n = new Set(prev); n.delete(receiverId); return n; }); }
  }, [uid, friendIds, pendingSent]);

  const acceptRequest = useCallback(async (senderId: string): Promise<{ ok: boolean; error?: string }> => {
    if (!uid) return { ok: false, error: 'Not signed in' };
    try {
      const { error: updateErr } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('sender_id', senderId).eq('receiver_id', uid).eq('status', 'pending'); if (updateErr) throw new Error(updateErr.message);
      const { error: insertErr } = await supabase.from('friends').insert([{ user_id: uid, friend_id: senderId }, { user_id: senderId, friend_id: uid }]); if (insertErr) throw new Error(insertErr.message);
      await supabase.from('notifications').insert({ user_id: senderId, actor_id: uid, type: 'friend_accepted', title: 'Friend Accepted', message: 'accepted your friend request', read: false });
      setFriendIds((prev) => new Set(prev).add(senderId)); setPendingReceived((prev) => { const n = new Set(prev); n.delete(senderId); return n; }); await load(); return { ok: true };
    } catch (e: any) { setError(e.message); return { ok: false, error: e.message }; }
  }, [uid, load]);

  const declineRequest = useCallback(async (senderId: string): Promise<{ ok: boolean; error?: string }> => {
    if (!uid) return { ok: false, error: 'Not signed in' };
    try { const { error } = await supabase.from('friend_requests').update({ status: 'declined' }).eq('sender_id', senderId).eq('receiver_id', uid).eq('status', 'pending'); if (error) throw new Error(error.message); setPendingReceived((prev) => { const n = new Set(prev); n.delete(senderId); return n; }); return { ok: true }; } catch (e: any) { setError(e.message); return { ok: false, error: e.message }; }
  }, [uid]);

  const removeFriend = useCallback(async (friendId: string): Promise<{ ok: boolean; error?: string }> => {
    if (!uid) return { ok: false, error: 'Not signed in' };
    try { const { error } = await supabase.from('friends').delete().or(`and(user_id.eq.${uid},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${uid})`); if (error) throw new Error(error.message); setFriendIds((prev) => { const n = new Set(prev); n.delete(friendId); return n; }); setFriends((prev) => prev.filter((f) => f.id !== friendId)); return { ok: true }; } catch (e: any) { setError(e.message); return { ok: false, error: e.message }; }
  }, [uid]);

  const searchPlayers = useCallback(async (query: string): Promise<PlayerSearchResult[]> => {
    if (!uid || !query.trim()) return []; const { data, error } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).neq('id', uid).limit(20); if (error) { setError(error.message); return []; } return (data as Profile[]).map((p) => ({ ...p, is_friend: friendIds.has(p.id), pending_sent: pendingSent.has(p.id), pending_received: pendingReceived.has(p.id) }));
  }, [uid, friendIds, pendingSent, pendingReceived]);

  return { friends, friendIds, pendingSent, pendingReceived, sendingTo, loading, error, setError, sendRequest, acceptRequest, declineRequest, removeFriend, searchPlayers, refresh: load };
}
