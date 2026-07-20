import ScreenShell from '@/components/ScreenShell'
import { useAuth } from '@/lib/auth'

interface Props { onBack: () => void }

const SHOP_ITEMS = [
  { name: 'XP Boost Pack', price: 100, icon: '⚡', desc: 'Double XP for your next 3 adventures' },
  { name: 'Premium Avatar Pack', price: 300, icon: '🎨', desc: 'Unlock exclusive avatar emojis' },
  { name: 'Exclusive Trail Maps', price: 500, icon: '🗺', desc: 'Access curated trail routes' },
  { name: 'Coin Doubler', price: 200, icon: '🪙', desc: 'Double coins for 24 hours' },
  { name: 'Season Pass', price: 1000, icon: '🎟', desc: 'Unlock all seasonal rewards' },
  { name: 'Custom Themes', price: 150, icon: '🎭', desc: 'Personalise your app theme' },
]

export default function ShopScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const coins = profile?.coins ?? 0

  return (
    <ScreenShell title="Shop" icon="🛒" onBack={onBack}>
      <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 mb-4 flex items-center justify-between">
        <span className="text-sm text-ink-300">Your Balance</span>
        <span className="text-lg font-bold text-accent-400">🪙 {coins.toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SHOP_ITEMS.map((item, i) => {
          const canAfford = coins >= item.price
          return (
            <div key={i} className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-ink-200 mb-1">{item.name}</p>
              <p className="text-xs text-ink-500 mb-2">{item.desc}</p>
              <p className="text-sm text-accent-400 font-bold mb-2">🪙 {item.price}</p>
              <button
                disabled={!canAfford}
                className={`w-full py-1.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                  canAfford ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-ink-800 text-ink-600 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Buy' : 'Not enough'}
              </button>
            </div>
          )
        })}
      </div>
    </ScreenShell>
  )
}
