import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type Profile = {
  id: string; username: string; avatar_emoji: string; avatar_color: string;
  xp: number; level: number; coins: number; gems: number; distance_walked: number;
  steps: number; completed_adventures: number; completed_challenges: number;
  walking_streak: number; treasure_collected: number; exploration_percentage: number;
  last_walk_date: string | null; settings: Record<string, unknown>;
  created_at: string; is_online: boolean; last_seen: string | null;
  onboarding_complete?: boolean; daily_streak?: number; last_reward_day?: number;
};

export type Friend = { id: string; user_id: string; friend_id: string; created_at: string };
export type FriendRequest = { id: string; sender_id: string; receiver_id: string; status: 'pending' | 'accepted' | 'declined'; created_at: string };
export type PartyData = { id: string; name: string; leader_id: string; status: 'active' | 'completed' | 'disbanded'; created_at: string; members: PartyMember[] };
export type PartyMember = { id: string; party_id: string; user_id: string; role: 'leader' | 'member'; joined_at: string; profile: Profile };
export type QuestProgressRow = { id: string; user_id: string; quest_id: string; adventure_id: string; progress: number; completed: boolean; completed_at: string | null };
export type OwnedItemRow = { id: string; user_id: string; item_id: string; equipped: boolean; category: string };
export type NotificationRow = { id: string; user_id: string; actor_id: string | null; type: string; title: string; message: string | null; read: boolean; created_at: string };
export type AdventureHistoryRow = { id: string; user_id: string; adventure_id: string; adventure_name: string; distance: number; duration: number; xp: number; rating: number | null; completed_at: string };
