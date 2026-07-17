import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, type NotificationRow } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    const rows = (data as NotificationRow[]) ?? [];
    setNotifications(rows);
    setUnreadCount(rows.filter(n => !n.read).length);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    loadNotifications();

    const channel = supabase
      .channel('notifications-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => { if (mounted) loadNotifications(); })
      .subscribe();
    channelRef.current = channel;

    return () => { mounted = false; if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [user, loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [user]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
