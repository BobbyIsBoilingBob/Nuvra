import { NAV_ITEMS } from '@/data/navigation'
import type { ScreenName } from '@/types/adventure'

interface Props {
  onNavigate: (screen: ScreenName) => void
}

export default function HomeScreen({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-ink-950 animate-fade-in">
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧭</span>
          <div>
            <h1 className="text-2xl font-bold text-ink-100">Zeviqo</h1>
            <p className="text-xs text-ink-400">Adventure System</p>
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 max-w-md mx-auto">
        <div className="bg-gradient-to-br from-brand-500/20 to-brand-700/10 rounded-2xl p-5 border border-brand-500/20 mb-5">
          <h2 className="text-lg font-bold text-ink-100 mb-1">Welcome back, Adventurer!</h2>
          <p className="text-sm text-ink-400">Level 12 · 2,450 XP · 1,820 coins</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-left transition hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
