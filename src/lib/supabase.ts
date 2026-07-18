import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type Profile = {
  id: string; username: string; avatar_emoji: string; avatar_color: string;
  xp: number; level: number; coins: number; gems: number;
  distance_walked: number; steps: number; completed_adventures: number;
  completed_challenges: number; walking_streak: number; treasure_collected: number;
  exploration_percentage: number; last_walk_date: string | null;
  is_online: boolean; last_seen: string | null;
  settings: Record<string, unknown>; created_at: string;
};

export type Friend = { id: string; friend_id: string; created_at: string; profile: Profile };
export type FriendRequest = { id: string; sender_id: string; receiver_id: string; status: 'pending' | 'accepted' | 'declined'; created_at: string; updated_at: string; sender: Profile; receiver: Profile };
export type PartyData = { id: string; name: string; leader_id: string; adventure_id: string | null; status: 'active' | 'completed' | 'disbanded'; created_at: string; members: PartyMember[] };
export type PartyMember = { id: string; party_id: string; user_id: string; role: 'leader' | 'member'; joined_at: string; profile: Profile };
export type QuestProgressRow = { id: string; user_id: string; quest_id: string; progress: number; claimed: boolean; updated_at: string };
export type OwnedItemRow = { id: string; user_id: string; item_id: string; equipped: boolean; acquired_at: string };
export type NotificationRow = { id: string; user_id: string; type: string; title: string; body: string | null; data: Record<string, unknown>; read: boolean; created_at: string };
export type AdventureHistoryRow = {
  id: string; user_id: string; adventure_id: string; adventure_name: string; emoji: string | null;
  type: string | null; difficulty: string | null; distance: number; duration: number;
  xp_earned: number; coins_earned: number; gems_earned: number; treasures_found: number;
  max_combo: number; is_favorite: boolean; completed_at: string;
};

export type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
export type User = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
