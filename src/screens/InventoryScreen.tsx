import { Backpack, Star } from 'lucide-react'
import type { InventoryItem } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }

const mockItems: InventoryItem[] = [
  { id: 'i1', name: 'Magic Compass', description: 'Points to the nearest checkpoint', icon: 'compass', quantity: 1, rarity: 'rare' },
  { id: 'i2', name: 'XP Booster', description: 'Double XP for 1 hour', icon: 'star', quantity: 3, rarity: 'epic' },
  { id: 'i3', name: 'Treasure Map', description: 'Reveals hidden treasures', icon: 'map', quantity: 2, rarity: 'rare' },
  { id: 'i4', name: 'Walking Boots', description: 'Increases step count by 50%', icon: 'boots', quantity: 1, rarity: 'legendary' },
  { id: 'i5', name: 'Coin Magnet', description: 'Attracts coins while walking', icon: 'coins', quantity: 5, rarity: 'common' },
  { id: 'i6', name: 'Adventure Key', description: 'Unlocks premium adventures', icon: 'key', quantity: 1, rarity: 'epic' },
]

const rarityColors: Record<string, string> = {
  common: 'border-surface-300 bg-surface-50', rare: 'border-brand-300 bg-brand-50',
  epic: 'border-accent-300 bg-accent-50', legendary: 'border-error-300 bg-error-50',
}
const rarityText: Record<string, string> = { common: 'text-ink-400', rare: 'text-brand-600', epic: 'text-accent-600', legendary: 'text-error-600' }

export default function InventoryScreen({ onNavigate }: Props) {
  return (
    <>
      <ScreenShell title="Inventory" subtitle="Your items and treasures">
        {mockItems.length === 0 ? <EmptyState icon={<Backpack size={32} />} title="Empty inventory" message="Complete adventures to find items" actionLabel="Explore" onAction={() => onNavigate('generator')} /> : (
          <div className="grid grid-cols-2 gap-3">
            {mockItems.map((item, i) => (
              <div key={item.id} className={`rounded-2xl border p-4 stagger ${rarityColors[item.rarity]}`} style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl bg-white border border-surface-200 flex items-center justify-center shadow-card"><Star size={20} className="text-ink-400" /></div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-surface-200">{item.quantity}x</span>
                </div>
                <p className="text-sm font-bold text-ink-900">{item.name}</p>
                <p className="text-xs text-ink-400 mt-0.5 leading-tight">{item.description}</p>
                <p className={`text-xs font-bold uppercase mt-2 ${rarityText[item.rarity]}`}>{item.rarity}</p>
              </div>
            ))}
          </div>
        )}
      </ScreenShell>
      <BottomNav active="inventory" onNavigate={onNavigate} />
    </>
  )
}
