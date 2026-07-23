import { memo, type ReactNode } from 'react'

interface Props { icon: ReactNode; title: string; message: string; actionLabel?: string; onAction?: () => void }

function EmptyStateInner({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center mb-4 text-ink-400">{icon}</div>
      <p className="text-sm font-bold text-ink-700">{title}</p>
      <p className="text-xs text-ink-400 mt-1 max-w-xs">{message}</p>
      {actionLabel && onAction && <button onClick={onAction} className="mt-4 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold btn-press hover:bg-brand-600 transition">{actionLabel}</button>}
    </div>
  )
}

export const EmptyState = memo(EmptyStateInner)
