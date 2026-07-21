import { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { getNotifications, markNotificationRead } from '@/lib/db'
import type { NotificationItem } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const n = await getNotifications()
      setNotifs(n || []); setLoading(false)
    })()
  }, [])

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <ScreenShell title="Notifications" subtitle="Your updates">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : notifs.length === 0 ? (
        <EmptyState icon={<Bell size={32} />} title="No notifications" message="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <button key={n.id} onClick={() => handleRead(n.id)} className={`w-full text-left rounded-xl p-3.5 flex items-start gap-3 btn-press stagger ${n.read ? 'bg-surface-100 border border-white/[0.04]' : 'bg-gradient-to-r from-brand-500/10 to-transparent border border-brand-500/20'}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-ink-600' : 'bg-brand-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-100">{n.title}</p>
                <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-ink-500 mt-1.5">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read && <Check size={14} className="text-ink-500 mt-1" />}
            </button>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
