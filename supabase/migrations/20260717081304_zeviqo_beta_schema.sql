/*
# Zeviqo Beta Schema — Social, Quests, Inventory, Notifications, History

Creates all tables for real-time multiplayer, quest persistence, inventory sync,
notifications, and adventure history. Tables created first, then policies applied.
*/

-- Create all tables first
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  leader_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  adventure_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'disbanded')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(party_id, user_id)
);

CREATE TABLE IF NOT EXISTS quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  claimed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

CREATE TABLE IF NOT EXISTS owned_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  equipped boolean NOT NULL DEFAULT false,
  acquired_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS adventure_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  adventure_id text NOT NULL,
  adventure_name text NOT NULL,
  emoji text,
  type text,
  difficulty text,
  distance double precision NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  coins_earned integer NOT NULL DEFAULT 0,
  gems_earned integer NOT NULL DEFAULT 0,
  treasures_found integer NOT NULL DEFAULT 0,
  max_combo integer NOT NULL DEFAULT 0,
  is_favorite boolean NOT NULL DEFAULT false,
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE owned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_history ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_fr_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_fr_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_fr_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_parties_leader ON parties(leader_id);
CREATE INDEX IF NOT EXISTS idx_pm_party ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_pm_user ON party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_qp_user ON quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_oi_user ON owned_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_ah_user ON adventure_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ah_completed ON adventure_history(completed_at DESC);

-- Friends policies
DROP POLICY IF EXISTS "select_own_friends" ON friends;
CREATE POLICY "select_own_friends" ON friends FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "insert_own_friends" ON friends;
CREATE POLICY "insert_own_friends" ON friends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_friends" ON friends;
CREATE POLICY "delete_own_friends" ON friends FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend requests policies
DROP POLICY IF EXISTS "select_own_fr" ON friend_requests;
CREATE POLICY "select_own_fr" ON friend_requests FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "insert_own_fr" ON friend_requests;
CREATE POLICY "insert_own_fr" ON friend_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "update_own_fr" ON friend_requests;
CREATE POLICY "update_own_fr" ON friend_requests FOR UPDATE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id) WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "delete_own_fr" ON friend_requests;
CREATE POLICY "delete_own_fr" ON friend_requests FOR DELETE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Parties policies
DROP POLICY IF EXISTS "select_own_parties" ON parties;
CREATE POLICY "select_own_parties" ON parties FOR SELECT TO authenticated USING (
  auth.uid() = leader_id OR EXISTS (SELECT 1 FROM party_members WHERE party_members.party_id = parties.id AND party_members.user_id = auth.uid())
);
DROP POLICY IF EXISTS "insert_own_parties" ON parties;
CREATE POLICY "insert_own_parties" ON parties FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);
DROP POLICY IF EXISTS "update_own_parties" ON parties;
CREATE POLICY "update_own_parties" ON parties FOR UPDATE TO authenticated USING (auth.uid() = leader_id) WITH CHECK (auth.uid() = leader_id);
DROP POLICY IF EXISTS "delete_own_parties" ON parties;
CREATE POLICY "delete_own_parties" ON parties FOR DELETE TO authenticated USING (auth.uid() = leader_id);

-- Party members policies
DROP POLICY IF EXISTS "select_own_pm" ON party_members;
CREATE POLICY "select_own_pm" ON party_members FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM party_members pm2 WHERE pm2.party_id = party_members.party_id AND pm2.user_id = auth.uid())
);
DROP POLICY IF EXISTS "insert_own_pm" ON party_members;
CREATE POLICY "insert_own_pm" ON party_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_pm" ON party_members;
CREATE POLICY "delete_own_pm" ON party_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Quest progress policies
DROP POLICY IF EXISTS "select_own_qp" ON quest_progress;
CREATE POLICY "select_own_qp" ON quest_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_qp" ON quest_progress;
CREATE POLICY "insert_own_qp" ON quest_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_qp" ON quest_progress;
CREATE POLICY "update_own_qp" ON quest_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_qp" ON quest_progress;
CREATE POLICY "delete_own_qp" ON quest_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Owned items policies
DROP POLICY IF EXISTS "select_own_oi" ON owned_items;
CREATE POLICY "select_own_oi" ON owned_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_oi" ON owned_items;
CREATE POLICY "insert_own_oi" ON owned_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_oi" ON owned_items;
CREATE POLICY "update_own_oi" ON owned_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_oi" ON owned_items;
CREATE POLICY "delete_own_oi" ON owned_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "select_own_notif" ON notifications;
CREATE POLICY "select_own_notif" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notif" ON notifications;
CREATE POLICY "insert_own_notif" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notif" ON notifications;
CREATE POLICY "update_own_notif" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notif" ON notifications;
CREATE POLICY "delete_own_notif" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Adventure history policies
DROP POLICY IF EXISTS "select_own_ah" ON adventure_history;
CREATE POLICY "select_own_ah" ON adventure_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ah" ON adventure_history;
CREATE POLICY "insert_own_ah" ON adventure_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ah" ON adventure_history;
CREATE POLICY "update_own_ah" ON adventure_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ah" ON adventure_history;
CREATE POLICY "delete_own_ah" ON adventure_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime on key tables
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friends; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE party_members; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE quest_progress; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
