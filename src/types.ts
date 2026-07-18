export type Screen =
  | 'home' | 'auth' | 'onboarding' | 'adventures' | 'adventureDetail'
  | 'adventureMap' | 'adventurePreview' | 'community' | 'aiGenerator'
  | 'creator' | 'profile' | 'friends' | 'quests' | 'questDetail'
  | 'achievements' | 'dailyRewards' | 'challenges' | 'party' | 'shop'
  | 'settings' | 'history' | 'customise' | 'inventory' | 'rewards' | 'seasonal';

export type QuestType = 'distance' | 'checkpoint' | 'challenge';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target?: number;
  lat?: number;
  lng?: number;
  adventureId?: string;
  adventureTitle?: string;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
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
