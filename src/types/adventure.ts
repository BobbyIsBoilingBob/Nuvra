export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'
export type LocationSource = 'gps' | 'manual' | 'suggested'
export type ChallengeCategory =
  | 'observation' | 'photography' | 'fitness' | 'puzzle' | 'memory'
  | 'navigation' | 'compass' | 'landmarks' | 'nature' | 'collection'
  | 'trivia' | 'timed' | 'team' | 'exploration' | 'balance' | 'reaction'
export type SensorType = 'compass' | 'accelerometer' | 'gyroscope' | 'camera' | 'gps' | 'none'

export interface GeoPoint { lat: number; lng: number }
export interface Checkpoint { index: number; position: GeoPoint; label: string; challenge?: ChallengeAssignment }
export interface ChallengeAssignment {
  id: string; title: string; description: string; category: ChallengeCategory; difficulty: Difficulty;
  sensorType: SensorType; sensorConfig?: Record<string, unknown>; data?: Record<string, unknown>; xp: number; coins: number;
}
export interface AdventureRoute { center: GeoPoint; checkpoints: Checkpoint[]; path: GeoPoint[]; totalDistanceKm: number; estimatedDurationMin: number }
export interface AdventurePreferences { location?: string; maxDistanceKm?: number; minDistanceKm?: number; approxDistanceKm?: number; difficulty: Difficulty; durationMin: number; categories: ChallengeCategory[] }
export interface Adventure {
  id: string; title: string; description: string; difficulty: Difficulty; durationMin: number; distanceKm: number;
  locationName: string; locationSource: LocationSource; center: GeoPoint; checkpoints: Checkpoint[]; path: GeoPoint[];
  preferences: AdventurePreferences; isSuggested?: boolean; createdAt: string;
}
export interface SuggestedAdventure { adventure: Adventure; travelTimeMin: number; travelDistanceKm: number; isNearby: boolean }
export interface SensorAvailability { compass: boolean; accelerometer: boolean; gyroscope: boolean; camera: boolean; gps: boolean }
export interface GpsPosition { lat: number; lng: number; accuracy: number; timestamp: number }
export type GpsStatus = 'idle' | 'locating' | 'located' | 'denied' | 'unavailable'
export type ScreenName =
  | 'home' | 'profile' | 'community' | 'friends' | 'party' | 'leaderboard' | 'challenges' | 'quests'
  | 'history' | 'rewards' | 'inventory' | 'avatar' | 'seasonal' | 'shop' | 'settings'
  | 'creator' | 'generator' | 'preview' | 'map' | 'notifications' | 'login' | 'signup'

export interface UserProfile {
  id: string; username: string; avatar_emoji: string; avatar_color: string; xp: number; level: number;
  coins: number; gems: number; distance_walked: number; steps: number; completed_adventures: number;
  completed_challenges: number; walking_streak: number; treasure_collected: number; exploration_percentage: number;
  last_walk_date: string | null; settings: Record<string, unknown>; is_online: boolean; last_seen: string;
  bio: string | null; created_at: string;
}
export interface FriendRequest { id: string; sender_id: string; receiver_id: string; status: string; created_at: string; updated_at: string; sender?: UserProfile }
export interface NotificationItem { id: string; user_id: string; type: string; title: string; message: string; read: boolean; created_at: string; actor_id: string | null }
export interface AdventureHistoryItem { id: string; adventure_id: string; adventure_name: string; emoji: string; type: string; difficulty: string; distance: number; duration: number; xp_earned: number; coins_earned: number; gems_earned: number; treasures_found: number; max_combo: number; is_favorite: boolean; completed_at: string }
export interface DailyReward { id: string; user_id: string; last_claim_date: string; current_streak: number; total_claimed: number }
export interface Achievement { id: string; user_id: string; achievement_id: string; achievement_name: string; description: string | null; icon: string; unlocked_at: string }
export interface QuestProgress { id: string; user_id: string; quest_id: string; progress: number; claimed: boolean; updated_at: string }
export interface InventoryItem { id: string; user_id: string; item_id: string; item_name: string; item_type: string; quantity: number; rarity: string; icon: string; acquired_at: string }
export interface Party { id: string; name: string; leader_id: string; adventure_id: string | null; status: string; created_at: string }
export interface PartyMember { id: string; party_id: string; user_id: string; role: string; joined_at: string }

export interface Quest { id: string; key: string; title: string; description: string; type: 'daily' | 'weekly'; target: number; progress: number; rewardXp: number; rewardCoins: number; claimed: boolean }
export interface ShopItem { id: string; name: string; description: string; price: number; currency: 'coins' | 'gems'; owned: boolean; rarity?: string }
export interface ActivityFeedItem { id: string; userId: string; userName: string; action: string; target: string; createdAt: string }
export interface SeasonalProgressData { seasonName: string; level: number; xp: number; xpToLevel: number; daysLeft: number; rewards: { name: string; level: number }[] }
export interface Friend { id: string; username: string; avatar_color: string; level: number; xp: number }
