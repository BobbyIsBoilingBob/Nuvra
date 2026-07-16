/*
# Create profiles table for Nuvra

1. New Tables
- `profiles`: Stores each user's game profile data — XP, level, coins, avatar, cosmetics, settings.
  - `id` (uuid, PK, references auth.users) — one row per auth user
  - `username` (text, unique, not null) — display name
  - `avatar_emoji` (text, default '🧭') — avatar representation
  - `avatar_color` (text, default '#1c7af5') — avatar background color
  - `xp` (int, default 0) — experience points
  - `level` (int, default 1) — player level
  - `coins` (int, default 1000) — in-game currency, starts at 1000
  - `distance_walked` (float, default 0) — total distance in meters
  - `steps` (int, default 0) — total step count
  - `completed_adventures` (int, default 0) — count of finished adventures
  - `completed_challenges` (int, default 0) — count of finished challenges
  - `walking_streak` (int, default 0) — consecutive days walked
  - `treasure_collected` (int, default 0) — treasures found
  - `exploration_percentage` (float, default 0) — map exploration %
  - `last_walk_date` (date, nullable) — for streak calculation
  - `settings` (jsonb, default '{}') — user preferences
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `profiles`.
- Users can read their own profile (SELECT).
- Users can insert their own profile (INSERT).
- Users can update their own profile (UPDATE).
- Users can read other profiles for leaderboards/friends (SELECT all authenticated).
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_emoji text NOT NULL DEFAULT '🧭',
  avatar_color text NOT NULL DEFAULT '#1c7af5',
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  coins integer NOT NULL DEFAULT 1000,
  distance_walked double precision NOT NULL DEFAULT 0,
  steps integer NOT NULL DEFAULT 0,
  completed_adventures integer NOT NULL DEFAULT 0,
  completed_challenges integer NOT NULL DEFAULT 0,
  walking_streak integer NOT NULL DEFAULT 0,
  treasure_collected integer NOT NULL DEFAULT 0,
  exploration_percentage double precision NOT NULL DEFAULT 0,
  last_walk_date date,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all profiles (for leaderboards, friends)
DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);
