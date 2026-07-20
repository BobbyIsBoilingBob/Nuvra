import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getInventory } from '@/lib/db'
import type { InventoryItem } from '@/types/adventure'

interface Props { onBack: () => void }

const rarityColors: Record<string, string> = {
  common: 'text-ink-400 border-ink-700',
  uncommon: 'text-success-400 border-success-500/30',
  rare: 'text-blue-400 border-blue-500/30',
  epic: 'text-purple-400 border-purple-500/30',
  legendary: 'text-accent-400 border-accent-500/30',
}

export default function InventoryScreen({ onBack }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInventory().then(data => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  return (
    <ScreenShell title="Inventory" icon="🎒" onBack={onBack}>
      {loading ? <LoadingSpinner label="Loading inventory..." /> :
       items.length === 0 ? <EmptyState icon="🎒" title="Empty Inventory" message="Complete adventures to collect items!" /> :
       <div className="grid grid-cols-3 gap-3">
         {items.map(item => (
           <div key={item.id} className={`bg-ink-900 rounded-xl p-3 border text-center ${rarityColors[item.rarity] || rarityColors.common}`}>
             <div className="text-3xl mb-1">{item.icon}</div>
             <p className="text-xs font-semibold text-ink-200">{item.item_name}</p>
             <p className={`text-xs capitalize ${rarityColors[item.rarity]?.split(' ')[0] || 'text-ink-400'}`}>{item.rarity}</p>
             {item.quantity > 1 && <p className="text-xs text-ink-500 mt-0.5">x{item.quantity}</p>}
           </div>
         ))}
       </div>
      }
    </ScreenShell>
  )
}
