import { useEffect, useState } from 'react'
import { Users, Plus, Crown } from 'lucide-react'
import { getParties, createParty } from '@/lib/db'
import type { Party } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { useToasts, ToastContainer } from '@/components/Toast'

export default function PartyScreen() {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const load = async () => { const p = await getParties(); setParties(p || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    const { error } = await createParty(name.trim())
    setCreating(false)
    if (error) { push('error', 'Failed', error); return }
    setName(''); push('success', 'Party created!'); load()
  }

  return (
    <>
      <ScreenShell title="Parties" subtitle="Adventure together">
        <div className="space-y-4">
          <div className="card-premium p-4">
            <h3 className="text-sm font-bold text-ink-100 mb-3">Create a Party</h3>
            <div className="flex gap-2">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Party name..." className="flex-1 bg-surface-100 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none" />
              <button onClick={handleCreate} disabled={creating || !name.trim()} className="px-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl text-sm font-bold btn-press disabled:opacity-50 flex items-center gap-1.5"><Plus size={16} /> Create</button>
            </div>
          </div>

          {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : parties.length === 0 ? <EmptyState icon={<Users size={32} />} title="No parties yet" message="Create one to adventure with friends" /> : (
            <div className="space-y-3">
              {parties.map((p, i) => (
                <div key={p.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center"><Crown className="text-white" size={20} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-100">{p.name}</p>
                      <p className="text-xs text-ink-500 capitalize">{p.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
