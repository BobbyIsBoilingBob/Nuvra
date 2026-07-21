import { useEffect, useState } from 'react'
import { PartyPopper, Plus, Users, X } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import type { Party } from '@/types/adventure'
import { getParties, createParty } from '@/lib/db'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function PartyScreen({ onBack, onToast }: Props) {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    const p = await getParties()
    setParties(p); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    const { error } = await createParty(name.trim())
    setCreating(false)
    if (error) onToast('error', 'Failed', error)
    else { onToast('success', 'Party created!'); setName(''); setShowCreate(false); load() }
  }

  return (
    <ScreenShell title="Party" icon={<PartyPopper size={18} className="text-brand-400" />} onBack={onBack}
      headerRight={
        <button onClick={() => setShowCreate(s => !s)} className="text-brand-400 hover:text-brand-300 transition active:scale-95">
          <Plus size={20} />
        </button>
      }
    >
      {showCreate && (
        <div className="bg-ink-900 border border-ink-800 rounded-xl p-3 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-200">Create Party</h3>
            <button onClick={() => setShowCreate(false)} className="text-ink-500 hover:text-ink-300"><X size={16} /></button>
          </div>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Party name"
            className="w-full bg-ink-950 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          <button onClick={handleCreate} disabled={creating || !name.trim()}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {creating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : <><Plus size={16} /> Create Party</>}
          </button>
        </div>
      )}

      {loading ? <LoadingSpinner /> : parties.length === 0 ? (
        <EmptyState icon={<PartyPopper size={40} />} title="No parties yet" message="Create a party to adventure with friends" actionLabel="Create Party" onAction={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-2">
          {parties.map(p => (
            <div key={p.id} className="bg-ink-900 border border-ink-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                  <Users size={18} className="text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-100">{p.name}</p>
                  <p className="text-xs text-ink-500">Created {new Date(p.created_at).toLocaleDateString()} · {p.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
