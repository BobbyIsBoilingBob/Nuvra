import { useEffect } from 'react'
import { useNotificationsStore } from '../stores/notificationsStore'

export function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, fetch } = useNotificationsStore()

  useEffect(() => {
    fetch()
  }, [fetch])

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      achievement: '🏆',
      friend_request: '🤝',
      friend_accepted: '👥',
      level_up: '⭐',
      reward: '🎁',
      adventure: '🗺️',
      challenge: '🎯',
      info: 'ℹ️',
    }
    return icons[type] || '🔔'
  }

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Notifications</h1>
            <p className="text-sm text-neutral-500">{notifications.filter((n) => !n.read).length} unread</p>
          </div>
          {notifications.some((n) => !n.read) && (
            <button onClick={markAllAsRead} className="btn-secondary py-2 px-3 text-sm">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-3">
                <div className="shimmer-bg h-12 rounded-xl" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-neutral-500 font-medium mb-1">No notifications</p>
            <p className="text-sm text-neutral-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`card p-3 flex items-start gap-3 animate-fade-in cursor-pointer transition-all hover:shadow-md ${
                  !notif.read ? 'border-primary-200 bg-primary-50/30' : ''
                }`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <span className="text-2xl mt-0.5">{getIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-neutral-500 mt-0.5">{notif.message}</p>
                  )}
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id) }}
                  className="text-neutral-300 hover:text-error-500 text-sm p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
