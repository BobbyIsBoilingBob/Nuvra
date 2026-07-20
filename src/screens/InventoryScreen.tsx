import ScreenShell from '@/components/ScreenShell'

export default function InventoryScreen({ onBack }: { onBack: () => void }) {
  const items = [
    { name: 'Compass', icon: '🧭', rarity: 'Common' },
    { name: 'Trail Map', icon: '🗺', rarity: 'Common' },
    { name: 'Camera', icon: '📷', rarity: 'Common' },
    { name: 'Golden Badge', icon: '🏅', rarity: 'Rare' },
    { name: 'Explorer Hat', icon: '🎩', rarity: 'Epic' },
    { name: 'Mystery Key', icon: '🗝', rarity: 'Legendary' },
  ]
  const rarityColors: Record<string, string> = {
    Common: 'text-ink-400', Rare: 'text-blue-400', Epic: 'text-purple-400', Legendary: 'text-accent-400',
  }
  return (
    <ScreenShell title="Inventory" icon="🎒" onBack={onBack}>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div key={i} className="bg-ink-900 rounded-xl p-3 border border-ink-800 text-center">
            <div className="text-3xl mb-1">{item.icon}</div>
            <p className="text-xs font-semibold text-ink-200">{item.name}</p>
            <p className={`text-xs ${rarityColors[item.rarity]}`}>{item.rarity}</p>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
