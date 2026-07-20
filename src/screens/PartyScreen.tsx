import ScreenShell from '@/components/ScreenShell'

export default function PartyScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScreenShell title="Party" icon="🎉" onBack={onBack}>
      <div className="bg-ink-900 rounded-xl p-6 border border-ink-800 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-lg font-bold text-ink-100 mb-2">Adventure Parties</h2>
        <p className="text-sm text-ink-400 mb-4">Team up with friends for group adventures and shared challenges.</p>
        <button className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition">Create Party</button>
        <button className="w-full py-3 mt-2 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-xl font-semibold text-sm transition border border-ink-700">Join Party</button>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Active Parties</h3>
        <p className="text-sm text-ink-500">No active parties. Create one to start!</p>
      </div>
    </ScreenShell>
  )
}
