import ScreenShell from '@/components/ScreenShell'

export default function SeasonalScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScreenShell title="Seasonal" icon="🍂" onBack={onBack}>
      <div className="bg-gradient-to-br from-orange-500/20 to-accent-500/10 rounded-xl p-6 border border-orange-500/30 text-center mb-4">
        <div className="text-5xl mb-3">🍂</div>
        <h2 className="text-lg font-bold text-ink-100 mb-1">Autumn Season</h2>
        <p className="text-sm text-ink-400 mb-4">Limited-time autumn-themed adventures and challenges.</p>
        <p className="text-xs text-accent-400">Ends in 14 days</p>
      </div>
      <div className="space-y-3">
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
          <h3 className="text-sm font-semibold text-ink-200 mb-1">🍂 Leaf Collector</h3>
          <p className="text-xs text-ink-400 mb-2">Collect 10 different autumn leaves</p>
          <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
            <div className="h-full bg-accent-500 rounded-full" style={{ width: '40%' }} />
          </div>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
          <h3 className="text-sm font-semibold text-ink-200 mb-1">🌅 Golden Hour Walk</h3>
          <p className="text-xs text-ink-400 mb-2">Complete a walk during sunrise or sunset</p>
          <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
            <div className="h-full bg-accent-500 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
