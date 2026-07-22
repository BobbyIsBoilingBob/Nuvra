import { useState } from 'react'
import { ShoppingBag, Star, Coins, Check, Lock } from 'lucide-react'
import type { ShopItem } from '@/types/adventure'
import { useAuth } from '@/lib/auth'
import { useToasts, ToastContainer } from '@/components/Toast'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'

interface Props { onNavigate: (s: string) => void }

const mockShop: ShopItem[] = [
  { id: 's1', name: 'XP Booster (1h)', description: 'Double XP for 1 hour', icon: 'star', price: 50, currency: 'coins', category: 'boosters', owned: false },
  { id: 's2', name: 'Coin Magnet (24h)', description: 'Attracts coins while walking', icon: 'coins', price: 100, currency: 'coins', category: 'boosters', owned: false },
  { id: 's3', name: 'Adventure Key', description: 'Unlocks premium adventures', icon: 'key', price: 5, currency: 'gems', category: 'keys', owned: false },
  { id: 's4', name: 'Magic Compass', description: 'Points to nearest checkpoint', icon: 'compass', price: 200, currency: 'coins', category: 'items', owned: true },
  { id: 's5', name: 'Treasure Map', description: 'Reveals hidden treasures', icon: 'map', price: 150, currency: 'coins', category: 'items', owned: false },
  { id: 's6', name: 'Legendary Boots', description: 'Increases step count by 50%', icon: 'boots', price: 10, currency: 'gems', category: 'gear', owned: false },
  { id: 's7', name: 'Coin Pack (500)', description: '500 coins instantly', icon: 'coins', price: 5, currency: 'gems', category: 'packs', owned: false },
  { id: 's8', name: 'Gem Pack (10)', description: '10 gems instantly', icon: 'gem', price: 300, currency: 'coins', category: 'packs', owned: false },
]

const categories = ['all', 'boosters', 'keys', 'items', 'gear', 'packs']

export default function ShopScreen({ onNavigate }: Props) {
  const { profile } = useAuth()
  const [items, setItems] = useState(mockShop)
  const [filter, setFilter] = useState('all')
  const { toasts, push, dismiss } = useToasts()
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  const handleBuy = (item: ShopItem) => {
    if (item.owned) return
    const balance = item.currency === 'coins' ? (profile?.coins ?? 0) : (profile?.gems ?? 0)
    if (balance < item.price) { push('error', 'Not enough ' + item.currency); return }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i))
    push('success', `${item.name} purchased!`, `-${item.price} ${item.currency}`)
  }

  return (
    <>
      <ScreenShell title="Shop" subtitle="Spend your hard-earned coins">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-surface-200 shadow-card"><Coins size={16} className="text-accent-500" /><span className="text-sm font-bold text-ink-900">{profile?.coins ?? 0}</span></div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-surface-200 shadow-card"><Star size={16} className="text-brand-500" /><span className="text-sm font-bold text-ink-900">{profile?.gems ?? 0}</span></div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map(c => <button key={c} onClick={() => setFilter(c)} className={`chip whitespace-nowrap capitalize ${filter === c ? 'chip-active' : 'chip-inactive'}`}>{c}</button>)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item, i) => (
              <div key={item.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center mb-3"><ShoppingBag size={20} className="text-ink-400" /></div>
                <p className="text-sm font-bold text-ink-900">{item.name}</p>
                <p className="text-xs text-ink-400 mt-0.5 leading-tight">{item.description}</p>
                {item.owned ? (
                  <div className="mt-3 bg-success-50 border border-success-300 rounded-xl py-2 flex items-center justify-center gap-1.5 text-success-700 font-bold text-xs"><Check size={14} /> Owned</div>
                ) : (
                  <button onClick={() => handleBuy(item)} className="mt-3 w-full py-2.5 bg-brand-500 text-white rounded-xl text-xs font-bold btn-press hover:bg-brand-600 transition flex items-center justify-center gap-1.5">
                    {item.currency === 'coins' ? <Coins size={12} /> : <Star size={12} />} {item.price}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="shop" onNavigate={onNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
