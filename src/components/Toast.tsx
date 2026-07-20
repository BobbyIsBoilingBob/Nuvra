import { useEffect } from 'react'

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

export default function ToastContainer({ toasts, onDismiss }: Props) {
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => onDismiss(t.id), 3500))
    return () => timers.forEach(clearTimeout)
  }, [toasts, onDismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 shadow-lg border animate-slide-up ${
            t.type === 'success' ? 'bg-success-500/20 border-success-500/40 text-success-400' :
            t.type === 'error' ? 'bg-error-500/20 border-error-500/40 text-error-400' :
            t.type === 'reward' ? 'bg-accent-500/20 border-accent-500/40 text-accent-400' :
            'bg-ink-800 border-ink-700 text-ink-200'
          }`}
          onClick={() => onDismiss(t.id)}
        >
          <p className="text-sm font-semibold">{t.title}</p>
          {t.message && <p className="text-xs mt-0.5 opacity-80">{t.message}</p>}
        </div>
      ))}
    </div>
  )
}
