import { useEffect, useState, useCallback, memo } from 'react'
import { Check, X, Info, Sparkles } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'reward'
export interface ToastData { id: string; type: ToastType; title: string; message?: string }

const icons = { success: Check, error: X, info: Info, reward: Sparkles }
const styles: Record<ToastType, string> = {
  success: 'from-success-50 to-success-100 border-success-400 text-success-700',
  error: 'from-error-50 to-error-100 border-error-400 text-error-700',
  reward: 'from-accent-50 to-accent-100 border-accent-400 text-accent-700',
  info: 'from-surface-50 to-surface-100 border-surface-400 text-ink-700',
}

let counter = 0
export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const push = useCallback((type: ToastType, title: string, message?: string) => { const id = 't' + (++counter); setToasts(prev => [...prev, { id, type, title, message }]) }, [])
  const dismiss = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  return { toasts, push, dismiss }
}

function ToastContainerInner({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => onDismiss(t.id), 3500))
    return () => timers.forEach(clearTimeout)
  }, [toasts, onDismiss])
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none safe-top">
      {toasts.map(t => {
        const Icon = icons[t.type]
        return (
          <div key={t.id} className={'pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3.5 shadow-card-hover border bg-gradient-to-br animate-slide-up flex items-start gap-3 ' + styles[t.type]} onClick={() => onDismiss(t.id)}>
            <Icon size={18} className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0"><p className="text-sm font-semibold">{t.title}</p>{t.message && <p className="text-xs mt-0.5 opacity-80">{t.message}</p>}</div>
          </div>
        )
      })}
    </div>
  )
}

export const ToastContainer = memo(ToastContainerInner)
