import type { ReactNode } from 'react'

interface Props {
  title: string
  icon: string
  onBack: () => void
  children: ReactNode
}

export default function ScreenShell({ title, icon, onBack, children }: Props) {
  return (
    <div className="min-h-screen bg-ink-950 animate-fade-in">
      <header className="sticky top-0 z-20 bg-ink-900/90 backdrop-blur-md border-b border-ink-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-ink-400 hover:text-ink-100 transition flex items-center gap-1 text-sm">
          <span className="text-lg">←</span> Back
        </button>
        <h1 className="text-base font-semibold text-ink-100 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h1>
      </header>
      <main className="px-4 py-5 pb-24 max-w-md mx-auto">
        {children}
      </main>
    </div>
  )
}
