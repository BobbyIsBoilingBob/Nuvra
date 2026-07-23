import type { UserProfile, NotificationItem, DailyReward, Achievement, AdventureHistoryItem, Adventure } from '@/types/adventure'
import { mockProfile, mockNotifications, mockDailyReward, mockAchievements, mockHistory } from '@/data/mockData'
import { supabase } from './supabase'

export async function getProfile(uid: string): Promise<UserProfile | null> {
  if (!supabase) return mockProfile
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
  return data as UserProfile | null
}
export async function updateProfile(updates: Partial<UserProfile> & { id: string }): Promise<boolean> {
  if (!supabase) return true
  const { error } = await supabase.from('profiles').update(updates).eq('id', updates.id)
  return !error
}
export async function getNotifications(): Promise<NotificationItem[]> {
  if (!supabase) return mockNotifications
  const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)
  return (data as NotificationItem[]) || []
}
export async function markNotificationRead(id: string): Promise<void> { if (supabase) await supabase.from('notifications').update({ read: true }).eq('id', id) }
export async function getDailyReward(): Promise<DailyReward | null> {
  if (!supabase) return mockDailyReward
  const { data } = await supabase.from('daily_rewards').select('*').limit(1).maybeSingle()
  return data as DailyReward | null
}
export async function claimDailyReward(): Promise<{ xp: number; coins: number } | null> { return { xp: 100, coins: 50 } }
export async function getAchievements(): Promise<Achievement[]> {
  if (!supabase) return mockAchievements
  const { data } = await supabase.from('achievements').select('*').order('unlocked', { ascending: false })
  return (data as Achievement[]) || []
}
export async function getAdventureHistory(): Promise<AdventureHistoryItem[]> {
  if (!supabase) return mockHistory
  const { data } = await supabase.from('adventure_history').select('*').order('completed_at', { ascending: false }).limit(20)
  return (data as AdventureHistoryItem[]) || []
}
export async function saveAdventure(adv: Adventure): Promise<{ error: string | null }> {
  if (!supabase) return { error: null }
  const { error } = await supabase.from('adventures').insert(adv)
  return { error: error?.message ?? null }
}
export async function recordAdventureCompletion(data: { adventure: Adventure; xpEarned: number; coinsEarned: number; challengesCompleted: number }): Promise<void> {
  if (!supabase) return
  await supabase.from('adventure_history').insert({ adventure_name: data.adventure.locationName, location_name: data.adventure.locationName, duration: data.adventure.durationMin, xp_earned: data.xpEarned, coins_earned: data.coinsEarned, treasures_found: data.challengesCompleted, completed_at: new Date().toISOString() })
}
