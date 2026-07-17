import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================
// useNotifications — real-time notifications via Supabase
// Friend requests, accepted requests, party invites/joins/leaves.
// ============================================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  fromPlayerId: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  createdAt: number;
}

export function useNotifications(playerId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('nuvra_notifications')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      const mapped = (data ?? []).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        type: n.type as string,
        title: n.title as string,
        message: (n.message as string) ?? '',
        fromPlayerId: (n.from_player_id as string) ?? null,
        metadata: (n.metadata as Record<string, unknown>) ?? {},
        read: n.read as boolean,
        createdAt: new Date(n.created_at as string).getTime(),
      }));

      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => !n.read).length);
    } catch {
      // Best-effort
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('nuvra_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Best-effort
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await supabase
        .from('nuvra_notifications')
        .update({ read: true })
        .eq('player_id', playerId)
        .eq('read', false);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Best-effort
    }
  }, [playerId]);

  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('nuvra_notifications')
        .delete()
        .eq('id', notificationId);
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== notificationId);
        setUnreadCount(filtered.filter((n) => !n.read).length);
        return filtered;
      });
    } catch {
      // Best-effort
    }
  }, []);

  // Subscribe to new notifications
  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel(`notifications:${playerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nuvra_notifications',
        filter: `player_id=eq.${playerId}`,
      }, (payload) => {
        const data = payload.new as Record<string, unknown>;
        const notif: Notification = {
          id: data.id as string,
          type: data.type as string,
          title: data.title as string,
          message: (data.message as string) ?? '',
          fromPlayerId: (data.from_player_id as string) ?? null,
          metadata: (data.metadata as Record<string, unknown>) ?? {},
          read: false,
          createdAt: Date.now(),
        };
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [playerId, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    loadNotifications,
  };
}
