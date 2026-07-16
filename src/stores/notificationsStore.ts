import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Notification } from '../types'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  initialize: () => Promise<void>
  fetch: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  initialize: async () => {
    await get().fetch()
  },

  fetch: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    set({ loading: true })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      const unread = data.filter((n) => !n.read).length
      set({ notifications: data as Notification[], unreadCount: unread, loading: false })
    } else {
      set({ loading: false })
    }
  },

  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (!error) {
      const updated = get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      })
    }
  },

  markAllAsRead: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false)

    if (!error) {
      const updated = get().notifications.map((n) => ({ ...n, read: true }))
      set({ notifications: updated, unreadCount: 0 })
    }
  },

  deleteNotification: async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (!error) {
      const updated = get().notifications.filter((n) => n.id !== id)
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      })
    }
  },
}))
