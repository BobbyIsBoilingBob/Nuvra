import { useEffect, useState } from 'react'
import { Backpack } from 'lucide-react'
import { getInventory } from '@/lib/db'
import type { InventoryItem } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

const rarityColors: Record<string, string> = {
  common: 'from-slate-500 to-slate-600', uncommon: 'from-brand-500 to-brand-600', rare: 'from-sky-500 to-sky-600', epic: 'from-accent-500 to-accent-600', legendary: 'from-rose-500 to-rose-600',
}
const rarityBorder: Record<string, string> = {
  common: 'border-slate-500/30', uncommon: 'border-brand-500/30', rare: 'border-sky-500/30', epic: 'border-accent-500/30', legendary: 'border-rose-500/30',
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => { const i = await getInventory(); setItems(i || []); setLoading(false) })() }, [])

  return (
    <ScreenShell title="Inventory" subtitle="Your collected items">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : items.length === 0 ? <EmptyState icon={<Backpack size={32} />} title="Empty inventory" message="Complete adventures to find items" /> : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <div key={item.id} className={`card-premium p-4 border ${rarityBorder[item.rarity] || 'border-white/[0.04]'} stagger`} style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rarityColors[item.rarity] || rarityColors.common} flex items-center justify-center mb-2`}>
                <span className="text-white font-bold text-lg">{item.item_name.charAt(0)}</span>
              </div>
              <p className="text-sm font-bold text-ink-100">{item.item_name}</p>
              <p className="text-xs text-ink-500 capitalize">{item.rarity} {item.item_type}</p>
              {item.quantity > 1 && <span className="inline-block mt-1.5 text-xs font-bold text-accent-400">x{item.quantity}</span>}
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
