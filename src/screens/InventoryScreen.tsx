import { useEffect, useState } from 'react'
import { Backpack, Star } from 'lucide-react'
import { getInventory } from '@/lib/db'
import type { InventoryItem } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

const rarityColors: Record<string, string> = {
  common: 'from-ink-500/20 to-ink-600/10 border-ink-500/20', uncommon: 'from-success-500/20 to-success-600/10 border-success-500/30',
  rare: 'from-brand-500/20 to-brand-600/10 border-brand-500/30', epic: 'from-accent-500/20 to-accent-600/10 border-accent-500/30', legendary: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
}
const rarityText: Record<string, string> = {
  common: 'text-ink-400', uncommon: 'text-success-400', rare: 'text-brand-400', epic: 'text-accent-400', legendary: 'text-purple-400',
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const inv = await getInventory()
      setItems(inv || []); setLoading(false)
    })()
  }, [])

  return (
    <ScreenShell title="Inventory" subtitle="Your collected items">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : items.length === 0 ? (
        <EmptyState icon={<Backpack size={32} />} title="Empty inventory" message="Complete adventures to earn items" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <div key={item.id} className={`bg-gradient-to-br ${rarityColors[item.rarity] || rarityColors.common} border rounded-2xl p-4 stagger`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-surface-200/80 flex items-center justify-center"><Star size={22} className={rarityText[item.rarity] || 'text-ink-400'} /></div>
                {item.quantity > 1 && <span className="text-xs font-bold text-ink-300 bg-surface-200 px-2 py-0.5 rounded-lg">x{item.quantity}</span>}
              </div>
              <p className="text-sm font-bold text-ink-100">{item.item_name}</p>
              <p className="text-xs capitalize mt-0.5 font-medium">{item.rarity}</p>
              <p className="text-xs text-ink-500 mt-1 leading-relaxed">{item.item_type}</p>
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
