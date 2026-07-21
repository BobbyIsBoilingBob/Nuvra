import { useEffect, useState } from 'react'
import { Check, X, Info, Sparkles } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'reward'
export interface ToastData { id: string; type: ToastType; title: string; message?: string }

const icons = { success: Check, error: X, info: Info, reward: Sparkles }
const styles: Record<ToastType, string> = {
  success: 'from-success-500/20 to-success-600/10 border-success-500/40 text-success-400',
  error: 'from-error-500/20 to-error-600/10 border-error-500/40 text-error-400',
  reward: 'from-accent-500/20 to-accent-600/10 border-accent-500/40 text-accent-400',
  info: 'from-surface-300/80 to-surface-400/60 border-white/10 text-ink-200',
}

let counter = 0
export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const push = (type: ToastType, title: string, message?: string) => {
    const id = `t${++counter}`
    setToasts(prev => [...prev, { id, type, title, message }])
  }
  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))
  return { toasts, push, dismiss }
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
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
          <div key={t.id} className={`pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3.5 shadow-2xl border bg-gradient-to-br backdrop-blur-xl animate-slide-up flex items-start gap-3 ${styles[t.type]}`} onClick={() => onDismiss(t.id)}>
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
