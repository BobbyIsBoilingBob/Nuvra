import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getFriends, getPendingFriendRequests, searchProfiles, acceptFriendRequest, declineFriendRequest, removeFriend, sendFriendRequest } from '@/lib/db'
import type { UserProfile, FriendRequest } from '@/types/adventure'

interface Props { onBack: () => void }

export default function FriendsScreen({ onBack }: Props) {
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')

  const loadData = async () => {
    setLoading(true)
    const [f, r] = await Promise.all([getFriends(), getPendingFriendRequests()])
    setFriends(f)
    setRequests(r)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    setSearching(true)
    const results = await searchProfiles(searchQuery)
    setSearchResults(results)
    setSearching(false)
  }

  const handleSendRequest = async (userId: string) => {
    setActionError('')
    const { error } = await sendFriendRequest(userId)
    if (error) setActionError(error)
    else {
      setSearchResults(prev => prev.filter(u => u.id !== userId))
      loadData()
    }
  }

  const handleAccept = async (requestId: string, senderId: string) => {
    const { error } = await acceptFriendRequest(requestId, senderId)
    if (error) setActionError(error)
    else loadData()
  }

  const handleDecline = async (requestId: string) => {
    const { error } = await declineFriendRequest(requestId)
    if (error) setActionError(error)
    else loadData()
  }

  const handleRemove = async (friendId: string) => {
    const { error } = await removeFriend(friendId)
    if (error) setActionError(error)
    else loadData()
  }

  return (
    <ScreenShell title="Friends" icon="👥" onBack={onBack}>
      {actionError && (
        <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 mb-4">
          <p className="text-sm text-error-400">{actionError}</p>
        </div>
      )}

      <div className="mb-5">
        <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Search Players</label>
        <div className="flex gap-2 mt-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by username..."
            className="flex-1 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition"
          />
          <button onClick={handleSearch} disabled={searching} className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-medium transition active:scale-95 disabled:opacity-50">
            {searching ? '...' : 'Search'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-2">
            {searchResults.map(u => (
              <div key={u.id} className="flex items-center gap-3 bg-ink-900 rounded-xl p-3 border border-ink-800">
                <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center text-lg">{u.avatar_emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-200">{u.username}</p>
                  <p className="text-xs text-ink-500">Level {Math.floor(Math.sqrt(u.xp / 100)) + 1}</p>
                </div>
                <button onClick={() => handleSendRequest(u.id)} className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition active:scale-95">
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? <LoadingSpinner label="Loading friends..." /> : (
        <>
          {requests.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-ink-300 mb-2">Pending Requests ({requests.length})</h3>
              <div className="space-y-2">
                {requests.map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-ink-900 rounded-xl p-3 border border-ink-800">
                    <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center text-lg">{r.sender?.avatar_emoji ?? '👤'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-200">{r.sender?.username ?? 'Unknown'}</p>
                      <p className="text-xs text-ink-500">wants to be your friend</p>
                    </div>
                    <button onClick={() => handleAccept(r.id, r.sender_id)} className="px-3 py-1.5 bg-success-500 hover:bg-success-600 text-white rounded-lg text-xs font-medium transition active:scale-95">Accept</button>
                    <button onClick={() => handleDecline(r.id)} className="px-3 py-1.5 bg-ink-800 text-ink-400 rounded-lg text-xs font-medium transition hover:bg-ink-700 active:scale-95">Decline</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-ink-300 mb-2">Your Friends ({friends.length})</h3>
            {friends.length === 0 ? (
              <EmptyState icon="👥" title="No Friends Yet" message="Search for players above to send friend requests." />
            ) : (
              <div className="space-y-2">
                {friends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 bg-ink-900 rounded-xl p-3 border border-ink-800">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center text-lg">{f.avatar_emoji}</div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink-900 ${f.is_online ? 'bg-success-500' : 'bg-ink-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-200">{f.username}</p>
                      <p className="text-xs text-ink-500">{f.is_online ? 'Online' : 'Offline'}</p>
                    </div>
                    <button onClick={() => handleRemove(f.id)} className="px-3 py-1.5 bg-ink-800 text-ink-400 rounded-lg text-xs font-medium transition hover:bg-error-500/20 hover:text-error-400 active:scale-95">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </ScreenShell>
  )
}
