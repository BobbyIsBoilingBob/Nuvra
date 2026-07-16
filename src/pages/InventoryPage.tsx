import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { InventoryItem } from '../types'
import { RARITY_COLORS, COSMETIC_ITEMS } from '../lib/gameData'
import { addInventoryItem } from '../lib/gameService'

export function InventoryPage() {
  const { user, profile, refreshProfile } = useAuthStore()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'items' | 'shop'>('items')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase.from('inventory_items').select('*').eq('user_id', user.id).order('acquired_at', { ascending: false })
    if (!error && data) setItems(data as InventoryItem[])
    setLoading(false)
  }

  const purchase = async (item: typeof COSMETIC_ITEMS[0]) => {
    if (!user || !profile) return
    setError(null); setSuccess(null)
    if (profile.coins < item.price) { setError('Not enough coins to purchase this item.'); return }
    if (items.some(i => i.item_id === item.item_id)) { setError('You already own this item.'); return }
    const { error: ce } = await supabase.from('profiles').update({ coins: profile.coins - item.price }).eq('id', user.id)
    if (ce) { setError('Failed to complete purchase. Please try again.'); return }
    await addInventoryItem(user.id, item.item_id, item.item_name, 'cosmetic', item.rarity, item.icon, 1)
    setSuccess(`Purchased ${item.item_name}!`); refreshProfile(); fetchItems()
  }

  const sell = async (item: InventoryItem) => {
    if (!user || !profile) return
    const sellPrice = item.rarity === 'legendary' ? 500 : item.rarity === 'epic' ? 200 : item.rarity === 'rare' ? 80 : 20
    if (item.quantity > 1) await supabase.from('inventory_items').update({ quantity: item.quantity - 1 }).eq('id', item.id)
    else await supabase.from('inventory_items').delete().eq('id', item.id)
    await supabase.from('profiles').update({ coins: profile.coins + sellPrice }).eq('id', user.id)
    refreshProfile(); fetchItems()
  }

  const treasures = items.filter(i => i.item_type === 'treasure')
  const cosmetics = items.filter(i => i.item_type === 'cosmetic')
  const total = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Inventory</h1>
        <p className="text-sm text-neutral-500 mb-4">{total} items collected</p>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('items')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'items' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>🎒 Items</button>
          <button onClick={() => setTab('shop')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'shop' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>🛒 Shop</button>
        </div>
        {tab === 'items' ? (
          loading ? (
            <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="card p-4"><div className="shimmer-bg h-20 rounded-xl" /></div>)}</div>
          ) : items.length === 0 ? (
            <div className="card p-8 text-center"><div className="text-5xl mb-3">🎒</div><p className="text-neutral-500 font-medium mb-1">Your inventory is empty</p><p className="text-sm text-neutral-400">Complete adventures to find treasures!</p></div>
          ) : (
            <>
              {treasures.length > 0 && (
                <>
                  <h2 className="text-sm font-semibold text-neutral-700 mb-2">Treasures</h2>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {treasures.map(item => (
                      <div key={item.id} className={`card p-4 border-2 ${RARITY_COLORS[item.rarity].split(' ').find(c => c.startsWith('border')) || 'border-neutral-200'} animate-fade-in`}>
                        <div className="flex items-center justify-between mb-2"><span className="text-3xl">{item.icon}</span>{item.quantity > 1 && <span className="badge bg-neutral-100 text-neutral-600">x{item.quantity}</span>}</div>
                        <h3 className="font-semibold text-sm text-neutral-900">{item.item_name}</h3>
                        <span className={`badge mt-1 ${RARITY_COLORS[item.rarity]} capitalize`}>{item.rarity}</span>
                        <button onClick={() => sell(item)} className="text-xs text-neutral-400 hover:text-error-500 mt-2 font-medium">Sell for {item.rarity === 'legendary' ? 500 : item.rarity === 'epic' ? 200 : item.rarity === 'rare' ? 80 : 20} 🪙</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {cosmetics.length > 0 && (
                <>
                  <h2 className="text-sm font-semibold text-neutral-700 mb-2">Cosmetics</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {cosmetics.map(item => (
                      <div key={item.id} className={`card p-4 border-2 ${RARITY_COLORS[item.rarity].split(' ').find(c => c.startsWith('border')) || 'border-neutral-200'} animate-fade-in`}>
                        <div className="flex items-center justify-between mb-2"><span className="text-3xl">{item.icon}</span>{item.quantity > 1 && <span className="badge bg-neutral-100 text-neutral-600">x{item.quantity}</span>}</div>
                        <h3 className="font-semibold text-sm text-neutral-900">{item.item_name}</h3>
                        <span className={`badge mt-1 ${RARITY_COLORS[item.rarity]} capitalize`}>{item.rarity}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )
        ) : (
          <div>
            {error && <div className="mb-3 rounded-xl bg-error-50 border border-error-200 px-4 py-2.5 text-sm text-error-700 animate-fade-in">{error}</div>}
            {success && <div className="mb-3 rounded-xl bg-success-50 border border-success-200 px-4 py-2.5 text-sm text-success-700 animate-fade-in">{success}</div>}
            <div className="flex items-center gap-2 mb-4"><span className="text-sm text-neutral-500">Your coins:</span><span className="badge bg-accent-50 text-accent-700">🪙 {profile?.coins ?? 0}</span></div>
            <div className="grid grid-cols-2 gap-3">
              {COSMETIC_ITEMS.map(item => {
                const owned = items.some(i => i.item_id === item.item_id)
                const canAfford = (profile?.coins ?? 0) >= item.price
                return (
                  <div key={item.item_id} className={`card p-4 border-2 ${RARITY_COLORS[item.rarity].split(' ').find(c => c.startsWith('border')) || 'border-neutral-200'}`}>
                    <span className="text-3xl block mb-2">{item.icon}</span>
                    <h3 className="font-semibold text-sm text-neutral-900">{item.item_name}</h3>
                    <span className={`badge mt-1 ${RARITY_COLORS[item.rarity]} capitalize`}>{item.rarity}</span>
                    <div className="mt-3">{owned ? <span className="badge bg-success-50 text-success-700 w-full justify-center py-2">Owned</span> : <button onClick={() => purchase(item)} disabled={!canAfford} className="btn w-full py-2 text-sm bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-50 disabled:pointer-events-none">🪙 {item.price}</button>}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
