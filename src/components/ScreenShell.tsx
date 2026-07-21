import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  icon: ReactNode
  onBack: () => void
  children: ReactNode
  headerRight?: ReactNode
}

export default function ScreenShell({ title, icon, onBack, children, headerRight }: Props) {
  return (
    <div className="min-h-screen bg-ink-950 animate-slide-up">
      <header className="sticky top-0 z-30 bg-ink-900/95 backdrop-blur-lg border-b border-ink-800/80 safe-top">
        <div className="px-4 py-3 flex items-center gap-3 max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-ink-400 hover:text-ink-100 transition active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-semibold text-ink-100 flex items-center gap-2 flex-1 min-w-0">
            <span className="text-brand-400 flex-shrink-0">{icon}</span>
            <span className="truncate">{title}</span>
          </h1>
          {headerRight}
        </div>
      </header>
      <main className="px-4 py-5 pb-24 max-w-md mx-auto">
        {children}
      </main>
    </div>
  )
}
