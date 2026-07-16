export interface Profile {
  id: string
  username: string
  avatar_emoji: string
  avatar_color: string
  xp: number
  level: number
  coins: number
  distance_walked: number
  steps: number
  completed_adventures: number
  completed_challenges: number
  walking_streak: number
  treasure_collected: number
  exploration_percentage: number
  last_walk_date: string | null
  settings: UserSettings
  created_at: string
}

export interface UserSettings {
  mapType?: 'street' | 'satellite'
  units?: 'metric' | 'imperial'
  shareLocation?: boolean
  notifications?: boolean
  soundEffects?: boolean
}

export interface Adventure {
  id: string
  user_id: string
  type: 'treasure_hunt' | 'distance_walk' | 'checkpoint' | 'exploration'
  status: 'active' | 'completed' | 'abandoned'
  target_distance: number | null
  target_steps: number | null
  waypoints: Waypoint[]
  reward_xp: number
  reward_coins: number
  reward_item: string | null
  created_at: string
  completed_at: string | null
}

export interface Waypoint {
  lat: number
  lng: number
  label: string
  reached: boolean
}

export interface Challenge {
  id: string
  user_id: string
  type: 'daily_steps' | 'daily_distance' | 'weekly_adventures' | 'streak'
  title: string
  description: string
  target: number
  progress: number
  status: 'active' | 'completed' | 'expired'
  reward_xp: number
  reward_coins: number
  expires_at: string | null
  created_at: string
  completed_at: string | null
}

export interface InventoryItem {
  id: string
  user_id: string
  item_id: string
  item_name: string
  item_type: 'treasure' | 'cosmetic' | 'consumable' | 'badge'
  quantity: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: string
  acquired_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_id: string
  achievement_name: string
  description: string
  icon: string
  unlocked_at: string
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'achievement' | 'friend_request' | 'friend_accepted' | 'level_up' | 'reward' | 'adventure' | 'challenge' | 'info'
  title: string
  message: string | null
  read: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  activity_type: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface PlayerLocation {
  id: string
  user_id: string
  latitude: number
  longitude: number
  heading: number | null
  updated_at: string
}

export interface LeaderboardEntry {
  id: string
  username: string
  avatar_emoji: string
  avatar_color: string
  xp: number
  level: number
  distance_walked: number
  completed_adventures: number
}
