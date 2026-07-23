import { useState, useCallback, memo } from 'react'
import { Backpack, Search } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonGrid } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { achievementIcons } from '@/data/navigation'
import type { ScreenName, InventoryItem } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockItems: InventoryItem[] = [
  { id: 'i1', name: 'Compass', description: 'Helps navigate to checkpoints', icon: 'compass', quantity: 1, rarity: 'common' },
  { id: 'i2', name: 'Treasure Map', description: 'Reals hidden treasure locations', icon: 'mountain', quantity: 3, rarity: 'rare' },
  { id: 'i3', name: 'XP Booster', description: 'Doubles XP for 1 hour', icon: 'star', quantity: 2, rarity: 'epic' },
  { id: 'i4', name: 'Golden Trophy', description: 'Awarded for top rankings', icon: 'trophy', quantity: 1, rarity: 'legendary' },
  { id: 'i5', name: 'Camera', description: 'For photo challenges', icon: 'camera', quantity: 1, rarity: 'common' },
  { id: 'i6', name: 'Energy Crystal', description: 'Restores adventure stamina', icon: 'fire', quantity: 5, rarity: 'rare' },
]

async function fetchInventory(): Promise<InventoryItem[]> {
  return mockItems
}

const rarityColors: Record<InventoryItem['rarity'], string> = {
  common: 'border-surface-300 bg-white',
  rare: 'border-brand-300 bg-brand-50',
  epic: 'border-accent-300 bg-accent-50',
  legendary: 'border-warning-300 bg-warning-50',
}
const rarityText: Record<InventoryItem['rarity'], string> = {
  common: 'text-ink-500',
  rare: 'text-brand-600',
  epic: 'text-accent-600',
  legendary: 'text-warning-600',
}

function InventoryScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [search, setSearch] = useState('')
  const { data, loading } = useCachedData<InventoryItem[]>('inventory', fetchInventory)

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const filtered = (data ?? []).filter(item => !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <ScreenShell title="Inventory" subtitle="Your items" icon={<Backpack size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="input-field pl-10" />
          </div>

          {loading && !data ? <SkeletonGrid count={6} /> : filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item, i) => {
                const Icon = achievementIcons[item.icon] ?? Backpack
                return (
                  <div key={item.id} className={'rounded-xl p-4 border-2 transition animate-fade-in ' + rarityColors[item.rarity]} style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center">
                        <Icon size={20} className="text-ink-600" />
                      </div>
                      <span className={'text-[10px] font-bold uppercase ' + rarityText[item.rarity]}>{item.rarity}</span>
                    </div>
                    <p className="text-sm font-bold text-ink-900">{item.name}</p>
                    <p className="text-xs text-ink-400 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-600">x{item.quantity}</span>
                      <button onClick={() => push('info', 'Used ' + item.name, 'Item effect activated')} className="text-xs font-bold text-brand-600 hover:text-brand-700">Use</button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<Backpack size={28} />} title="No items found" message="Find treasures in adventures to fill your inventory" />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="inventory" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const InventoryScreen = memo(InventoryScreenInner)
