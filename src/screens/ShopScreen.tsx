import ScreenShell from '@/components/ScreenShell'

export default function ShopScreen({ onBack }: { onBack: () => void }) {
  const items = [
    { name: 'XP Boost Pack', price: '$1.99', icon: '⚡' },
    { name: 'Premium Avatar Pack', price: '$3.99', icon: '🎨' },
    { name: 'Exclusive Trails', price: '$5.99', icon: '🗺' },
    { name: 'Coin Bundle (1000)', price: '$2.99', icon: '🪙' },
    { name: 'Season Pass', price: '$9.99', icon: '🎟' },
    { name: 'Custom Themes', price: '$1.49', icon: '🎭' },
  ]
  return (
    <ScreenShell title="Shop" icon="🛒" onBack={onBack}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-sm font-semibold text-ink-200 mb-1">{item.name}</p>
            <p className="text-sm text-brand-400 font-bold mb-2">{item.price}</p>
            <button className="w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition">Buy</button>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
