import { useEffect, useState, useCallback } from 'react';
import { supabase, type NotificationRow } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (data) {
      setNotifications(data as NotificationRow[]);
      setUnreadCount((data as NotificationRow[]).filter(n => !n.read).length);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    load().finally(() => setLoading(false));
    const channel = supabase.channel('notifications-realtime');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    load();
  }, [user, load]);

  return { notifications, unreadCount, loading, markRead, markAllRead, reload: load };
}
