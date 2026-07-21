import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-3 text-ink-600">{icon}</div>
      <h3 className="text-base font-semibold text-ink-200 mb-1">{title}</h3>
      <p className="text-sm text-ink-500 mb-4">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition active:scale-95">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
