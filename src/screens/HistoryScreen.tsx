import ScreenShell from '@/components/ScreenShell'

export default function HistoryScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScreenShell title="History" icon="📊" onBack={onBack}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-brand-400">47</p>
          <p className="text-xs text-ink-500 mt-1">Total Adventures</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-accent-400">186</p>
          <p className="text-xs text-ink-500 mt-1">Challenges Done</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-ink-100">142km</p>
          <p className="text-xs text-ink-500 mt-1">Distance Walked</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
          <p className="text-3xl font-bold text-ink-100">18h</p>
          <p className="text-xs text-ink-500 mt-1">Time Spent</p>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-ink-300 mb-2">Recent Adventures</h3>
      <p className="text-sm text-ink-500">No adventures yet. Generate one to start your history!</p>
    </ScreenShell>
  )
}
