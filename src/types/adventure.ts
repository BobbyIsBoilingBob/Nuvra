export type ScreenName = 'home'|'generator'|'profile'|'community'|'friends'|'party'|'leaderboard'|'challenges'|'quests'|'history'|'rewards'|'inventory'|'avatar'|'seasonal'|'shop'|'settings'|'creator'|'notifications'
export type GpsStatus = 'idle'|'locating'|'located'|'error'
export type Difficulty = 'easy'|'medium'|'hard'|'extreme'
export type ChallengeCategory = 'trivia'|'photo'|'puzzle'|'fitness'|'exploration'|'riddle'|'compass'|'speed'

export interface GpsPosition { lat: number; lng: number; accuracy?: number; heading?: number; speed?: number }
export interface SensorAvailability { gps: boolean; compass: boolean; accelerometer: boolean }
export interface Challenge { id: string; title: string; description: string; category: ChallengeCategory; xp: number; coins: number; question?: string; options?: string[]; answerIndex?: number; targetSteps?: number; targetHeading?: number; photoPrompt?: string; riddleText?: string; riddleAnswer?: string; timeLimitSec?: number }
export interface Checkpoint { position: { lat: number; lng: number }; challenge?: Challenge; title?: string }
export interface Adventure { id: string; locationName: string; description: string; center: { lat: number; lng: number }; checkpoints: Checkpoint[]; difficulty: Difficulty; durationMin: number; distanceKm: number; locationSource: 'gps'|'manual'|'suggested'; createdAt?: string }
export interface AdventurePreferences { difficulty: Difficulty; durationMin: number; checkpointCount: number; categories: ChallengeCategory[] }
export interface SuggestedAdventure { adventure: Adventure; travelTimeMin: number }
export interface UserProfile { id: string; username: string; xp: number; coins: number; gems: number; walking_streak: number; completed_adventures: number; avatar_color: string; level: number; created_at?: string }
export interface NotificationItem { id: string; type: string; title: string; message: string; read: boolean; created_at: string }
export interface DailyReward { id: string; last_claim_date: string; streak: number }
export interface Achievement { id: string; achievement_name: string; description: string; icon: string; unlocked: boolean; unlocked_at?: string }
export interface AdventureHistoryItem { id: string; adventure_name: string; location_name: string; duration: number; xp_earned: number; coins_earned: number; treasures_found: number; completed_at: string }
export interface CommunityAdventure { id: string; name: string; author: string; author_avatar: string; location: string; difficulty: Difficulty; rating: number; plays: number; distanceKm: number; durationMin: number; description: string; checkpoints: number }
export interface Friend { id: string; username: string; avatar_color: string; level: number; xp: number; status: 'online'|'offline'|'in_adventure'; current_activity?: string }
export interface PartyMember { id: string; username: string; avatar_color: string; level: number; status: 'ready'|'in_adventure'; role: 'leader'|'member' }
export interface LeaderboardEntry { id: string; rank: number; username: string; avatar_color: string; level: number; xp: number; weekly_xp: number }
export interface Quest { id: string; title: string; description: string; progress: number; target: number; xp: number; coins: number; type: string; expires_at?: string }
export interface InventoryItem { id: string; name: string; description: string; icon: string; quantity: number; rarity: 'common'|'rare'|'epic'|'legendary' }
export interface ShopItem { id: string; name: string; description: string; icon: string; price: number; currency: 'coins'|'gems'; category: string; owned: boolean }
export interface SeasonalEvent { id: string; name: string; description: string; icon: string; progress: number; target: number; reward_xp: number; reward_coins: number; ends_at: string }
