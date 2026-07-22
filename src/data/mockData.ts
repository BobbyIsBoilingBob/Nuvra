import type { UserProfile, NotificationItem, DailyReward, Achievement, AdventureHistoryItem } from '@/types/adventure'

export const mockProfile: UserProfile = {
  id: 'demo-user', username: 'Explorer', xp: 2450, coins: 320, gems: 15,
  walking_streak: 7, completed_adventures: 12, avatar_color: '#10b981',
  level: 5, created_at: new Date().toISOString(),
}

export const mockNotifications: NotificationItem[] = [
  { id: 'n1', type: 'reward', title: 'Daily Reward Ready!', message: 'Claim your daily reward now', read: false, created_at: new Date().toISOString() },
  { id: 'n2', type: 'social', title: 'Friend Request', message: 'TrailBlazer wants to be your friend', read: false, created_at: new Date().toISOString() },
  { id: 'n3', type: 'achievement', title: 'Achievement Unlocked!', message: 'You completed 10 adventures!', read: true, created_at: new Date().toISOString() },
  { id: 'n4', type: 'quest', title: 'Quest Complete', message: 'Daily Walk quest finished', read: true, created_at: new Date().toISOString() },
]

export const mockDailyReward: DailyReward = {
  id: 'dr1', last_claim_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], streak: 6,
}

export const mockAchievements: Achievement[] = [
  { id: 'a1', achievement_name: 'First Steps', description: 'Complete your first adventure', icon: 'footprints', unlocked: true, unlocked_at: new Date().toISOString() },
  { id: 'a2', achievement_name: 'Explorer', description: 'Complete 10 adventures', icon: 'compass', unlocked: true, unlocked_at: new Date().toISOString() },
  { id: 'a3', achievement_name: 'Scholar', description: 'Answer 50 trivia questions', icon: 'brain', unlocked: true, unlocked_at: new Date().toISOString() },
  { id: 'a4', achievement_name: 'Photographer', description: 'Complete 20 photo challenges', icon: 'camera', unlocked: false },
  { id: 'a5', achievement_name: 'Mountaineer', description: 'Complete a hard adventure', icon: 'mountain', unlocked: false },
  { id: 'a6', achievement_name: 'Speed Runner', description: 'Finish a speed challenge', icon: 'fire', unlocked: false },
  { id: 'a7', achievement_name: 'Streak Master', description: '7-day walking streak', icon: 'fire', unlocked: true, unlocked_at: new Date().toISOString() },
  { id: 'a8', achievement_name: 'Champion', description: 'Reach level 10', icon: 'trophy', unlocked: false },
]

export const mockHistory: AdventureHistoryItem[] = [
  { id: 'h1', adventure_name: 'Riverside Walk', location_name: 'Thames Path', duration: 28, xp_earned: 150, coins_earned: 60, treasures_found: 3, completed_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'h2', adventure_name: 'City Center Quest', location_name: 'Downtown', duration: 42, xp_earned: 280, coins_earned: 120, treasures_found: 4, completed_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'h3', adventure_name: 'Hilltop Challenge', location_name: 'North Ridge', duration: 55, xp_earned: 400, coins_earned: 180, treasures_found: 5, completed_at: new Date(Date.now() - 259200000).toISOString() },
]
