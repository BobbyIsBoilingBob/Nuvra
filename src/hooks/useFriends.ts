import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { Friend, FriendRequest, Notification } from '../types';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const [fRes, rRes, nRes] = await Promise.all([
      supabase.from('friends').select('id, friend_id, status').eq('user_id', user.id),
      supabase.from('friend_requests').select('id, sender_id, receiver_id, status, created_at').eq('receiver_id', user.id).eq('status', 'pending'),
      supabase.from('notifications').select('id, type, title, message, read, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ]);

    if (fRes.error || rRes.error || nRes.error) {
      setError(fRes.error?.message ?? rRes.error?.message ?? nRes.error?.message ?? 'Failed to load');
      setLoading(false);
      return;
    }

    const friendIds = (fRes.data ?? []).map((r: any) => r.friend_id).filter(Boolean);
    let friendProfiles: any[] = [];
    if (friendIds.length > 0) {
      const { data: pRes } = await supabase.from('profiles').select('id, username, avatar_emoji, is_online').in('id', friendIds);
      friendProfiles = pRes ?? [];
    }
    setFriends(friendProfiles.map((p: any) => ({
      id: p.id, username: p.username ?? 'Unknown', avatar: p.avatar_emoji ?? undefined,
      status: p.is_online ? 'online' : 'offline',
    })));

    const senderIds = (rRes.data ?? []).map((r: any) => r.sender_id).filter(Boolean);
    let senderProfiles: any[] = [];
    if (senderIds.length > 0) {
      const { data: sRes } = await supabase.from('profiles').select('id, username').in('id', senderIds);
      senderProfiles = sRes ?? [];
    }
    setRequests((rRes.data ?? []).map((r: any) => {
      const sender = senderProfiles.find((s: any) => s.id === r.sender_id);
      return {
        id: r.id, fromUserId: r.sender_id, fromUsername: sender?.username ?? 'Unknown',
        toUserId: r.receiver_id, createdAt: r.created_at,
      };
    }));

    setNotifications((nRes.data ?? []).map((n: any) => ({
      id: n.id, title: n.title ?? 'Notification', body: n.message ?? '',
      read: n.read ?? false, createdAt: n.created_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const sendRequest = useCallback(async (toUserId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    if (toUserId === user.id) return { error: 'You cannot add yourself' };
    const { error } = await supabase.from('friend_requests').insert({
      sender_id: user.id, receiver_id: toUserId, status: 'pending',
    });
    if (error) return { error: error.message };
    await supabase.from('notifications').insert({
      user_id: toUserId, type: 'friend_request', title: 'New friend request',
      message: 'You have a new friend request.', actor_id: user.id,
    });
    return { error: null };
  }, [user]);

  const acceptRequest = useCallback(async (req: FriendRequest): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', req.id);
    if (error) return { error: error.message };
    await supabase.from('friends').insert([
      { user_id: user.id, friend_id: req.fromUserId, status: 'accepted' },
      { user_id: req.fromUserId, friend_id: user.id, status: 'accepted' },
    ]);
    await supabase.from('notifications').insert({
      user_id: req.fromUserId, type: 'friend_accepted', title: 'Friend request accepted',
      message: 'Your friend request was accepted.', actor_id: user.id,
    });
    await load();
    return { error: null };
  }, [user, load]);

  const declineRequest = useCallback(async (req: FriendRequest): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('friend_requests').update({ status: 'declined' }).eq('id', req.id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [load]);

  const removeFriend = useCallback(async (friendId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friendId);
    if (error) return { error: error.message };
    await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', user.id);
    await load();
    return { error: null };
  }, [user, load]);

  const searchPlayers = useCallback(async (query: string): Promise<{ id: string; username: string; avatar_emoji?: string }[]> => {
    if (!query.trim() || !user) return [];
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_emoji')
      .ilike('username', `%${query}%`)
      .neq('id', user.id)
      .limit(10);
    return data ?? [];
  }, [user]);

  return { friends, requests, notifications, loading, error, load, sendRequest, acceptRequest, declineRequest, removeFriend, searchPlayers };
}
