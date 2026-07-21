import { ShoppingBag, Coins, Gem, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import ScreenShell from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'

const ITEMS = [
  { id: 'boost_xp', name: 'XP Booster', desc: 'Double XP for 1 hour', cost: 100, currency: 'coins', icon: 'zap' },
  { id: 'boost_coin', name: 'Coin Magnet', desc: 'Double coins for 1 hour', cost: 150, currency: 'coins', icon: 'coins' },
  { id: 'streak_protect', name: 'Streak Shield', desc: 'Protect your streak once', cost: 200, currency: 'coins', icon: 'shield' },
  { id: 'gem_boost', name: 'Gem Pack', desc: 'Instant 50 gems', cost: 30, currency: 'gems', icon: 'gem' },
  { id: 'avatar_premium', name: 'Premium Avatar', desc: 'Unlock premium colors', cost: 50, currency: 'gems', icon: 'palette' },
  { id: 'adventure_slot', name: 'Extra Slot', desc: 'Save 1 more adventure', cost: 80, currency: 'gems', icon: 'map' },
]

export default function ShopScreen() {
  const { profile } = useAuth()
  const { toasts, push, dismiss } = useToasts()

  const handleBuy = (item: typeof ITEMS[0]) => {
    push('info', 'Coming Soon', `${item.name} will be available soon!`)
  }

  return (
    <>
      <ScreenShell title="Shop" subtitle="Spend your rewards">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card-premium p-4 flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center"><Coins className="text-amber-400" size={16} /></div><div><p className="text-xs text-ink-500">Coins</p><p className="text-sm font-bold text-ink-100">{profile?.coins || 0}</p></div></div>
            <div className="card-premium p-4 flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center"><Gem className="text-sky-400" size={16} /></div><div><p className="text-xs text-ink-500">Gems</p><p className="text-sm font-bold text-ink-100">{profile?.gems || 0}</p></div></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ITEMS.map((item, i) => (
              <div key={item.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mb-2"><ShoppingBag className="text-brand-400" size={20} /></div>
                <p className="text-sm font-bold text-ink-100">{item.name}</p>
                <p className="text-xs text-ink-500 mb-3">{item.desc}</p>
                <button onClick={() => handleBuy(item)} className="w-full py-2 bg-surface-200 rounded-lg text-xs font-bold text-ink-300 btn-press flex items-center justify-center gap-1">
                  {item.cost} {item.currency === 'coins' ? <Coins size={12} className="text-amber-400" /> : <Gem size={12} className="text-sky-400" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
