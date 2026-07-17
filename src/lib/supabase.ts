import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type Profile = {
  id: string;
  username: string;
  avatar_emoji: string;
  avatar_color: string;
  xp: number;
  level: number;
  coins: number;
  distance_walked: number;
  steps: number;
  completed_adventures: number;
  completed_challenges: number;
  walking_streak: number;
  treasure_collected: number;
  exploration_percentage: number;
  last_walk_date: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  is_online?: boolean;
  last_seen?: string;
  bio?: string | null;
};

export type Friendship = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};
