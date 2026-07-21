import { ShoppingBag, Coins, Gem, Check, Lock } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import { useAuth } from '@/lib/auth'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

const SHOP_ITEMS = [
  { id: 'boost_xp', name: 'XP Boost (1 hr)', cost: 100, currency: 'coins' as const },
  { id: 'boost_coin', name: 'Coin Boost (1 hr)', cost: 150, currency: 'coins' as const },
  { id: 'skin_map', name: 'Map Theme: Forest', cost: 300, currency: 'coins' as const },
  { id: 'gem_pack', name: 'Gem Pack (10)', cost: 5, currency: 'gems' as const },
  { id: 'avatar_frame', name: 'Avatar Frame: Gold', cost: 500, currency: 'coins' as const },
  { id: 'premium_month', name: 'Premium (1 month)', cost: 20, currency: 'gems' as const },
]

export default function ShopScreen({ onBack, onToast }: Props) {
  const { profile } = useAuth()
  const coins = profile?.coins ?? 0
  const gems = profile?.gems ?? 0

  const handleBuy = (item: typeof SHOP_ITEMS[number]) => {
    const balance = item.currency === 'gems' ? gems : coins
    if (balance < item.cost) {
      onToast('error', 'Not enough ' + item.currency, `Need ${item.cost - balance} more ${item.currency}`)
      return
    }
    onToast('success', 'Purchase complete!', `${item.name} added to inventory`)
  }

  return (
    <ScreenShell title="Shop" icon={<ShoppingBag size={18} className="text-red-400" />} onBack={onBack}
      headerRight={
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-accent-400"><Coins size={12} /> {coins}</span>
          <span className="flex items-center gap-1 text-cyan-400"><Gem size={12} /> {gems}</span>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {SHOP_ITEMS.map(item => {
          const balance = item.currency === 'gems' ? gems : coins
          const canAfford = balance >= item.cost
          return (
            <div key={item.id} className="bg-ink-900 border border-ink-800 rounded-xl p-3 flex flex-col animate-fade-in">
              <div className="flex items-center justify-center h-16 mb-2">
                {item.currency === 'gems' ? <Gem size={28} className="text-cyan-400" /> : <Coins size={28} className="text-accent-400" />}
              </div>
              <p className="text-sm font-semibold text-ink-100 text-center">{item.name}</p>
              <p className="text-xs text-center text-ink-500 mt-1 flex items-center justify-center gap-1">
                {item.currency === 'gems' ? <Gem size={10} className="text-cyan-400" /> : <Coins size={10} className="text-accent-400" />}
                {item.cost} {item.currency}
              </p>
              <button
                onClick={() => handleBuy(item)} disabled={!canAfford}
                className={`mt-3 py-2 rounded-lg text-xs font-medium transition active:scale-95 flex items-center justify-center gap-1 ${canAfford ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-ink-800 text-ink-600 cursor-not-allowed'}`}
              >
                {canAfford ? <><Check size={12} /> Buy</> : <><Lock size={12} /> Locked</>}
              </button>
            </div>
          )
        })}
      </div>
    </ScreenShell>
  )
}
