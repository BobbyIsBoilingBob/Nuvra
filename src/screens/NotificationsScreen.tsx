import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { getNotifications, markNotificationRead } from '@/lib/db'
import type { NotificationItem } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => { const n = await getNotifications(); setItems(n || []); setLoading(false) })() }, [])

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <ScreenShell title="Notifications" subtitle="Recent activity">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : items.length === 0 ? <EmptyState icon={<BellOff size={32} />} title="No notifications" message="You're all caught up!" /> : (
        <div className="space-y-2">
          {items.map((n, i) => (
            <button key={n.id} onClick={() => !n.read && handleRead(n.id)} className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border stagger ${n.read ? 'bg-surface-100 border-white/[0.04]' : 'bg-brand-500/5 border-brand-500/20'}`} style={{ animationDelay: `${i * 30}ms` }}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-surface-200' : 'bg-brand-500/20'}`}><Bell size={14} className={n.read ? 'text-ink-600' : 'text-brand-400'} /></div>
              <div className="flex-1 min-w-0"><p className={`text-sm font-semibold ${n.read ? 'text-ink-400' : 'text-ink-100'}`}>{n.title}</p><p className="text-xs text-ink-500">{n.message}</p><p className="text-xs text-ink-600 mt-1">{new Date(n.created_at).toLocaleDateString()}</p></div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
