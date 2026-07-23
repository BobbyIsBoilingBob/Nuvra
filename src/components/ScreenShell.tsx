import { memo, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

interface Action { icon: ReactNode; onClick: () => void; label?: string }
interface Props { title: string; subtitle?: string; icon?: ReactNode; onBack?: () => void; children: ReactNode; actions?: Action[] }

function ScreenShellInner({ title, subtitle, icon, onBack, children, actions }: Props) {
  return (
    <div className="min-h-screen bg-surface-0 animate-slide-up">
      <header className="sticky top-0 z-30 glass safe-top">
        <div className="px-4 py-3 flex items-center gap-3 max-w-md mx-auto">
          {onBack && <button onClick={onBack} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-surface-300 text-ink-700 hover:bg-surface-50 btn-press" aria-label="Go back"><ArrowLeft size={18} /></button>}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-ink-900 flex items-center gap-2.5">
              {icon && <span className="text-brand-500 flex-shrink-0">{icon}</span>}
              <span className="truncate">{title}</span>
            </h1>
            {subtitle && <p className="text-xs text-ink-400 truncate">{subtitle}</p>}
          </div>
          {actions?.map((a, i) => <button key={i} onClick={a.onClick} aria-label={a.label} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-surface-300 text-ink-700 hover:bg-surface-50 btn-press">{a.icon}</button>)}
        </div>
      </header>
      <main className="px-4 py-5 pb-24 max-w-md mx-auto">{children}</main>
    </div>
  )
}

export const ScreenShell = memo(ScreenShellInner)
