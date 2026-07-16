import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { checkAchievements, createNotification, logActivity } from '../lib/gameService'
import type { Friend, Profile } from '../types'

interface FriendWithProfile extends Friend {
  friend_profile?: Profile
}

export function FriendsPage() {
  const { user, profile, refreshProfile } = useAuthStore()
  const [friends, setFriends] = useState<FriendWithProfile[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    if (!user) return
    setLoading(true)

    const [sentRes, receivedRes] = await Promise.all([
      supabase
        .from('friends')
        .select('*, friend_profile:profiles!friend_id(*)')
        .eq('user_id', user.id),
      supabase
        .from('friends')
        .select('*, friend_profile:profiles!user_id(*)')
        .eq('friend_id', user.id)
        .eq('status', 'pending'),
    ])

    if (sentRes.data) {
      const accepted = (sentRes.data as FriendWithProfile[]).filter((f) => f.status === 'accepted')
      const pendingSent = (sentRes.data as FriendWithProfile[]).filter((f) => f.status === 'pending')
      setFriends(accepted)
      // Incoming pending requests
      const incoming = (receivedRes.data as FriendWithProfile[]) || []
      setPendingRequests([...incoming, ...pendingSent])
    }

    if (receivedRes.data) {
      setPendingRequests(receivedRes.data as FriendWithProfile[])
    }

    setLoading(false)
  }

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return
    setSearching(true)
    setError(null)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${searchQuery.trim()}%`)
      .neq('id', user.id)
      .limit(10)

    if (error) {
      setError('Search failed. Please try again.')
    } else {
      setSearchResults(data as Profile[])
    }
    setSearching(false)
  }

  const sendFriendRequest = async (targetId: string) => {
    if (!user) return
    setError(null)

    // Check if already friends or request exists
    const { data: existing } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${targetId}),and(user_id.eq.${targetId},friend_id.eq.${user.id})`)
      .maybeSingle()

    if (existing) {
      setError('A friend request already exists with this user.')
      return
    }

    const { error } = await supabase
      .from('friends')
      .insert({ user_id: user.id, friend_id: targetId, status: 'pending' })

    if (error) {
      setError('Failed to send friend request.')
      return
    }

    // Create notification for the recipient
    await createNotification(targetId, 'friend_request', 'New Friend Request!', `${profile?.username || 'Someone'} wants to be your friend.`)

    setError(null)
    setSearchQuery('')
    setSearchResults([])
    fetchFriends()
  }

  const acceptFriendRequest = async (requestId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (error) {
      setError('Failed to accept friend request.')
      return
    }

    // Create notification for the sender
    const request = pendingRequests.find((r) => r.id === requestId)
    if (request) {
      await createNotification(request.user_id, 'friend_accepted', 'Friend Request Accepted!', `${profile?.username || 'Someone'} accepted your friend request.`)
      await logActivity(user.id, 'friend_added', `Added a new friend`, {})

      // Check achievements
      const friendCount = friends.length + 1
      await checkAchievements(user.id, {
        steps: profile?.steps || 0,
        distance_walked: profile?.distance_walked || 0,
        completed_adventures: profile?.completed_adventures || 0,
        treasure_collected: profile?.treasure_collected || 0,
        level: profile?.level || 1,
        coins: profile?.coins || 0,
        walking_streak: profile?.walking_streak || 0,
        friends: friendCount,
        completed_challenges: profile?.completed_challenges || 0,
      })
    }

    fetchFriends()
    refreshProfile()
  }

  const rejectFriendRequest = async (requestId: string) => {
    await supabase.from('friends').delete().eq('id', requestId)
    fetchFriends()
  }

  const removeFriend = async (friendId: string) => {
    if (!user) return
    await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

    fetchFriends()
    refreshProfile()
  }

  const incomingRequests = pendingRequests.filter((r) => r.friend_id === user?.id)
  const outgoingRequests = pendingRequests.filter((r) => r.user_id === user?.id)

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Friends</h1>
        <p className="text-sm text-neutral-500 mb-4">{friends.length} friends</p>

        {error && (
          <div className="mb-3 rounded-xl bg-error-50 border border-error-200 px-4 py-2.5 text-sm text-error-700 animate-fade-in">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="card p-4 mb-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">Find Friends</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Search by username..."
              className="input py-2.5 text-sm"
            />
            <button onClick={searchUsers} disabled={searching} className="btn-primary py-2.5 px-4 text-sm whitespace-nowrap">
              {searching ? '...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: result.avatar_color }}
                  >
                    {result.avatar_emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-neutral-900">{result.username}</p>
                    <p className="text-xs text-neutral-500">Level {result.level}</p>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(result.id)}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending requests */}
        {incomingRequests.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-neutral-700 mb-2">Friend Requests ({incomingRequests.length})</h2>
            <div className="space-y-2 mb-4">
              {incomingRequests.map((req) => (
                <div key={req.id} className="card p-3 flex items-center gap-3 animate-fade-in">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: req.friend_profile?.avatar_color || '#1c7af5' }}
                  >
                    {req.friend_profile?.avatar_emoji || '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-neutral-900">{req.friend_profile?.username || 'Unknown'}</p>
                    <p className="text-xs text-neutral-500">Wants to be friends</p>
                  </div>
                  <button onClick={() => acceptFriendRequest(req.id)} className="btn-primary py-1.5 px-3 text-xs">Accept</button>
                  <button onClick={() => rejectFriendRequest(req.id)} className="btn-ghost py-1.5 px-3 text-xs">Reject</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Outgoing requests */}
        {outgoingRequests.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-neutral-700 mb-2">Sent Requests ({outgoingRequests.length})</h2>
            <div className="space-y-2 mb-4">
              {outgoingRequests.map((req) => (
                <div key={req.id} className="card p-3 flex items-center gap-3 opacity-75">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: req.friend_profile?.avatar_color || '#1c7af5' }}
                  >
                    {req.friend_profile?.avatar_emoji || '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-neutral-900">{req.friend_profile?.username || 'Unknown'}</p>
                    <p className="text-xs text-neutral-500">Pending...</p>
                  </div>
                  <button onClick={() => rejectFriendRequest(req.id)} className="text-xs text-neutral-400 hover:text-error-500 font-medium">Cancel</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Friends list */}
        <h2 className="text-sm font-semibold text-neutral-700 mb-2">Your Friends</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-3">
                <div className="shimmer-bg h-12 rounded-xl" />
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-neutral-500 font-medium mb-1">No friends yet</p>
            <p className="text-sm text-neutral-400">Search for users to add as friends!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="card p-3 flex items-center gap-3 animate-fade-in">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: friend.friend_profile?.avatar_color || '#1c7af5' }}
                >
                  {friend.friend_profile?.avatar_emoji || '👤'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-neutral-900">{friend.friend_profile?.username || 'Unknown'}</p>
                  <p className="text-xs text-neutral-500">Level {friend.friend_profile?.level || 1}</p>
                </div>
                <button
                  onClick={() => removeFriend(friend.friend_id)}
                  className="text-xs text-neutral-400 hover:text-error-500 font-medium px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
