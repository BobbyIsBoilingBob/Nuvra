import { ShoppingBag, Coins, Gem, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import ScreenShell from '@/components/ScreenShell'
import EmptyState from '@/components/EmptyState'

const SHOP_ITEMS = [
  { id: 'boost_xp_1', name: 'XP Booster', description: 'Double XP for 1 hour', price: 200, currency: 'coins' as const, rarity: 'uncommon' },
  { id: 'boost_xp_2', name: 'XP Mega Booster', description: 'Triple XP for 2 hours', price: 500, currency: 'coins' as const, rarity: 'rare' },
  { id: 'cosmetic_trail', name: 'Trail Effect', description: 'Glowing trail behind you', price: 800, currency: 'coins' as const, rarity: 'epic' },
  { id: 'cosmetic_aura', name: 'Aura Effect', description: 'Mystical aura around avatar', price: 50, currency: 'gems' as const, rarity: 'legendary' },
  { id: 'cosmetic_cape', name: 'Hero Cape', description: 'Flowing cape cosmetic', price: 30, currency: 'gems' as const, rarity: 'epic' },
  { id: 'skip_token', name: 'Skip Token', description: 'Skip one challenge', price: 150, currency: 'coins' as const, rarity: 'uncommon' },
]

const rarityText: Record<string, string> = {
  common: 'text-ink-400', uncommon: 'text-success-400', rare: 'text-brand-400', epic: 'text-accent-400', legendary: 'text-purple-400',
}

export default function ShopScreen() {
  const { profile } = useAuth()

  return (
    <ScreenShell title="Shop" subtitle="Spend your rewards">
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="flex-1 bg-gradient-to-r from-accent-500/15 to-accent-600/10 border border-accent-500/20 rounded-xl p-3 flex items-center gap-2"><Coins size={20} className="text-accent-400" /><div><p className="text-xs text-ink-500">Coins</p><p className="text-lg font-bold text-ink-100">{profile?.coins.toLocaleString() ?? 0}</p></div></div>
          <div className="flex-1 bg-gradient-to-r from-brand-500/15 to-brand-600/10 border border-brand-500/20 rounded-xl p-3 flex items-center gap-2"><Gem size={20} className="text-brand-400" /><div><p className="text-xs text-ink-500">Gems</p><p className="text-lg font-bold text-ink-100">{profile?.gems ?? 0}</p></div></div>
        </div>
        {SHOP_ITEMS.length === 0 ? (
          <EmptyState icon={<ShoppingBag size={32} />} title="Shop empty" message="Check back later for new items" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {SHOP_ITEMS.map((item, i) => (
              <div key={item.id} className="bg-surface-100 border border-white/[0.04] rounded-2xl p-4 stagger" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-200 to-surface-300 flex items-center justify-center mb-3"><Star size={22} className={rarityText[item.rarity] || 'text-ink-400'} /></div>
                <p className="text-sm font-bold text-ink-100">{item.name}</p>
                <p className="text-xs text-ink-500 mt-0.5 leading-relaxed mb-3">{item.description}</p>
                <button className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl text-xs font-bold btn-press flex items-center justify-center gap-1">
                  {item.currency === 'coins' ? <><Coins size={12} /> {item.price}</> : <><Gem size={12} /> {item.price}</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenShell>
  )
}
