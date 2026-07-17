import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================
// useFriends — complete friend system via Supabase
// Search, send/accept/decline/cancel requests, remove, block.
// Tracks outgoing requests and friend online status.
// ============================================================

export type FriendStatus = 'accepted' | 'blocked';
export type PlayerOnlineStatus = 'online' | 'offline' | 'walking' | 'in_adventure';

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  level: number;
  status: FriendStatus;
  addedAt: number;
  onlineStatus: PlayerOnlineStatus;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromUsername: string;
  fromAvatar: string;
  fromLevel: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export interface OutgoingRequest {
  id: string;
  toId: string;
  toUsername: string;
  toAvatar: string;
  toLevel: number;
  createdAt: number;
}

export interface SearchResult {
  id: string;
  username: string;
  avatar: string;
  level: number;
  isFriend: boolean;
  hasOutgoingRequest: boolean;
}

export function useFriends(playerId: string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const friendIdsRef = useRef<Set<string>>(new Set());
  const outgoingIdsRef = useRef<Set<string>>(new Set());

  // Load friends with their online status
  const loadFriends = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('nuvra_friends')
        .select('*')
        .eq('player_id', playerId)
        .eq('status', 'accepted');

      if (err) throw err;

      const friendIds = (data ?? []).map((f: Record<string, unknown>) => f.friend_id as string);
      friendIdsRef.current = new Set(friendIds);
      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const [profilesRes, statusRes] = await Promise.all([
        supabase.from('nuvra_players').select('*').in('id', friendIds),
        supabase.from('nuvra_player_status').select('*').in('player_id', friendIds),
      ]);

      const profileMap = new Map((profilesRes.data ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));
      const statusMap = new Map((statusRes.data ?? []).map((s: Record<string, unknown>) => [s.player_id as string, s.status as string]));

      setFriends(
        (data ?? []).map((f: Record<string, unknown>) => {
          const profile = profileMap.get(f.friend_id as string) as Record<string, unknown> | undefined;
          return {
            id: f.friend_id as string,
            username: (profile?.username as string) ?? 'Unknown',
            avatar: (profile?.avatar as string) ?? '🧭',
            level: (profile?.level as number) ?? 1,
            status: f.status as FriendStatus,
            addedAt: new Date(f.created_at as string).getTime(),
            onlineStatus: (statusMap.get(f.friend_id as string) as PlayerOnlineStatus) ?? 'offline',
          };
        }),
      );
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Load incoming requests
  const loadRequests = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('nuvra_friend_requests')
        .select('*')
        .eq('to_player_id', playerId)
        .eq('status', 'pending');

      if (err) throw err;
      if (!data || data.length === 0) {
        setRequests([]);
        return;
      }

      const senderIds = data.map((r: Record<string, unknown>) => r.from_player_id as string);
      const { data: profiles } = await supabase
        .from('nuvra_players')
        .select('*')
        .in('id', senderIds);

      const profileMap = new Map((profiles ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));
      setRequests(
        data.map((r: Record<string, unknown>) => {
          const profile = profileMap.get(r.from_player_id as string) as Record<string, unknown> | undefined;
          return {
            id: r.id as string,
            fromId: r.from_player_id as string,
            fromUsername: (profile?.username as string) ?? 'Unknown',
            fromAvatar: (profile?.avatar as string) ?? '🧭',
            fromLevel: (profile?.level as number) ?? 1,
            status: r.status as 'pending' | 'accepted' | 'declined',
            createdAt: new Date(r.created_at as string).getTime(),
          };
        }),
      );
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Load outgoing requests
  const loadOutgoing = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('nuvra_friend_requests')
        .select('*')
        .eq('from_player_id', playerId)
        .eq('status', 'pending');

      if (err) throw err;
      if (!data || data.length === 0) {
        setOutgoing([]);
        outgoingIdsRef.current = new Set();
        return;
      }

      const toIds = data.map((r: Record<string, unknown>) => r.to_player_id as string);
      outgoingIdsRef.current = new Set(toIds);

      const { data: profiles } = await supabase
        .from('nuvra_players')
        .select('*')
        .in('id', toIds);

      const profileMap = new Map((profiles ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));
      setOutgoing(
        data.map((r: Record<string, unknown>) => {
          const profile = profileMap.get(r.to_player_id as string) as Record<string, unknown> | undefined;
          return {
            id: r.id as string,
            toId: r.to_player_id as string,
            toUsername: (profile?.username as string) ?? 'Unknown',
            toAvatar: (profile?.avatar as string) ?? '🧭',
            toLevel: (profile?.level as number) ?? 1,
            createdAt: new Date(r.created_at as string).getTime(),
          };
        }),
      );
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Search for players by username
  const searchPlayers = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (query.trim().length < 2) return [];
    try {
      const { data, error: err } = await supabase
        .from('nuvra_players')
        .select('*')
        .ilike('username', `%${query.trim()}%`)
        .neq('id', playerId)
        .limit(10);

      if (err) throw err;

      return (data ?? []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        username: p.username as string,
        avatar: p.avatar as string,
        level: p.level as number,
        isFriend: friendIdsRef.current.has(p.id as string),
        hasOutgoingRequest: outgoingIdsRef.current.has(p.id as string),
      }));
    } catch {
      return [];
    }
  }, [playerId]);

  // Send friend request — prevents self-add, duplicates, and existing friends
  const sendRequest = useCallback(async (toPlayerId: string): Promise<{ success: boolean; message: string }> => {
    if (toPlayerId === playerId) {
      return { success: false, message: "You can't send a friend request to yourself." };
    }
    if (friendIdsRef.current.has(toPlayerId)) {
      return { success: false, message: 'You are already friends with this player.' };
    }
    if (outgoingIdsRef.current.has(toPlayerId)) {
      return { success: false, message: 'You already have a pending request to this player.' };
    }

    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('nuvra_friend_requests')
        .insert({
          from_player_id: playerId,
          to_player_id: toPlayerId,
          status: 'pending',
        });

      if (err) {
        if (err.code === '23505') {
          return { success: false, message: 'A request already exists between you and this player.' };
        }
        throw err;
      }

      // Create a notification for the recipient
      await supabase.from('nuvra_notifications').insert({
        player_id: toPlayerId,
        type: 'friend_request',
        title: 'New friend request',
        message: 'sent you a friend request',
        from_player_id: playerId,
      });

      outgoingIdsRef.current.add(toPlayerId);
      await loadOutgoing();
      return { success: true, message: 'Friend request sent!' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send request';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [playerId, loadOutgoing]);

  // Accept friend request
  const acceptRequest = useCallback(async (requestId: string, fromId: string): Promise<void> => {
    setLoading(true);
    try {
      await supabase
        .from('nuvra_friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      await supabase.from('nuvra_friends').insert([
        { player_id: playerId, friend_id: fromId, status: 'accepted' },
        { player_id: fromId, friend_id: playerId, status: 'accepted' },
      ]);

      // Notify the sender that their request was accepted
      await supabase.from('nuvra_notifications').insert({
        player_id: fromId,
        type: 'friend_accepted',
        title: 'Friend request accepted',
        message: 'accepted your friend request',
        from_player_id: playerId,
      });

      // Log activity
      await supabase.from('nuvra_activity_log').insert({
        player_id: playerId,
        username: 'You',
        activity_type: 'friend_added',
        description: 'added a new friend',
      });

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      friendIdsRef.current.add(fromId);
      await loadFriends();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  }, [playerId, loadFriends]);

  // Decline friend request
  const declineRequest = useCallback(async (requestId: string): Promise<void> => {
    try {
      await supabase
        .from('nuvra_friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {
      // Best-effort
    }
  }, []);

  // Cancel outgoing friend request
  const cancelRequest = useCallback(async (requestId: string, toId: string): Promise<void> => {
    try {
      await supabase
        .from('nuvra_friend_requests')
        .delete()
        .eq('id', requestId);
      outgoingIdsRef.current.delete(toId);
      setOutgoing((prev) => prev.filter((r) => r.id !== requestId));
    } catch {
      // Best-effort
    }
  }, []);

  // Remove friend (bidirectional)
  const removeFriend = useCallback(async (friendId: string): Promise<void> => {
    try {
      await supabase
        .from('nuvra_friends')
        .delete()
        .eq('player_id', playerId)
        .eq('friend_id', friendId);
      await supabase
        .from('nuvra_friends')
        .delete()
        .eq('player_id', friendId)
        .eq('friend_id', playerId);
      friendIdsRef.current.delete(friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Block user — removes friendship and marks as blocked
  const blockUser = useCallback(async (friendId: string): Promise<void> => {
    try {
      // Upsert our side as blocked
      await supabase
        .from('nuvra_friends')
        .upsert({
          player_id: playerId,
          friend_id: friendId,
          status: 'blocked',
        }, { onConflict: 'player_id,friend_id' });

      // Remove the reverse friendship
      await supabase
        .from('nuvra_friends')
        .delete()
        .eq('player_id', friendId)
        .eq('friend_id', playerId);

      friendIdsRef.current.delete(friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Load on mount + subscribe to new requests and status changes
  useEffect(() => {
    loadFriends();
    loadRequests();
    loadOutgoing();

    const reqChannel = supabase
      .channel(`friend_requests:${playerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nuvra_friend_requests',
        filter: `to_player_id=eq.${playerId}`,
      }, () => {
        loadRequests();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'nuvra_friend_requests',
        filter: `from_player_id=eq.${playerId}`,
      }, () => {
        loadOutgoing();
      })
      .subscribe();

    // Subscribe to friend status changes
    const statusChannel = supabase
      .channel(`friend_status:${playerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nuvra_player_status',
      }, () => {
        loadFriends();
      })
      .subscribe();

    return () => {
      reqChannel.unsubscribe();
      statusChannel.unsubscribe();
    };
  }, [playerId, loadFriends, loadRequests, loadOutgoing]);

  return {
    friends,
    requests,
    outgoing,
    loading,
    error,
    searchPlayers,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    removeFriend,
    blockUser,
    loadFriends,
    loadRequests,
    loadOutgoing,
  };
}
