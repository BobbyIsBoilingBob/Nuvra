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

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const [fRes, rRes, nRes] = await Promise.all([
      supabase.from('friends').select('*, friend:profiles!friends_friend_id_fkey(id,username,avatar)').eq('user_id', user.id),
      supabase.from('friend_requests').select('*, from_user:profiles!friend_requests_from_user_id_fkey(id,username)').eq('to_user_id', user.id).eq('status', 'pending'),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ]);
    if (fRes.data) {
      setFriends(fRes.data.map((r: any) => ({
        id: r.friend?.id ?? r.friend_id,
        username: r.friend?.username ?? 'Unknown',
        avatar: r.friend?.avatar ?? undefined,
        status: 'offline',
      })));
    }
    if (rRes.data) {
      setRequests(rRes.data.map((r: any) => ({
        id: r.id,
        fromUserId: r.from_user_id,
        fromUsername: r.from_user?.username ?? 'Unknown',
        toUserId: r.to_user_id,
        createdAt: r.created_at,
      })));
    }
    if (nRes.data) {
      setNotifications(nRes.data.map((n: any) => ({
        id: n.id,
        title: n.title ?? 'Notification',
        body: n.body ?? '',
        read: n.read ?? false,
        createdAt: n.created_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const sendRequest = useCallback(async (toUserId: string) => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase.from('friend_requests').insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      status: 'pending',
    });
    if (!error) {
      await supabase.from('notifications').insert({
        user_id: toUserId,
        title: 'New friend request',
        body: 'You have a new friend request.',
      });
    }
    return { error: error?.message ?? null };
  }, [user]);

  const acceptRequest = useCallback(async (req: FriendRequest) => {
    if (!user) return;
    await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', req.id);
    await supabase.from('friends').insert([
      { user_id: user.id, friend_id: req.fromUserId },
      { user_id: req.fromUserId, friend_id: user.id },
    ]);
    await supabase.from('notifications').insert({
      user_id: req.fromUserId,
      title: 'Friend request accepted',
      body: 'Your friend request was accepted.',
    });
    load();
  }, [user, load]);

  const declineRequest = useCallback(async (req: FriendRequest) => {
    await supabase.from('friend_requests').update({ status: 'declined' }).eq('id', req.id);
    load();
  }, [load]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!user) return;
    await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friendId);
    await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', user.id);
    load();
  }, [user, load]);

  const searchPlayers = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar')
      .ilike('username', `%${query}%`)
      .limit(10);
    return (data ?? []).filter((p: any) => p.id !== user?.id);
  }, [user]);

  return { friends, requests, notifications, loading, load, sendRequest, acceptRequest, declineRequest, removeFriend, searchPlayers };
}
