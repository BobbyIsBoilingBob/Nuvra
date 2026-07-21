import type { ReactNode } from 'react'

interface Props { icon: ReactNode; title: string; message: string; actionLabel?: string; onAction?: () => void }

export default function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <div className="text-center py-14 px-4 animate-fade-in">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-surface-200 to-surface-300 border border-white/[0.06] flex items-center justify-center text-ink-500 shadow-card">
          {icon}
        </div>
      </div>
      <h3 className="text-base font-bold text-ink-200 mb-1">{title}</h3>
      <p className="text-sm text-ink-500 mb-5 max-w-xs mx-auto leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white rounded-xl text-sm font-semibold btn-press shadow-glow-brand">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
