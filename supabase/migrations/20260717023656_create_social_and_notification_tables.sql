/*
# Social, Notification, and Activity Tables

## Overview
Adds tables for party invitations, notifications, activity feed, and player online status.
All tables use the no-auth (anon+authenticated) pattern consistent with existing nuvra_* tables.

## New Tables
1. nuvra_party_invites — party invitations between players
2. nuvra_notifications — user-facing notifications
3. nuvra_activity_log — genuine user activity for the community feed
4. nuvra_player_status — real-time online/status tracking
*/

CREATE TABLE IF NOT EXISTS nuvra_party_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES nuvra_parties(id) ON DELETE CASCADE,
  from_player_id text NOT NULL,
  to_player_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(party_id, to_player_id)
);
ALTER TABLE nuvra_party_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_invites" ON nuvra_party_invites;
CREATE POLICY "anon_select_invites" ON nuvra_party_invites FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_invites" ON nuvra_party_invites;
CREATE POLICY "anon_insert_invites" ON nuvra_party_invites FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_invites" ON nuvra_party_invites;
CREATE POLICY "anon_update_invites" ON nuvra_party_invites FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_invites" ON nuvra_party_invites;
CREATE POLICY "anon_delete_invites" ON nuvra_party_invites FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS nuvra_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  from_player_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE nuvra_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON nuvra_notifications;
CREATE POLICY "anon_select_notifications" ON nuvra_notifications FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON nuvra_notifications;
CREATE POLICY "anon_insert_notifications" ON nuvra_notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON nuvra_notifications;
CREATE POLICY "anon_update_notifications" ON nuvra_notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON nuvra_notifications;
CREATE POLICY "anon_delete_notifications" ON nuvra_notifications FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS nuvra_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  username text NOT NULL DEFAULT 'Explorer',
  avatar text NOT NULL DEFAULT '🧭',
  activity_type text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE nuvra_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_log" ON nuvra_activity_log;
CREATE POLICY "anon_select_activity_log" ON nuvra_activity_log FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activity_log" ON nuvra_activity_log;
CREATE POLICY "anon_insert_activity_log" ON nuvra_activity_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activity_log" ON nuvra_activity_log;
CREATE POLICY "anon_delete_activity_log" ON nuvra_activity_log FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS nuvra_player_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'offline',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE nuvra_player_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_status" ON nuvra_player_status;
CREATE POLICY "anon_select_status" ON nuvra_player_status FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_status" ON nuvra_player_status;
CREATE POLICY "anon_insert_status" ON nuvra_player_status FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_status" ON nuvra_player_status;
CREATE POLICY "anon_update_status" ON nuvra_player_status FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_status" ON nuvra_player_status;
CREATE POLICY "anon_delete_status" ON nuvra_player_status FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_party_invites_to_player ON nuvra_party_invites(to_player_id);
CREATE INDEX IF NOT EXISTS idx_party_invites_party ON nuvra_party_invites(party_id);
CREATE INDEX IF NOT EXISTS idx_notifications_player ON nuvra_notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON nuvra_notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON nuvra_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_status_player ON nuvra_player_status(player_id);
