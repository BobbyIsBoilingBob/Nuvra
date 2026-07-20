import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/db'
import type { NotificationItem } from '@/types/adventure'

interface Props { onBack: () => void }

export default function NotificationsScreen({ onBack }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifs = () => {
    setLoading(true)
    getNotifications().then(data => {
      setNotifications(data)
      setLoading(false)
    })
  }

  useEffect(() => { loadNotifs() }, [])

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    loadNotifs()
  }

  const handleReadAll = async () => {
    await markAllNotificationsRead()
    loadNotifs()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <ScreenShell
      title="Notifications"
      icon="🔔"
      onBack={onBack}
      headerRight={unreadCount > 0 ? (
        <button onClick={handleReadAll} className="text-xs text-brand-400 hover:text-brand-300 transition active:scale-95">
          Mark all read
        </button>
      ) : undefined}
    >
      {loading ? <LoadingSpinner label="Loading notifications..." /> :
       notifications.length === 0 ? <EmptyState icon="🔔" title="No Notifications" message="You're all caught up!" /> :
       <div className="space-y-2">
         {notifications.map(n => (
           <div
             key={n.id}
             onClick={() => !n.read && handleRead(n.id)}
             className={`rounded-xl p-4 border cursor-pointer transition active:scale-95 ${
               n.read ? 'bg-ink-900 border-ink-800' : 'bg-brand-500/10 border-brand-500/30'
             }`}
           >
             <div className="flex items-start gap-2">
               {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
               <div className="flex-1">
                 <p className="text-sm font-semibold text-ink-200">{n.title}</p>
                 {n.message && <p className="text-xs text-ink-400 mt-0.5">{n.message}</p>}
                 <p className="text-xs text-ink-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
               </div>
             </div>
           </div>
         ))}
       </div>
      }
    </ScreenShell>
  )
}
