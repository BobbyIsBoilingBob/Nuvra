import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================
// useFriends — friend system via Supabase
// Search, send/accept/decline requests, remove, block.
// ============================================================

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  level: number;
  status: 'accepted' | 'blocked';
  addedAt: number;
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

export function useFriends(playerId: string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load friends
  const loadFriends = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('nuvra_friends')
        .select('*')
        .eq('player_id', playerId);

      if (err) throw err;

      // Fetch friend profiles
      const friendIds = (data ?? []).map((f: Record<string, unknown>) => f.friend_id as string);
      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('nuvra_players')
        .select('*')
        .in('id', friendIds);

      const profileMap = new Map((profiles ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));
      setFriends(
        (data ?? []).map((f: Record<string, unknown>) => {
          const profile = profileMap.get(f.friend_id as string) as Record<string, unknown> | undefined;
          return {
            id: f.friend_id as string,
            username: (profile?.username as string) ?? 'Unknown',
            avatar: (profile?.avatar as string) ?? '🧭',
            level: (profile?.level as number) ?? 1,
            status: f.status as 'accepted' | 'blocked',
            addedAt: new Date(f.created_at as string).getTime(),
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

      // Fetch sender profiles
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

  // Search for players
  const searchPlayers = useCallback(async (query: string): Promise<Array<{ id: string; username: string; avatar: string; level: number }>> => {
    if (query.trim().length < 2) return [];
    try {
      const { data, error: err } = await supabase
        .from('nuvra_players')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', playerId)
        .limit(10);

      if (err) throw err;

      return (data ?? []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        username: p.username as string,
        avatar: p.avatar as string,
        level: p.level as number,
      }));
    } catch {
      return [];
    }
  }, [playerId]);

  // Send friend request
  const sendRequest = useCallback(async (toPlayerId: string): Promise<boolean> => {
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
          setError('Request already sent');
        } else {
          throw err;
        }
        return false;
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  // Accept friend request
  const acceptRequest = useCallback(async (requestId: string, fromId: string): Promise<void> => {
    setLoading(true);
    try {
      // Update request status
      await supabase
        .from('nuvra_friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      // Create bidirectional friendship
      await supabase.from('nuvra_friends').insert([
        { player_id: playerId, friend_id: fromId, status: 'accepted' },
        { player_id: fromId, friend_id: playerId, status: 'accepted' },
      ]);

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
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

  // Remove friend
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
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Block user
  const blockUser = useCallback(async (friendId: string): Promise<void> => {
    try {
      await supabase
        .from('nuvra_friends')
        .update({ status: 'blocked' })
        .eq('player_id', playerId)
        .eq('friend_id', friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Load on mount + subscribe to new requests
  useEffect(() => {
    loadFriends();
    loadRequests();

    const channel = supabase
      .channel(`friend_requests:${playerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nuvra_friend_requests',
        filter: `to_player_id=eq.${playerId}`,
      }, () => {
        loadRequests();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [playerId, loadFriends, loadRequests]);

  return {
    friends,
    requests,
    loading,
    error,
    searchPlayers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    blockUser,
    loadFriends,
    loadRequests,
  };
}
