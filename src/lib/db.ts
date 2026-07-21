import { supabase } from './supabase'
import type {
  UserProfile, FriendRequest, NotificationItem,
  AdventureHistoryItem, DailyReward, Achievement, QuestProgress,
  InventoryItem, Party, PartyMember, Adventure,
} from '@/types/adventure'

export async function searchProfiles(query: string): Promise<UserProfile[]> {
  if (!supabase || !query.trim()) return []
  const { data, error } = await supabase.from('profiles').select('*').ilike('username', `%${query.trim()}%`).limit(20)
  if (error) return []
  return (data || []) as UserProfile[]
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error || !data) return null
  return data as UserProfile
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('profiles').update({ ...updates, last_seen: new Date().toISOString() }).eq('id', updates.id)
  return !error
}

export async function getLeaderboard(limit = 50): Promise<UserProfile[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(limit)
  if (error) return []
  return (data || []) as UserProfile[]
}

export async function getFriends(): Promise<UserProfile[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data: asUser } = await supabase.from('friends').select('friend_id').eq('user_id', user.id).eq('status', 'accepted')
  const { data: asFriend } = await supabase.from('friends').select('user_id').eq('friend_id', user.id).eq('status', 'accepted')
  const friendIds = [...(asUser || []).map(r => r.friend_id), ...(asFriend || []).map(r => r.user_id)]
  if (friendIds.length === 0) return []
  const { data: profiles } = await supabase.from('profiles').select('*').in('id', friendIds)
  return (profiles || []) as UserProfile[]
}

export async function getPendingFriendRequests(): Promise<FriendRequest[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('friend_requests').select(`*, sender:profiles!friend_requests_sender_id_fkey(*)`)
    .eq('receiver_id', user.id).eq('status', 'pending').order('created_at', { ascending: false })
  if (error) return []
  return (data || []) as unknown as FriendRequest[]
}

export async function sendFriendRequest(receiverId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  if (receiverId === user.id) return { error: 'Cannot friend yourself' }
  const { data: existing } = await supabase.from('friend_requests').select('id')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`).maybeSingle()
  if (existing) return { error: 'Request already exists' }
  const { error } = await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' })
  if (error) return { error: error.message }
  await supabase.from('notifications').insert({ user_id: receiverId, type: 'friend_request', title: 'New Friend Request', message: 'Someone wants to be your friend!', actor_id: user.id })
  return { error: null }
}

export async function acceptFriendRequest(requestId: string, senderId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error: updateErr } = await supabase.from('friend_requests').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', requestId)
  if (updateErr) return { error: updateErr.message }
  await supabase.from('friends').insert({ user_id: user.id, friend_id: senderId, status: 'accepted' })
  await supabase.from('friends').insert({ user_id: senderId, friend_id: user.id, status: 'accepted' })
  await supabase.from('notifications').insert({ user_id: senderId, type: 'friend_accepted', title: 'Friend Request Accepted', message: 'You are now friends!', actor_id: user.id })
  return { error: null }
}

export async function declineFriendRequest(requestId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { error } = await supabase.from('friend_requests').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', requestId)
  return { error: error?.message ?? null }
}

export async function removeFriend(friendId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friendId)
  await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', user.id)
  return { error: null }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
  if (error) return []
  return (data || []) as NotificationItem[]
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!supabase) return
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!supabase) return
  await supabase.from('notifications').update({ read: true }).eq('read', false)
}

export async function saveAdventure(adventure: Adventure): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('adventures').insert({
    user_id: user.id, title: adventure.title, description: adventure.description,
    difficulty: adventure.difficulty, duration_min: adventure.durationMin, distance_km: adventure.distanceKm,
    location_name: adventure.locationName, location_source: adventure.locationSource,
    center_lat: adventure.center.lat, center_lng: adventure.center.lng,
    checkpoints: adventure.checkpoints, route_geojson: { path: adventure.path },
    preferences: adventure.preferences, status: 'saved', ai_generated: true,
  })
  return { error: error?.message ?? null }
}

export async function recordAdventureCompletion(opts: {
  adventure: Adventure; xpEarned: number; coinsEarned: number; challengesCompleted: number
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { adventure, xpEarned, coinsEarned, challengesCompleted } = opts
  const { error } = await supabase.from('adventure_history').insert({
    user_id: user.id, adventure_id: adventure.id, adventure_name: adventure.title,
    emoji: 'compass', type: 'ai_generated', difficulty: adventure.difficulty,
    distance: adventure.distanceKm, duration: adventure.durationMin,
    xp_earned: xpEarned, coins_earned: coinsEarned, treasures_found: challengesCompleted,
  })
  if (error) return { error: error.message }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (profile) {
    const newXp = (profile.xp || 0) + xpEarned
    await supabase.from('profiles').update({
      coins: (profile.coins || 0) + coinsEarned,
      gems: (profile.gems || 0) + Math.floor(xpEarned / 100),
      distance_walked: (profile.distance_walked || 0) + adventure.distanceKm,
      completed_adventures: (profile.completed_adventures || 0) + 1,
      completed_challenges: (profile.completed_challenges || 0) + challengesCompleted,
      xp: newXp, level: Math.floor(Math.sqrt(newXp / 100)) + 1,
      last_walk_date: new Date().toISOString().split('T')[0],
      last_seen: new Date().toISOString(),
    }).eq('id', user.id)
  }
  return { error: null }
}

export async function getAdventureHistory(): Promise<AdventureHistoryItem[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('adventure_history').select('*').order('completed_at', { ascending: false }).limit(50)
  if (error) return []
  return (data || []) as AdventureHistoryItem[]
}

export async function getDailyReward(): Promise<DailyReward | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('daily_rewards').select('*').maybeSingle()
  if (error || !data) return null
  return data as DailyReward
}

export async function claimDailyReward(): Promise<{ success: boolean; coins: number; streak: number; error: string | null }> {
  if (!supabase) return { success: false, coins: 0, streak: 0, error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, coins: 0, streak: 0, error: 'Not signed in' }
  const today = new Date().toISOString().split('T')[0]
  const existing = await getDailyReward()
  if (existing) {
    if (existing.last_claim_date === today) return { success: false, coins: 0, streak: existing.current_streak, error: 'Already claimed today' }
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = existing.last_claim_date === yesterday ? existing.current_streak + 1 : 1
    const reward = 50 + (newStreak - 1) * 10
    const { error } = await supabase.from('daily_rewards').update({
      last_claim_date: today, current_streak: newStreak, total_claimed: (existing.total_claimed || 0) + 1, updated_at: new Date().toISOString(),
    }).eq('id', existing.id)
    if (error) return { success: false, coins: 0, streak: 0, error: error.message }
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', user.id).maybeSingle()
    if (profile) await supabase.from('profiles').update({ coins: (profile.coins || 0) + reward }).eq('id', user.id)
    return { success: true, coins: reward, streak: newStreak, error: null }
  } else {
    const reward = 50
    const { error } = await supabase.from('daily_rewards').insert({ user_id: user.id, last_claim_date: today, current_streak: 1, total_claimed: 1 })
    if (error) return { success: false, coins: 0, streak: 0, error: error.message }
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', user.id).maybeSingle()
    if (profile) await supabase.from('profiles').update({ coins: (profile.coins || 0) + reward }).eq('id', user.id)
    return { success: true, coins: reward, streak: 1, error: null }
  }
}

export const DAILY_QUESTS = [
  { key: 'daily_walk', title: 'Daily Explorer', desc: 'Complete 1 adventure today', target: 1, xp: 50, coins: 25 },
  { key: 'daily_challenges', title: 'Challenge Master', desc: 'Complete 3 challenges today', target: 3, xp: 75, coins: 40 },
  { key: 'daily_distance', title: 'Distance Walker', desc: 'Walk 2 km today', target: 2, xp: 60, coins: 30 },
]

export const WEEKLY_QUESTS = [
  { key: 'weekly_adventures', title: 'Weekend Warrior', desc: 'Complete 3 adventures this week', target: 3, xp: 200, coins: 100 },
  { key: 'weekly_distance', title: 'Long Hauler', desc: 'Walk 15 km this week', target: 15, xp: 300, coins: 150 },
  { key: 'weekly_challenges', title: 'Challenge Champion', desc: 'Complete 20 challenges this week', target: 20, xp: 250, coins: 120 },
]

export async function getQuestProgress(): Promise<QuestProgress[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('quest_progress').select('*')
  if (error) return []
  return (data || []) as QuestProgress[]
}

export async function claimQuestReward(questId: string, xp: number, coins: number): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error: qErr } = await supabase.from('quest_progress').update({ claimed: true }).eq('quest_id', questId).eq('user_id', user.id)
  if (qErr) return { error: qErr.message }
  const { data: profile } = await supabase.from('profiles').select('xp, coins').eq('id', user.id).maybeSingle()
  if (profile) await supabase.from('profiles').update({ xp: (profile.xp || 0) + xp, coins: (profile.coins || 0) + coins }).eq('id', user.id)
  return { error: null }
}

export const ACHIEVEMENT_DEFS = [
  { key: 'first_adventure', name: 'First Steps', desc: 'Complete your first adventure', icon: 'target', target: 1 },
  { key: 'adventures_5', name: 'Trail Blazer', desc: 'Complete 5 adventures', icon: 'footprints', target: 5 },
  { key: 'adventures_25', name: 'Seasoned Explorer', desc: 'Complete 25 adventures', icon: 'map', target: 25 },
  { key: 'adventures_50', name: 'Master Adventurer', desc: 'Complete 50 adventures', icon: 'trophy', target: 50 },
  { key: 'distance_10', name: 'Walker', desc: 'Walk 10 km total', icon: 'footprints', target: 10 },
  { key: 'distance_50', name: 'Hiker', desc: 'Walk 50 km total', icon: 'mountain', target: 50 },
  { key: 'distance_100', name: 'Marathon Walker', desc: 'Walk 100 km total', icon: 'medal', target: 100 },
  { key: 'challenges_10', name: 'Challenge Taker', desc: 'Complete 10 challenges', icon: 'sword', target: 10 },
  { key: 'challenges_50', name: 'Challenge Master', desc: 'Complete 50 challenges', icon: 'star', target: 50 },
  { key: 'challenges_100', name: 'Challenge Legend', desc: 'Complete 100 challenges', icon: 'crown', target: 100 },
  { key: 'streak_3', name: 'On Fire', desc: '3-day walking streak', icon: 'flame', target: 3 },
  { key: 'streak_7', name: 'Week Warrior', desc: '7-day walking streak', icon: 'zap', target: 7 },
  { key: 'streak_30', name: 'Unstoppable', desc: '30-day walking streak', icon: 'gem', target: 30 },
]

export async function getAchievements(): Promise<Achievement[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('achievements').select('*').order('unlocked_at', { ascending: false })
  if (error) return []
  return (data || []) as Achievement[]
}

export async function getInventory(): Promise<InventoryItem[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('inventory_items').select('*').order('acquired_at', { ascending: false })
  if (error) return []
  return (data || []) as InventoryItem[]
}

export async function getParties(): Promise<Party[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data: memberships } = await supabase.from('party_members').select('party_id').eq('user_id', user.id)
  if (!memberships || memberships.length === 0) return []
  const partyIds = memberships.map(m => m.party_id)
  const { data, error } = await supabase.from('parties').select('*').in('id', partyIds).order('created_at', { ascending: false })
  if (error) return []
  return (data || []) as Party[]
}

export async function createParty(name: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: party, error: pErr } = await supabase.from('parties').insert({ name, leader_id: user.id, status: 'active' }).select().single()
  if (pErr) return { error: pErr.message }
  const { error: mErr } = await supabase.from('party_members').insert({ party_id: party.id, user_id: user.id, role: 'leader' })
  if (mErr) return { error: mErr.message }
  return { error: null }
}

export async function getPartyMembers(partyId: string): Promise<(PartyMember & { profile?: UserProfile })[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('party_members').select(`*, profile:profiles!party_members_user_id_fkey(*)`).eq('party_id', partyId)
  if (error) return []
  return (data || []) as unknown as (PartyMember & { profile?: UserProfile })[]
}

export async function getActivityFeed(limit = 20): Promise<{ id: string; activity_type: string; description: string | null; metadata: Record<string, unknown>; created_at: string; user_id: string }[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(limit)
  if (error) return []
  return (data || []) as { id: string; activity_type: string; description: string | null; metadata: Record<string, unknown>; created_at: string; user_id: string }[]
}

export async function getSeasonalProgress(): Promise<{ adventures_completed: number; distance_walked: number; target_adventures: number; target_distance: number; reward_claimed: boolean } | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('seasonal_progress').select('*').maybeSingle()
  if (error || !data) return null
  return { adventures_completed: data.adventures_completed, distance_walked: data.distance_walked, target_adventures: data.target_adventures, target_distance: data.target_distance, reward_claimed: data.reward_claimed }
}
