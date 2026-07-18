import { useState, useEffect, useCallback } from 'react';
import { supabase, type NotificationRow } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const uid = session.user.id;

    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50);
      setNotifications((data as NotificationRow[]) ?? []);
      setUnreadCount((data as NotificationRow[])?.filter((n) => !n.read).length ?? 0);
      setLoading(false);
    };
    load();

    const sub = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as NotificationRow, ...prev]);
            setUnreadCount((c) => c + 1);
          }
        })
      .subscribe();

    return () => { sub.unsubscribe(); };
  }, [session]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!session?.user?.id) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [session]);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
