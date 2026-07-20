import ScreenShell from '@/components/ScreenShell'

export default function RewardsScreen({ onBack }: { onBack: () => void }) {
  const rewards = [
    { title: 'Free Avatar Item', cost: 500, icon: '👕' },
    { title: 'XP Boost (2x, 1hr)', cost: 300, icon: '⚡' },
    { title: 'Coin Doubler', cost: 400, icon: '🪙' },
    { title: 'Exclusive Trail Map', cost: 1000, icon: '🗺' },
    { title: 'Premium Badge', cost: 750, icon: '🏅' },
    { title: 'Custom Profile Theme', cost: 600, icon: '🎨' },
  ]
  return (
    <ScreenShell title="Rewards" icon="🎁" onBack={onBack}>
      <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 mb-4 flex items-center justify-between">
        <span className="text-sm text-ink-300">Your Coins</span>
        <span className="text-lg font-bold text-accent-400">🪙 1,820</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((r, i) => (
          <div key={i} className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
            <div className="text-3xl mb-2">{r.icon}</div>
            <p className="text-sm font-semibold text-ink-200 mb-1">{r.title}</p>
            <p className="text-xs text-accent-400 mb-2">🪙 {r.cost}</p>
            <button className="w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition">Redeem</button>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
