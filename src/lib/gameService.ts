import { supabase } from './supabase'
import { levelFromXp, ACHIEVEMENT_DEFINITIONS, TREASURE_ITEMS, type AchievementProgress } from './gameData'
import type { Profile, Notification } from '../types'

export async function addXpAndCoins(
  userId: string,
  xp: number,
  coins: number
): Promise<{ newLevel: number; leveledUp: boolean; profile: Profile | null }> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !profile) {
    return { newLevel: 1, leveledUp: false, profile: null }
  }

  const oldLevel = profile.level
  const newXp = profile.xp + xp
  const newLevel = levelFromXp(newXp)
  const leveledUp = newLevel > oldLevel

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      xp: newXp,
      level: newLevel,
      coins: profile.coins + coins,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Failed to update XP/coins:', updateError)
  }

  if (leveledUp) {
    await createNotification(userId, 'level_up', 'Level Up!', `You reached level ${newLevel}!`)
    await logActivity(userId, 'level_up', `Reached level ${newLevel}`, { level: newLevel })
  }

  const updatedProfile = { ...profile, xp: newXp, level: newLevel, coins: profile.coins + coins }
  return { newLevel, leveledUp, profile: updatedProfile }
}

export async function updateProfileStats(
  userId: string,
  updates: Partial<Profile>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    console.error('Failed to update profile stats:', error)
  }
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, message })

  if (error) {
    console.error('Failed to create notification:', error)
  }
}

export async function logActivity(
  userId: string,
  activityType: string,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase
    .from('activity_log')
    .insert({ user_id: userId, activity_type: activityType, description, metadata })

  if (error) {
    console.error('Failed to log activity:', error)
  }
}

export async function addInventoryItem(
  userId: string,
  itemId: string,
  itemName: string,
  itemType: 'treasure' | 'cosmetic' | 'consumable' | 'badge',
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  icon: string,
  quantity: number = 1
): Promise<void> {
  // Check if item already exists (stack if same type)
  const { data: existing } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('inventory_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('inventory_items')
      .insert({
        user_id: userId,
        item_id: itemId,
        item_name: itemName,
        item_type: itemType,
        rarity,
        icon,
        quantity,
      })
  }
}

export async function getRandomTreasure(): Promise<{ itemId: string; itemName: string; icon: string; rarity: string } | null> {
  const weighted = TREASURE_ITEMS.map((t) => ({
    ...t,
    weight: t.rarity === 'common' ? 50 : t.rarity === 'rare' ? 25 : t.rarity === 'epic' ? 15 : 5,
  }))

  const totalWeight = weighted.reduce((sum, t) => sum + t.weight, 0)
  let random = Math.random() * totalWeight

  for (const t of weighted) {
    random -= t.weight
    if (random <= 0) {
      return { itemId: t.item_id, itemName: t.item_name, icon: t.icon, rarity: t.rarity }
    }
  }

  return null
}

export async function checkAchievements(
  userId: string,
  progress: AchievementProgress
): Promise<string[]> {
  const { data: existingAchievements } = await supabase
    .from('achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const existingIds = new Set(existingAchievements?.map((a) => a.achievement_id) || [])

  const newlyUnlocked: string[] = []

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (existingIds.has(def.id)) continue
    if (def.condition(progress)) {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: userId,
          achievement_id: def.id,
          achievement_name: def.name,
          description: def.description,
          icon: def.icon,
        })

      if (!error) {
        newlyUnlocked.push(def.id)
        await createNotification(userId, 'achievement', 'Achievement Unlocked!', `${def.icon} ${def.name}: ${def.description}`)
        await logActivity(userId, 'achievement_unlocked', `Unlocked: ${def.name}`, { achievement_id: def.id })
      }
    }
  }

  return newlyUnlocked
}

export async function updateWalkingStats(
  userId: string,
  distanceDelta: number,
  stepsDelta: number
): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (!profile) return

  const today = new Date().toISOString().split('T')[0]
  const lastWalk = profile.last_walk_date

  let newStreak = profile.walking_streak
  if (lastWalk !== today) {
    if (lastWalk) {
      const lastDate = new Date(lastWalk)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        newStreak = profile.walking_streak + 1
      } else if (diffDays > 1) {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }
  }

  await supabase
    .from('profiles')
    .update({
      distance_walked: profile.distance_walked + distanceDelta,
      steps: profile.steps + stepsDelta,
      walking_streak: newStreak,
      last_walk_date: today,
    })
    .eq('id', userId)
}
