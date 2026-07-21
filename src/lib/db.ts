import { supabase } from './supabase'
import type { UserProfile, FriendRequest, NotificationItem, AdventureHistoryItem, DailyReward, Achievement, QuestProgress, InventoryItem, Party, Adventure, GeoPoint, SensorAvailability, AdventurePreferences, ChallengeCategory, Difficulty } from '@/types/adventure'

export async function searchProfiles(q: string): Promise<UserProfile[]> {
  if (!supabase || !q.trim()) return []
  const { data } = await supabase.from('profiles').select('*').ilike('username', `%${q.trim()}%`).limit(20)
  return (data || []) as UserProfile[]
}
export async function getProfile(uid: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
  return data as UserProfile | null
}
export async function updateProfile(u: Partial<UserProfile>): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('profiles').update({ ...u, last_seen: new Date().toISOString() }).eq('id', u.id)
  return !error
}
export async function getLeaderboard(limit = 50): Promise<UserProfile[]> {
  if (!supabase) return []
  const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(limit)
  return (data || []) as UserProfile[]
}
export async function getFriends(): Promise<UserProfile[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return []
  const { data: au } = await supabase.from('friends').select('friend_id').eq('user_id', user.id).eq('status', 'accepted')
  const { data: af } = await supabase.from('friends').select('user_id').eq('friend_id', user.id).eq('status', 'accepted')
  const ids = [...(au || []).map((r: any) => r.friend_id), ...(af || []).map((r: any) => r.user_id)]
  if (ids.length === 0) return []
  const { data: p } = await supabase.from('profiles').select('*').in('id', ids)
  return (p || []) as UserProfile[]
}
export async function getPendingFriendRequests(): Promise<FriendRequest[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return []
  const { data } = await supabase.from('friend_requests').select(`*, sender:profiles!friend_requests_sender_id_fkey(*)`).eq('receiver_id', user.id).eq('status', 'pending').order('created_at', { ascending: false })
  return (data || []) as unknown as FriendRequest[]
}
export async function sendFriendRequest(rid: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: 'Not signed in' }
  if (rid === user.id) return { error: 'Cannot friend yourself' }
  const { data: ex } = await supabase.from('friend_requests').select('id').or(`and(sender_id.eq.${user.id},receiver_id.eq.${rid}),and(sender_id.eq.${rid},receiver_id.eq.${user.id})`).maybeSingle()
  if (ex) return { error: 'Request already exists' }
  const { error } = await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: rid, status: 'pending' })
  if (error) return { error: error.message }
  await supabase.from('notifications').insert({ user_id: rid, type: 'friend_request', title: 'New Friend Request', message: 'Someone wants to be your friend!', actor_id: user.id })
  return { error: null }
}
export async function acceptFriendRequest(rid: string, sid: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: 'Not signed in' }
  const { error: ue } = await supabase.from('friend_requests').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', rid)
  if (ue) return { error: ue.message }
  await supabase.from('friends').insert({ user_id: user.id, friend_id: sid, status: 'accepted' })
  await supabase.from('friends').insert({ user_id: sid, friend_id: user.id, status: 'accepted' })
  await supabase.from('notifications').insert({ user_id: sid, type: 'friend_accepted', title: 'Friend Request Accepted', message: 'You are now friends!', actor_id: user.id })
  return { error: null }
}
export async function declineFriendRequest(rid: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { error } = await supabase.from('friend_requests').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', rid)
  return { error: error?.message ?? null }
}
export async function removeFriend(fid: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: 'Not signed in' }
  await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', fid)
  await supabase.from('friends').delete().eq('user_id', fid).eq('friend_id', user.id)
  return { error: null }
}
export async function getNotifications(): Promise<NotificationItem[]> {
  if (!supabase) return []
  const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
  return (data || []) as NotificationItem[]
}
export async function markNotificationRead(id: string): Promise<void> { if (supabase) await supabase.from('notifications').update({ read: true }).eq('id', id) }
export async function markAllNotificationsRead(): Promise<void> { if (supabase) await supabase.from('notifications').update({ read: true }).eq('read', false) }
export async function saveAdventure(a: Adventure): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('adventures').insert({ user_id: user.id, title: a.title, description: a.description, difficulty: a.difficulty, duration_min: a.durationMin, distance_km: a.distanceKm, location_name: a.locationName, location_source: a.locationSource, center_lat: a.center.lat, center_lng: a.center.lng, checkpoints: a.checkpoints, route_geojson: { path: a.path }, preferences: a.preferences, status: 'saved', ai_generated: true })
  return { error: error?.message ?? null }
}
export async function recordAdventureCompletion(opts: { adventure: Adventure; xpEarned: number; coinsEarned: number; challengesCompleted: number }): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: 'Not signed in' }
  const { adventure, xpEarned, coinsEarned, challengesCompleted } = opts
  const { error } = await supabase.from('adventure_history').insert({ user_id: user.id, adventure_id: adventure.id, adventure_name: adventure.title, emoji: 'compass', type: 'ai_generated', difficulty: adventure.difficulty, distance: adventure.distanceKm, duration: adventure.durationMin, xp_earned: xpEarned, coins_earned: coinsEarned, treasures_found: challengesCompleted })
  if (error) return { error: error.message }
  const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (p) {
    const nx = (p.xp || 0) + xpEarned, today = new Date().toISOString().split('T')[0], yest = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const ns = p.last_walk_date === yest ? (p.walking_streak || 0) + 1 : 1
    await supabase.from('profiles').update({ coins: (p.coins || 0) + coinsEarned, gems: (p.gems || 0) + Math.floor(xpEarned / 100), distance_walked: (p.distance_walked || 0) + adventure.distanceKm, completed_adventures: (p.completed_adventures || 0) + 1, completed_challenges: (p.completed_challenges || 0) + challengesCompleted, xp: nx, level: Math.floor(Math.sqrt(nx / 100)) + 1, walking_streak: ns, last_walk_date: today, last_seen: new Date().toISOString() }).eq('id', user.id)
    await supabase.from('activity_log').insert({ user_id: user.id, activity_type: 'adventure_completed', description: `Completed ${adventure.title}`, metadata: { xp: xpEarned, coins: coinsEarned, challenges: challengesCompleted } })
  }
  return { error: null }
}
export async function getAdventureHistory(): Promise<AdventureHistoryItem[]> {
  if (!supabase) return []
  const { data } = await supabase.from('adventure_history').select('*').order('completed_at', { ascending: false }).limit(50)
  return (data || []) as AdventureHistoryItem[]
}
export async function getDailyReward(): Promise<DailyReward | null> {
  if (!supabase) return null
  const { data } = await supabase.from('daily_rewards').select('*').maybeSingle()
  return data as DailyReward | null
}
export async function claimDailyReward(): Promise<{ success: boolean; coins: number; streak: number; error: string | null }> {
  if (!supabase) return { success: false, coins: 0, streak: 0, error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { success: false, coins: 0, streak: 0, error: 'Not signed in' }
  const today = new Date().toISOString().split('T')[0]
  const ex = await getDailyReward()
  if (ex) {
    if (ex.last_claim_date === today) return { success: false, coins: 0, streak: ex.current_streak, error: 'Already claimed today' }
    const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const ns = ex.last_claim_date === yest ? ex.current_streak + 1 : 1
    const reward = 50 + (ns - 1) * 10
    const { error } = await supabase.from('daily_rewards').update({ last_claim_date: today, current_streak: ns, total_claimed: (ex.total_claimed || 0) + 1, updated_at: new Date().toISOString() }).eq('id', ex.id)
    if (error) return { success: false, coins: 0, streak: 0, error: error.message }
    const { data: p } = await supabase.from('profiles').select('coins').eq('id', user.id).maybeSingle()
    if (p) await supabase.from('profiles').update({ coins: (p.coins || 0) + reward }).eq('id', user.id)
    return { success: true, coins: reward, streak: ns, error: null }
  } else {
    const reward = 50
    const { error } = await supabase.from('daily_rewards').insert({ user_id: user.id, last_claim_date: today, current_streak: 1, total_claimed: 1 })
    if (error) return { success: false, coins: 0, streak: 0, error: error.message }
    const { data: p } = await supabase.from('profiles').select('coins').eq('id', user.id).maybeSingle()
    if (p) await supabase.from('profiles').update({ coins: (p.coins || 0) + reward }).eq('id', user.id)
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
  const { data } = await supabase.from('quest_progress').select('*')
  return (data || []) as QuestProgress[]
}
export async function claimQuestReward(qid: string, xp: number, coins: number): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: 'Not signed in' }
  const { error: qe } = await supabase.from('quest_progress').update({ claimed: true }).eq('quest_id', qid).eq('user_id', user.id)
  if (qe) return { error: qe.message }
  const { data: p } = await supabase.from('profiles').select('xp, coins').eq('id', user.id).maybeSingle()
  if (p) await supabase.from('profiles').update({ xp: (p.xp || 0) + xp, coins: (p.coins || 0) + coins }).eq('id', user.id)
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
  const { data } = await supabase.from('achievements').select('*').order('unlocked_at', { ascending: false })
  return (data || []) as Achievement[]
}
export async function getInventory(): Promise<InventoryItem[]> {
  if (!supabase) return []
  const { data } = await supabase.from('inventory_items').select('*').order('acquired_at', { ascending: false })
  return (data || []) as InventoryItem[]
}
export async function getParties(): Promise<Party[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return []
  const { data: m } = await supabase.from('party_members').select('party_id').eq('user_id', user.id)
  if (!m || m.length === 0) return []
  const { data } = await supabase.from('parties').select('*').in('id', m.map((x: any) => x.party_id)).order('created_at', { ascending: false })
  return (data || []) as Party[]
}
export async function createParty(name: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not configured' }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: 'Not signed in' }
  const { data: party, error: pe } = await supabase.from('parties').insert({ name, leader_id: user.id, status: 'active' }).select().single()
  if (pe) return { error: pe.message }
  const { error: me } = await supabase.from('party_members').insert({ party_id: party.id, user_id: user.id, role: 'leader' })
  if (me) return { error: me.message }
  return { error: null }
}
export async function getActivityFeed(limit = 20) {
  if (!supabase) return []
  const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(limit)
  return (data || []) as any[]
}
export async function getSeasonalProgress() {
  if (!supabase) return null
  const { data } = await supabase.from('seasonal_progress').select('*').maybeSingle()
  if (!data) return null
  return { adventures_completed: data.adventures_completed, distance_walked: data.distance_walked, target_adventures: data.target_adventures, target_distance: data.target_distance, reward_claimed: data.reward_claimed }
}
