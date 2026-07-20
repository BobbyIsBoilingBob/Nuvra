import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getParties, createParty, getPartyMembers } from '@/lib/db'
import type { Party, UserProfile, PartyMember } from '@/types/adventure'

interface Props { onBack: () => void }

export default function PartyScreen({ onBack }: Props) {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [partyName, setPartyName] = useState('')
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [members, setMembers] = useState<(PartyMember & { profile?: UserProfile })[]>([])

  const loadParties = async () => {
    setLoading(true)
    const p = await getParties()
    setParties(p)
    setLoading(false)
  }

  useEffect(() => { loadParties() }, [])

  useEffect(() => {
    if (selectedParty) {
      getPartyMembers(selectedParty.id).then(setMembers)
    }
  }, [selectedParty])

  const handleCreate = async () => {
    if (!partyName.trim()) return
    setCreating(true)
    const { error } = await createParty(partyName.trim())
    setCreating(false)
    if (!error) {
      setPartyName('')
      loadParties()
    }
  }

  if (selectedParty) {
    return (
      <ScreenShell title={selectedParty.name} icon="🎉" onBack={() => setSelectedParty(null)}>
        <div className="space-y-3">
          <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
            <p className="text-sm text-ink-400 mb-1">Status</p>
            <p className="text-sm font-semibold text-ink-200 capitalize">{selectedParty.status}</p>
          </div>
          <h3 className="text-sm font-semibold text-ink-300 mb-2">Members ({members.length})</h3>
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-ink-900 rounded-xl p-3 border border-ink-800">
              <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center text-lg">{m.profile?.avatar_emoji ?? '👤'}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-200">{m.profile?.username ?? 'Unknown'}</p>
                <p className="text-xs text-ink-500 capitalize">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell title="Party" icon="🎉" onBack={onBack}>
      <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 mb-4">
        <h3 className="text-sm font-semibold text-ink-200 mb-2">Create a Party</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={partyName}
            onChange={e => setPartyName(e.target.value)}
            placeholder="Party name..."
            className="flex-1 bg-ink-950 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition"
          />
          <button onClick={handleCreate} disabled={creating || !partyName.trim()} className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition active:scale-95 disabled:opacity-50">
            {creating ? '...' : 'Create'}
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading parties..." /> :
        parties.length === 0 ? <EmptyState icon="🎉" title="No Parties Yet" message="Create a party above to start adventuring with friends!" /> :
        <div className="space-y-2">
          {parties.map(p => (
            <button key={p.id} onClick={() => setSelectedParty(p)} className="w-full text-left bg-ink-900 rounded-xl p-4 border border-ink-800 hover:border-brand-500/50 transition active:scale-95">
              <p className="text-sm font-semibold text-ink-200">{p.name}</p>
              <p className="text-xs text-ink-500 mt-0.5 capitalize">{p.status} · Created {new Date(p.created_at).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      }
    </ScreenShell>
  )
}
