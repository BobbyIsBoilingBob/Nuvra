import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  username: string;
  avatar_emoji: string;
  avatar_color: string;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  distance_walked: number;
  steps: number;
  completed_adventures: number;
  completed_challenges: number;
  walking_streak: number;
  treasure_collected: number;
  exploration_percentage: number;
  last_walk_date: string | null;
  is_online: boolean;
  last_seen: string | null;
  settings: Record<string, unknown>;
  created_at: string;
};

export type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
export type User = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
