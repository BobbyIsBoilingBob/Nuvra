export type Screen =
  | 'home' | 'auth' | 'onboarding' | 'adventures' | 'adventureDetail'
  | 'adventureMap' | 'adventurePreview' | 'community' | 'aiGenerator'
  | 'creator' | 'profile' | 'friends' | 'quests' | 'questDetail'
  | 'achievements' | 'dailyRewards' | 'challenges' | 'party' | 'shop'
  | 'settings' | 'history' | 'customise' | 'inventory' | 'rewards' | 'seasonal'
  | 'leaderboard';

export type QuestType = 'distance' | 'checkpoint' | 'challenge';

export type ChallengeKind =
  | 'observation' | 'photography' | 'fitness' | 'puzzle' | 'memory'
  | 'navigation' | 'compass' | 'landmark' | 'nature' | 'collection'
  | 'trivia' | 'timed' | 'team' | 'exploration' | 'balance' | 'reaction'
  | 'motion' | 'rotation' | 'altitude' | 'location' | 'direction';

export type SensorType =
  | 'none' | 'accelerometer' | 'gyroscope' | 'compass' | 'gps' | 'camera' | 'altitude';

export interface ChallengeSpec {
  kind: ChallengeKind;
  title: string;
  description: string;
  sensor?: SensorType;
  target?: string;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target?: number;
  lat?: number;
  lng?: number;
  challenge?: ChallengeSpec;
  adventureId?: string;
  adventureTitle?: string;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  durationMin: number;
  distanceKm: number;
  startLat: number;
  startLng: number;
  quests: Quest[];
  rewards: Reward;
  imageUrl?: string;
  tags: string[];
  creator?: string;
  aiGenerated?: boolean;
  locationName?: string;
}

export interface Reward { xp: number; coins: number; items?: string[]; achievements?: string[]; }

export interface Profile {
  id: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  avatar?: string;
  avatarColor?: string;
  createdAt?: string;
}

export interface GeoPoint { lat: number; lng: number; }

export interface InventoryItem {
  id: string;
  name: string;
  type: 'cosmetic' | 'boost' | 'consumable';
  icon?: string;
  quantity: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  unlockedAt?: string;
}

export interface DailyReward {
  day: number;
  claimed: boolean;
  reward: { coins?: number; xp?: number; item?: string };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: Reward;
  type?: string;
  status?: string;
}

export interface Friend { id: string; username: string; avatar?: string; status: 'online' | 'offline' | 'in-adventure'; }
export interface FriendRequest { id: string; fromUserId: string; fromUsername: string; toUserId: string; createdAt: string; }
export interface Notification { id: string; title: string; body: string; read: boolean; createdAt: string; }
export interface ShopItem { id: string; name: string; description: string; price: number; type: 'cosmetic' | 'boost' | 'consumable'; icon?: string; }
export interface HistoryEntry { id: string; adventureId: string; adventureTitle: string; completedAt: string; distance: number; duration: number; xp: number; coins: number; }
export interface LeaderboardEntry { id: string; username: string; xp: number; level: number; avatar?: string; }

export interface PartyInfo {
  id: string;
  name: string;
  leaderId: string;
  status: string;
  members: { userId: string; username: string; role: string }[];
}

export interface UserSettings {
  notifications: boolean;
  mapPreference: 'standard' | 'satellite';
  privacy: 'public' | 'friends' | 'private';
}

export interface SeasonalProgress {
  seasonId: string;
  seasonName: string;
  adventuresCompleted: number;
  distanceWalked: number;
  targetAdventures: number;
  targetDistance: number;
  rewardClaimed: boolean;
}

export interface GeneratorOptions {
  prompt?: string;
  location?: string;
  maxDistanceKm?: number;
  minDistanceKm?: number;
  approxDistanceKm?: number;
  difficulty?: Adventure['difficulty'];
  challengeTypes?: ChallengeKind[];
  durationMin?: number;
  center?: GeoPoint;
}

export interface NearbyAdventure {
  id: string;
  title: string;
  description: string;
  difficulty: Adventure['difficulty'];
  durationMin: number;
  distanceKm: number;
  startLat: number;
  startLng: number;
  travelMin: number;
  imageUrl?: string;
  tags: string[];
  quests: Quest[];
  rewards: Reward;
  locationName: string;
}
