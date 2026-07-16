/*
# Create adventures, challenges, inventory, achievements, friends, notifications, and activity tables

1. New Tables
- `adventures`: Generated walking adventures with waypoints, rewards, and completion state.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid())
  - `type` (text: 'treasure_hunt', 'distance_walk', 'checkpoint', 'exploration')
  - `status` (text: 'active', 'completed', 'abandoned', default 'active')
  - `target_distance` (float, nullable) — distance goal in meters
  - `target_steps` (int, nullable) — step goal
  - `waypoints` (jsonb) — array of {lat, lng, label, reached} objects
  - `reward_xp` (int, default 0)
  - `reward_coins` (int, default 0)
  - `reward_item` (text, nullable) — item name reward
  - `created_at` (timestamptz, default now())
  - `completed_at` (timestamptz, nullable)

- `challenges`: Daily/time-limited challenges for users.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid())
  - `type` (text: 'daily_steps', 'daily_distance', 'weekly_adventures', 'streak')
  - `title` (text, not null)
  - `description` (text)
  - `target` (float, not null) — goal value
  - `progress` (float, default 0) — current progress
  - `status` (text: 'active', 'completed', 'expired', default 'active')
  - `reward_xp` (int, default 0)
  - `reward_coins` (int, default 0)
  - `expires_at` (timestamptz, nullable)
  - `created_at` (timestamptz, default now())
  - `completed_at` (timestamptz, nullable)

- `inventory_items`: Items owned by users (treasures, cosmetics, consumables).
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid())
  - `item_id` (text, not null) — stable item identifier
  - `item_name` (text, not null)
  - `item_type` (text: 'treasure', 'cosmetic', 'consumable', 'badge')
  - `quantity` (int, default 1)
  - `rarity` (text: 'common', 'rare', 'epic', 'legendary', default 'common')
  - `icon` (text, default '📦')
  - `acquired_at` (timestamptz, default now())

- `achievements`: Unlocked achievements per user.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid())
  - `achievement_id` (text, not null) — stable achievement identifier
  - `achievement_name` (text, not null)
  - `description` (text)
  - `icon` (text, default '🏆')
  - `unlocked_at` (timestamptz, default now())
  - UNIQUE constraint on (user_id, achievement_id) to prevent duplicates

- `friends`: Friend relationships between users.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid()) — the requester
  - `friend_id` (uuid, FK to profiles) — the recipient
  - `status` (text: 'pending', 'accepted', 'blocked', default 'pending')
  - `created_at` (timestamptz, default now())
  - UNIQUE constraint on (user_id, friend_id)

- `notifications`: User notifications.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid())
  - `type` (text: 'achievement', 'friend_request', 'friend_accepted', 'level_up', 'reward', 'adventure', 'challenge', 'info')
  - `title` (text, not null)
  - `message` (text)
  - `read` (boolean, default false)
  - `created_at` (timestamptz, default now())

- `activity_log`: Records user activities for activity feed.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid())
  - `activity_type` (text, not null) — 'adventure_completed', 'challenge_completed', 'achievement_unlocked', 'level_up', 'friend_added', 'treasure_found'
  - `description` (text)
  - `metadata` (jsonb, default '{}')
  - `created_at` (timestamptz, default now())

- `player_locations`: Real-time player positions for multiplayer proximity.
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, default auth.uid(), unique)
  - `latitude` (double precision, not null)
  - `longitude` (double precision, not null)
  - `heading` (double precision, nullable) — compass heading in degrees
  - `updated_at` (timestamptz, default now())

2. Indexes
- profiles: username (unique index already from constraint)
- adventures: user_id, status
- challenges: user_id, status
- inventory_items: user_id
- achievements: user_id
- friends: user_id, friend_id
- notifications: user_id, read
- activity_log: user_id, created_at
- player_locations: user_id (unique)

3. Security
- Enable RLS on all tables.
- Owner-scoped CRUD for adventures, challenges, inventory_items, achievements, notifications, activity_log.
- Friends: users can read their own friend rows and rows where they are the friend (for requests).
- Player locations: authenticated users can read all (for multiplayer), but only update their own.
*/

-- Adventures table
CREATE TABLE IF NOT EXISTS adventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'exploration' CHECK (type IN ('treasure_hunt', 'distance_walk', 'checkpoint', 'exploration')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  target_distance double precision,
  target_steps integer,
  waypoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  reward_xp integer NOT NULL DEFAULT 0,
  reward_coins integer NOT NULL DEFAULT 0,
  reward_item text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_adventures" ON adventures;
CREATE POLICY "select_own_adventures" ON adventures FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_adventures" ON adventures;
CREATE POLICY "insert_own_adventures" ON adventures FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_adventures" ON adventures;
CREATE POLICY "update_own_adventures" ON adventures FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_adventures" ON adventures;
CREATE POLICY "delete_own_adventures" ON adventures FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_adventures_user_id ON adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_adventures_status ON adventures(status);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('daily_steps', 'daily_distance', 'weekly_adventures', 'streak')),
  title text NOT NULL,
  description text,
  target double precision NOT NULL,
  progress double precision NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  reward_xp integer NOT NULL DEFAULT 0,
  reward_coins integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_challenges" ON challenges;
CREATE POLICY "select_own_challenges" ON challenges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_challenges" ON challenges;
CREATE POLICY "insert_own_challenges" ON challenges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_challenges" ON challenges;
CREATE POLICY "update_own_challenges" ON challenges FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_challenges" ON challenges;
CREATE POLICY "delete_own_challenges" ON challenges FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_name text NOT NULL,
  item_type text NOT NULL DEFAULT 'treasure' CHECK (item_type IN ('treasure', 'cosmetic', 'consumable', 'badge')),
  quantity integer NOT NULL DEFAULT 1,
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon text NOT NULL DEFAULT '📦',
  acquired_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_inventory" ON inventory_items;
CREATE POLICY "select_own_inventory" ON inventory_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_inventory" ON inventory_items;
CREATE POLICY "insert_own_inventory" ON inventory_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_inventory" ON inventory_items;
CREATE POLICY "update_own_inventory" ON inventory_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_inventory" ON inventory_items;
CREATE POLICY "delete_own_inventory" ON inventory_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory_items(user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  achievement_name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '🏆',
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_achievements" ON achievements;
CREATE POLICY "select_own_achievements" ON achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_achievements" ON achievements;
CREATE POLICY "insert_own_achievements" ON achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_achievements" ON achievements;
CREATE POLICY "delete_own_achievements" ON achievements FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can read rows where they are the user OR the friend (to see incoming requests)
DROP POLICY IF EXISTS "select_own_friends" ON friends;
CREATE POLICY "select_own_friends" ON friends FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "insert_own_friends" ON friends;
CREATE POLICY "insert_own_friends" ON friends FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_friends" ON friends;
CREATE POLICY "update_own_friends" ON friends FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "delete_own_friends" ON friends;
CREATE POLICY "delete_own_friends" ON friends FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('achievement', 'friend_request', 'friend_accepted', 'level_up', 'reward', 'adventure', 'challenge', 'info')),
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_activity" ON activity_log;
CREATE POLICY "select_own_activity" ON activity_log FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activity" ON activity_log;
CREATE POLICY "insert_own_activity" ON activity_log FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_activity" ON activity_log;
CREATE POLICY "delete_own_activity" ON activity_log FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at DESC);

-- Player locations table (for multiplayer)
CREATE TABLE IF NOT EXISTS player_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  heading double precision,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE player_locations ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read locations (for multiplayer proximity)
DROP POLICY IF EXISTS "select_player_locations" ON player_locations;
CREATE POLICY "select_player_locations" ON player_locations FOR SELECT
  TO authenticated USING (true);

-- Users can only insert/update their own location
DROP POLICY IF EXISTS "upsert_own_location" ON player_locations;
CREATE POLICY "upsert_own_location" ON player_locations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_location" ON player_locations;
CREATE POLICY "update_own_location" ON player_locations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_location" ON player_locations;
CREATE POLICY "delete_own_location" ON player_locations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
