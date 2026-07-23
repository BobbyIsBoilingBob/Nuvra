import { useCallback, memo } from 'react'
import { Bell, Check, Gift, Trophy, ScrollText, Users, Zap } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData, invalidateCache } from '@/lib/cache'
import { getNotifications, markNotificationRead } from '@/lib/db'
import type { ScreenName, NotificationItem } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const typeIcons: Record<string, typeof Bell> = {
  reward: Gift,
  achievement: Trophy,
  quest: ScrollText,
  social: Users,
  default: Bell,
}
const typeColors: Record<string, string> = {
  reward: 'bg-accent-50 text-accent-600',
  achievement: 'bg-success-50 text-success-600',
  quest: 'bg-warning-50 text-warning-600',
  social: 'bg-brand-50 text-brand-600',
  default: 'bg-surface-100 text-ink-500',
}

function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  const Icon = typeIcons[item.type] ?? Bell
  const colorClass = typeColors[item.type] ?? typeColors.default
  return (
    <button onClick={() => onRead(item.id)} className={'w-full rounded-xl p-3 flex items-center gap-3 text-left border transition btn-press animate-fade-in ' + (item.read ? 'bg-white border-surface-200' : 'bg-brand-50 border-brand-200')}>
      <div className={'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ' + colorClass}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900">{item.title}</p>
        <p className="text-xs text-ink-400">{item.message}</p>
        <p className="text-[10px] text-ink-300 mt-0.5">{new Date(item.created_at).toLocaleString()}</p>
      </div>
      {!item.read && <div className="w-2.5 h-2.5 rounded-full bg-brand-500 flex-shrink-0" />}
      {item.read && <Check size={14} className="text-ink-300 flex-shrink-0" />}
    </button>
  )
}

function NotificationsScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const { data, loading, refresh } = useCachedData<NotificationItem[]>('notifications', getNotifications)

  const handleRead = useCallback(async (id: string) => {
    await markNotificationRead(id)
    invalidateCache('notifications')
    refresh()
    push('info', 'Marked as read', 'Notification updated')
  }, [push, refresh])

  const handleMarkAll = useCallback(async () => {
    if (!data) return
    for (const n of data) {
      if (!n.read) await markNotificationRead(n.id)
    }
    invalidateCache('notifications')
    refresh()
    push('success', 'All read', 'Notifications cleared')
  }, [data, push, refresh])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const unreadCount = (data ?? []).filter(n => !n.read).length

  return (
    <>
      <ScreenShell title="Notifications" subtitle={unreadCount > 0 ? unreadCount + ' unread' : 'All caught up'} icon={<Bell size={18} />} onBack={() => onNavigate('home')} actions={unreadCount > 0 ? [{ icon: <Check size={18} />, onClick: handleMarkAll, label: 'Mark all read' }] : undefined}>
        <div className="space-y-3">
          {loading && !data ? <SkeletonList count={4} /> : data && data.length > 0 ? (
            <div className="space-y-2">
              {data.map((n, i) => <NotificationRow key={n.id} item={n} onRead={handleRead} />)}
            </div>
          ) : (
            <EmptyState icon={<Bell size={28} />} title="No notifications" message="You're all caught up! Check back later for updates." />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="notifications" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const NotificationsScreen = memo(NotificationsScreenInner)
