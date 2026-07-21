import { useEffect, useState } from 'react'
import { Users, Search, UserPlus, Check, X, User } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import type { UserProfile, FriendRequest } from '@/types/adventure'
import {
  getFriends, getPendingFriendRequests, searchProfiles,
  sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend,
} from '@/lib/db'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function FriendsScreen({ onBack, onToast }: Props) {
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends')
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  const load = async () => {
    const [f, r] = await Promise.all([getFriends(), getPendingFriendRequests()])
    setFriends(f); setRequests(r); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    const r = await searchProfiles(q)
    setResults(r); setSearching(false)
  }

  const handleSend = async (id: string) => {
    const { error } = await sendFriendRequest(id)
    onToast(error ? 'error' : 'success', error ? 'Failed' : 'Request sent!', error ?? undefined)
  }

  const handleAccept = async (id: string, senderId: string) => {
    const { error } = await acceptFriendRequest(id, senderId)
    onToast(error ? 'error' : 'success', error ? 'Failed' : 'Friend added!', error ?? undefined)
    if (!error) load()
  }

  const handleDecline = async (id: string) => {
    const { error } = await declineFriendRequest(id)
    if (!error) load()
  }

  const handleRemove = async (id: string) => {
    const { error } = await removeFriend(id)
    onToast(error ? 'error' : 'info', error ? 'Failed' : 'Friend removed')
    if (!error) load()
  }

  return (
    <ScreenShell title="Friends" icon={<Users size={18} className="text-brand-400" />} onBack={onBack}>
      <div className="flex gap-2 mb-4">
        {(['friends', 'requests', 'search'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition active:scale-95 ${tab === t ? 'bg-brand-500 text-white' : 'bg-ink-900 border border-ink-700 text-ink-400'}`}>
            {t === 'friends' ? 'Friends' : t === 'requests' ? `Requests${requests.length ? ` (${requests.length})` : ''}` : 'Search'}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        loading ? <LoadingSpinner /> : friends.length === 0 ? (
          <EmptyState icon={<Users size={40} />} title="No friends yet" message="Search for players to add friends" actionLabel="Search Players" onAction={() => setTab('search')} />
        ) : (
          <div className="space-y-2">
            {friends.map(f => (
              <div key={f.id} className="flex items-center gap-3 bg-ink-900 border border-ink-800 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.avatar_color || '#3fc59b' }}>
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-100">{f.username}</p>
                  <p className="text-xs text-ink-500">Level {f.level} · {f.xp} XP</p>
                </div>
                <button onClick={() => handleRemove(f.id)} className="text-ink-500 hover:text-error-400 transition active:scale-95">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'requests' && (
        loading ? <LoadingSpinner /> : requests.length === 0 ? (
          <EmptyState icon={<UserPlus size={40} />} title="No pending requests" message="Friend requests will appear here" />
        ) : (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-ink-900 border border-ink-800 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.sender?.avatar_color || '#3fc59b' }}>
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-100">{r.sender?.username || 'Unknown'}</p>
                  <p className="text-xs text-ink-500">wants to be friends</p>
                </div>
                <button onClick={() => handleAccept(r.id, r.sender_id)} className="p-2 bg-success-500/20 text-success-400 rounded-lg hover:bg-success-500/30 transition active:scale-95">
                  <Check size={16} />
                </button>
                <button onClick={() => handleDecline(r.id)} className="p-2 bg-error-500/20 text-error-400 rounded-lg hover:bg-error-500/30 transition active:scale-95">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input type="text" value={query} onChange={e => handleSearch(e.target.value)}
              placeholder="Search by username..."
              className="w-full bg-ink-900 border border-ink-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          </div>
          {searching ? <LoadingSpinner size="sm" /> :
           results.length === 0 && query.trim().length >= 2 ? (
             <EmptyState icon={<Search size={32} />} title="No players found" message={`No users matching "${query}"`} />
           ) : (
             <div className="space-y-2">
               {results.map(u => (
                 <div key={u.id} className="flex items-center gap-3 bg-ink-900 border border-ink-800 rounded-xl p-3">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: u.avatar_color || '#3fc59b' }}>
                     <User size={18} className="text-white" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-ink-100">{u.username}</p>
                     <p className="text-xs text-ink-500">Level {u.level}</p>
                   </div>
                   <button onClick={() => handleSend(u.id)} className="px-3 py-1.5 bg-brand-500/20 text-brand-400 rounded-lg text-xs font-medium hover:bg-brand-500/30 transition active:scale-95 flex items-center gap-1">
                     <UserPlus size={14} /> Add
                   </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}
    </ScreenShell>
  )
}
