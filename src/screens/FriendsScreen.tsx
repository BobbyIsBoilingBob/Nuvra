import { useEffect, useState } from 'react'
import { UserPlus, Search, UserCheck, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getFriends, getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, searchProfiles, sendFriendRequest } from '@/lib/db'
import type { FriendRequest, UserProfile } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { useToasts, ToastContainer } from '@/components/Toast'

type Tab = 'friends' | 'requests' | 'search'

export default function FriendsScreen() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('friends')
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { toasts, push, dismiss } = useToasts()

  useEffect(() => {
    (async () => {
      const [f, r] = await Promise.all([getFriends(), getPendingFriendRequests()])
      setFriends(f || []); setRequests(r || []); setLoading(false)
    })()
  }, [])

  const doSearch = async () => {
    if (!query.trim()) return
    const r = await searchProfiles(query)
    setResults(r || [])
  }

  const accept = async (req: FriendRequest) => {
    const { error } = await acceptFriendRequest(req.id, req.sender_id)
    if (error) { push('error', 'Failed', error); return }
    setRequests(prev => prev.filter(r => r.id !== req.id))
    push('success', 'Friend added!')
  }
  const decline = async (id: string) => { await declineFriendRequest(id); setRequests(prev => prev.filter(r => r.id !== id)) }
  const sendReq = async (userId: string) => {
    const { error } = await sendFriendRequest(userId)
    if (error) { push('error', 'Failed', error); return }
    push('success', 'Friend request sent!')
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: requests.length },
    { id: 'search', label: 'Find' },
  ]

  return (
    <>
      <ScreenShell title="Friends" subtitle="Connect with adventurers">
        <div className="space-y-4">
          <div className="flex gap-1.5 bg-surface-100 p-1 rounded-xl">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === t.id ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white' : 'text-ink-400'}`}>
                {t.label}{t.count != null && t.count > 0 && <span className="ml-1 text-xs opacity-80">({t.count})</span>}
              </button>
            ))}
          </div>

          {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : (
            <>
              {tab === 'friends' && (friends.length === 0 ? <EmptyState icon={<UserCheck size={32} />} title="No friends yet" message="Search for adventurers to connect with" /> : (
                <div className="space-y-2">
                  {friends.map((f, i) => (
                    <div key={f.id} className="bg-surface-100 border border-white/[0.04] rounded-xl p-3 flex items-center gap-3 stagger" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold">{f.username.charAt(0).toUpperCase()}</div>
                      <div className="flex-1"><p className="text-sm font-semibold text-ink-100">{f.username}</p><p className="text-xs text-ink-500">Level {f.level}</p></div>
                      <UserCheck size={18} className="text-brand-400" />
                    </div>
                  ))}
                </div>
              ))}
              {tab === 'requests' && (requests.length === 0 ? <EmptyState icon={<Mail size={32} />} title="No requests" message="Friend requests will appear here" /> : (
                <div className="space-y-2">
                  {requests.map((r, i) => (
                    <div key={r.id} className="bg-surface-100 border border-white/[0.04] rounded-xl p-3 flex items-center gap-3 stagger" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold">{(r.sender?.username || 'A').charAt(0).toUpperCase()}</div>
                      <div className="flex-1"><p className="text-sm font-semibold text-ink-100">{r.sender?.username || 'Unknown'}</p><p className="text-xs text-ink-500">Wants to be friends</p></div>
                      <button onClick={() => accept(r)} className="px-3 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg text-xs font-bold btn-press">Accept</button>
                      <button onClick={() => decline(r.id)} className="px-3 py-2 bg-surface-200 text-ink-400 rounded-lg text-xs font-medium btn-press">Decline</button>
                    </div>
                  ))}
                </div>
              ))}
              {tab === 'search' && (
                <div>
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                      <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Search by name..." className="w-full bg-surface-100 border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none" />
                    </div>
                    <button onClick={doSearch} className="px-4 bg-surface-200 rounded-xl text-sm text-brand-400 btn-press">Go</button>
                  </div>
                  {results.length === 0 && query ? <EmptyState icon={<UserPlus size={32} />} title="No results" message="Try a different search" /> : (
                    <div className="space-y-2">
                      {results.filter(u => u.id !== user?.id).map((u, i) => (
                        <div key={u.id} className="bg-surface-100 border border-white/[0.04] rounded-xl p-3 flex items-center gap-3 stagger" style={{ animationDelay: `${i * 40}ms` }}>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">{u.username.charAt(0).toUpperCase()}</div>
                          <div className="flex-1"><p className="text-sm font-semibold text-ink-100">{u.username}</p><p className="text-xs text-ink-500">Level {u.level}</p></div>
                          <button onClick={() => sendReq(u.id)} className="px-3 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg text-xs font-bold btn-press flex items-center gap-1"><UserPlus size={12} /> Add</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
