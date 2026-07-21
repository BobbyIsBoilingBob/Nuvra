import { useEffect, useState } from 'react'
import { Backpack, Package } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getInventory } from '@/lib/db'
import type { InventoryItem } from '@/types/adventure'

interface Props {
  onBack: () => void
}

const rarityColors: Record<string, string> = {
  common: 'border-ink-700 text-ink-300',
  uncommon: 'border-success-500/40 text-success-400',
  rare: 'border-blue-500/40 text-blue-400',
  epic: 'border-purple-500/40 text-purple-400',
  legendary: 'border-accent-500/40 text-accent-400',
}

export default function InventoryScreen({ onBack }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInventory().then(i => { setItems(i); setLoading(false) })
  }, [])

  return (
    <ScreenShell title="Inventory" icon={<Backpack size={18} />} onBack={onBack}>
      {loading ? <LoadingSpinner label="Loading inventory..." /> : items.length === 0 ? (
        <EmptyState icon={<Backpack size={40} />} title="Empty inventory" message="Items collected from adventures will appear here" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <div key={item.id} className={`bg-ink-900 border rounded-xl p-3 animate-fade-in ${rarityColors[item.rarity] || rarityColors.common}`}>
              <div className="flex items-center justify-center mb-2">
                <Package size={32} className="opacity-80" />
              </div>
              <p className="text-sm font-semibold text-ink-100 text-center">{item.item_name}</p>
              <p className="text-xs text-center mt-1 capitalize">{item.rarity}</p>
              {item.quantity > 1 && <p className="text-xs text-center text-ink-500 mt-1">x{item.quantity}</p>}
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
