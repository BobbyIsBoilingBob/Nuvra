import { useEffect, useState, useCallback } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/db'
import type { NotificationItem } from '@/types/adventure'

interface Props {
  onBack: () => void
}

export default function NotificationsScreen({ onBack }: Props) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const n = await getNotifications()
    setItems(n); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <ScreenShell title="Notifications" icon={<Bell size={18} />} onBack={onBack}
      headerRight={
        items.some(n => !n.read) ? (
          <button onClick={handleMarkAll} className="text-brand-400 hover:text-brand-300 transition active:scale-90 p-1">
            <CheckCheck size={18} />
          </button>
        ) : null
      }
    >
      {loading ? <LoadingSpinner label="Loading notifications..." /> : items.length === 0 ? (
        <EmptyState icon={<Bell size={40} />} title="No notifications" message="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <button
              key={n.id} onClick={() => !n.read && handleMarkRead(n.id)}
              className={`w-full text-left rounded-xl p-3.5 border transition active:scale-[0.98] animate-fade-in ${n.read ? 'bg-ink-900 border-ink-800' : 'bg-brand-500/10 border-brand-500/30'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-ink-800' : 'bg-brand-500/20'}`}>
                  <Bell size={18} className={n.read ? 'text-ink-500' : 'text-brand-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-100 truncate">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-ink-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
