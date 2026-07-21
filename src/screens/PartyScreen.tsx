import { useEffect, useState } from 'react'
import { Users, Plus, Crown } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getParties, createParty } from '@/lib/db'
import type { Party } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { useToasts, ToastContainer } from '@/components/Toast'

export default function PartyScreen() {
  const { user } = useAuth()
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const { toasts, push, dismiss } = useToasts()

  useEffect(() => {
    (async () => {
      const p = await getParties()
      setParties(p || []); setLoading(false)
    })()
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    const { error } = await createParty(name)
    if (error) { push('error', 'Failed', error); return }
    const p = await getParties(); setParties(p || []); setName(''); setShowCreate(false)
    push('success', 'Party created!')
  }

  return (
    <>
      <ScreenShell title="Parties" subtitle="Adventure together" actions={[{ icon: <Plus size={18} />, onClick: () => setShowCreate(!showCreate) }]}>
        <div className="space-y-4">
          {showCreate && (
            <div className="bg-surface-100 border border-brand-500/20 rounded-xl p-4 space-y-3 animate-slide-up">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Party name" className="w-full bg-surface-200 border border-white/[0.06] rounded-xl px-3.5 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none" />
              <button onClick={handleCreate} className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl text-sm font-bold btn-press">Create Party</button>
            </div>
          )}
          {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : parties.length === 0 ? (
            <EmptyState icon={<Users size={32} />} title="No parties" message="Create or join a party to adventure with friends" actionLabel="Create Party" onAction={() => setShowCreate(true)} />
          ) : (
            <div className="space-y-3">
              {parties.map((p, i) => (
                <div key={p.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2"><Users size={16} className="text-brand-400" /><span className="text-sm font-bold text-ink-100">{p.name}</span></div>
                    <span className="text-xs text-ink-500 bg-surface-200 px-2 py-1 rounded-lg">{p.status}</span>
                  </div>
                  {p.leader_id === user?.id ? (
                    <div className="flex items-center gap-1.5 text-xs text-accent-400"><Crown size={12} /> You're the leader</div>
                  ) : (
                    <div className="text-xs text-ink-500">Join via invite</div>
                  )}
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
