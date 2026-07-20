import ScreenShell from '@/components/ScreenShell'

export default function ProfileScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScreenShell title="Profile" icon="👤" onBack={onBack}>
      <div className="text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 mx-auto mb-3 flex items-center justify-center text-4xl">🧭</div>
        <h2 className="text-xl font-bold text-ink-100">Adventurer</h2>
        <p className="text-sm text-ink-400">Level 12 · Explorer</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-brand-400">2,450</p>
          <p className="text-xs text-ink-500 mt-1">Total XP</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-accent-400">1,820</p>
          <p className="text-xs text-ink-500 mt-1">Coins</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-ink-100">47</p>
          <p className="text-xs text-ink-500 mt-1">Adventures</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
          <h3 className="text-sm font-semibold text-ink-200 mb-2">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {['🥇', '🥈', '🥉', '🌟', '🎯', '🏃', '📸'].map((a, i) => (
              <span key={i} className="text-2xl">{a}</span>
            ))}
          </div>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
          <h3 className="text-sm font-semibold text-ink-200 mb-2">Recent Activity</h3>
          <p className="text-sm text-ink-400">No recent adventures. Generate one to get started!</p>
        </div>
      </div>
    </ScreenShell>
  )
}
