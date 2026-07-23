import { useEffect, useState } from 'react'
import { Bell, Check, Gift, Users, Trophy, ScrollText, BellOff } from 'lucide-react'
import { getNotifications, markNotificationRead } from '@/lib/db'
import type { NotificationItem } from '@/types/adventure'
import { useToasts, ToastContainer } from '@/components/Toast'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }
const typeIcons: Record<string, typeof Bell> = { reward: Gift, social: Users, achievement: Trophy, quest: ScrollText }
const typeColors: Record<string, string> = { reward: 'bg-accent-100 text-accent-600', social: 'bg-brand-100 text-brand-600', achievement: 'bg-ink-100 text-ink-600', quest: 'bg-warning-100 text-warning-600' }
export default function NotificationsScreen({ onNavigate }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toasts, push, dismiss } = useToasts()
  useEffect(() => { (async () => { const n = await getNotifications(); setNotifications(n || []); setLoading(false) })() }, [])
  const handleRead = async (id: string) => { await markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)) }
  const handleReadAll = async () => { for (const n of notifications.filter(n => !n.read)) await markNotificationRead(n.id); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); push('success', 'All notifications read') }
  return (
    <>
      <ScreenShell title="Notifications" subtitle="Stay up to date" onBack={() => onNavigate('home')} actions={notifications.some(n => !n.read) ? [{ icon: <Check size={18} />, onClick: handleReadAll, label: 'Mark all read' }] : undefined}>
        {loading ? <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div> : notifications.length === 0 ? <EmptyState icon={<BellOff size={32} />} title="No notifications" message="You're all caught up!" /> : (
          <div className="space-y-2.5">{notifications.map((n, i) => { const Icon = typeIcons[n.type] || Bell; return (
            <button key={n.id} onClick={() => handleRead(n.id)} className={'w-full text-left rounded-xl p-3.5 flex items-start gap-3 border shadow-card stagger transition ' + (n.read ? 'bg-white border-surface-200' : 'bg-brand-50/50 border-brand-200')} style={{ animationDelay: i * 40 + 'ms' }}>
              <div className={'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ' + (typeColors[n.type] || 'bg-surface-100 text-ink-500')}><Icon size={18} /></div>
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="text-sm font-bold text-ink-900">{n.title}</p>{!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}</div><p className="text-xs text-ink-400 mt-0.5">{n.message}</p><p className="text-xs text-ink-300 mt-1">{new Date(n.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
            </button>
          )})}</div>
        )}
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
