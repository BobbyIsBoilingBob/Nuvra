import { useState, useCallback, memo } from 'react'
import { ShoppingBag, Coins, Gem, Check, Search } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonGrid } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { useAuth } from '@/lib/auth'
import { achievementIcons } from '@/data/navigation'
import type { ScreenName, ShopItem } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockShop: ShopItem[] = [
  { id: 's1', name: 'XP Booster', description: 'Doubles XP for 1 hour', icon: 'star', price: 100, currency: 'coins', category: 'boosters', owned: false },
  { id: 's2', name: 'Coin Magnet', description: 'Auto-collect coins for 30 min', icon: 'fire', price: 150, currency: 'coins', category: 'boosters', owned: false },
  { id: 's3', name: 'Golden Compass', description: 'Shows all checkpoint locations', icon: 'compass', price: 5, currency: 'gems', category: 'tools', owned: false },
  { id: 's4', name: 'Treasure Map', description: 'Reveals hidden treasures', icon: 'mountain', price: 8, currency: 'gems', category: 'tools', owned: true },
  { id: 's5', name: 'Streak Shield', description: 'Protects your streak for 1 day', icon: 'trophy', price: 200, currency: 'coins', category: 'protection', owned: false },
  { id: 's6', name: 'Energy Crystal', description: 'Restores adventure stamina', icon: 'fire', price: 80, currency: 'coins', category: 'consumables', owned: false },
  { id: 's7', name: 'Photo Pro', description: 'Unlocks advanced photo challenges', icon: 'camera', price: 10, currency: 'gems', category: 'upgrades', owned: false },
  { id: 's8', name: 'Riddle Hint', description: 'Get hints for riddle challenges', icon: 'brain', price: 50, currency: 'coins', category: 'consumables', owned: true },
]

async function fetchShop(): Promise<ShopItem[]> {
  return mockShop
}

const categories = ['all', 'boosters', 'tools', 'protection', 'consumables', 'upgrades']

function ShopScreenInner({ onNavigate }: Props) {
  const { profile } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const { data, loading } = useCachedData<ShopItem[]>('shop', fetchShop)

  const handleBuy = useCallback((item: ShopItem) => {
    if (item.owned) { push('info', 'Already owned', 'You already have ' + item.name); return }
    if (item.currency === 'coins' && (profile?.coins ?? 0) < item.price) { push('error', 'Not enough coins', 'You need ' + item.price + ' coins'); return }
    if (item.currency === 'gems' && (profile?.gems ?? 0) < item.price) { push('error', 'Not enough gems', 'You need ' + item.price + ' gems'); return }
    push('success', 'Purchase complete!', 'You bought ' + item.name)
  }, [profile, push])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const filtered = (data ?? []).filter(item => {
    if (filter !== 'all' && item.category !== filter) return false
    if (search.trim() && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <ScreenShell title="Shop" subtitle="Spend your rewards" icon={<ShoppingBag size={18} />} onBack={() => onNavigate('home')} actions={[{ icon: <span className="text-xs font-bold text-accent-600">{profile?.coins ?? 0}</span>, onClick: () => push('info', 'Your balance', (profile?.coins ?? 0) + ' coins, ' + (profile?.gems ?? 0) + ' gems'), label: 'Balance' }]}>
        <div className="space-y-4">
          {/* Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-surface-200 rounded-xl p-3 flex items-center gap-2 shadow-card">
              <Coins size={18} className="text-accent-500" />
              <span className="text-sm font-extrabold text-ink-900">{profile?.coins ?? 0}</span>
              <span className="text-xs text-ink-400">coins</span>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3 flex items-center gap-2 shadow-card">
              <Gem size={18} className="text-success-500" />
              <span className="text-sm font-extrabold text-ink-900">{profile?.gems ?? 0}</span>
              <span className="text-xs text-ink-400">gems</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shop..." className="input-field pl-10" />
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={'chip ' + (filter === c ? 'chip-active' : 'chip-inactive')}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
            ))}
          </div>

          {/* Items grid */}
          {loading && !data ? <SkeletonGrid count={6} /> : filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item, i) => {
                const Icon = achievementIcons[item.icon] ?? ShoppingBag
                return (
                  <div key={item.id} className="card-premium p-4 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center mb-2">
                      <Icon size={20} className="text-ink-600" />
                    </div>
                    <p className="text-sm font-bold text-ink-900">{item.name}</p>
                    <p className="text-xs text-ink-400 mb-3">{item.description}</p>
                    {item.owned ? (
                      <div className="flex items-center justify-center gap-1.5 py-2 bg-success-50 rounded-lg text-success-600 text-sm font-bold">
                        <Check size={14} /> Owned
                      </div>
                    ) : (
                      <button onClick={() => handleBuy(item)} className="w-full btn-primary text-sm flex items-center justify-center gap-1.5 py-2">
                        {item.currency === 'coins' ? <Coins size={14} /> : <Gem size={14} />} {item.price}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<ShoppingBag size={28} />} title="No items found" message="Try a different search or category" />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="shop" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const ShopScreen = memo(ShopScreenInner)
