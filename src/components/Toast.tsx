import { useEffect, useCallback } from 'react'
import { Check, X, Info, Sparkles } from 'lucide-react'

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'info' | 'reward'
  title: string
  message?: string
}

interface Props {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

const icons = { success: Check, error: X, info: Info, reward: Sparkles }
const styles = {
  success: 'bg-success-500/15 border-success-500/40 text-success-400',
  error: 'bg-error-500/15 border-error-500/40 text-error-400',
  reward: 'bg-accent-500/15 border-accent-500/40 text-accent-400',
  info: 'bg-ink-800 border-ink-700 text-ink-200',
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
  const dismiss = useCallback(onDismiss, [onDismiss])

  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => dismiss(t.id), 3500))
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none safe-top">
      {toasts.map(t => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={`pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3 shadow-xl border backdrop-blur-md animate-slide-up flex items-start gap-3 ${styles[t.type]}`}
            onClick={() => dismiss(t.id)}
          >
            <Icon size={18} className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.message && <p className="text-xs mt-0.5 opacity-80">{t.message}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
