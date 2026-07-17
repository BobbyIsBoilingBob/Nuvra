/*
# Add blocks table and profile social columns

## Summary
Adds a `blocks` table for user blocking and adds `is_online`, `last_seen`, `bio` columns
to the existing `profiles` table to support online indicators and profile previews.

## New Tables
- `blocks`: blocker_id -> blocked_id with UNIQUE constraint

## Modified Tables
- `profiles`: ADD COLUMN is_online boolean default false
- `profiles`: ADD COLUMN last_seen timestamptz default now()
- `profiles`: ADD COLUMN bio text

## Security
- `blocks`: RLS enabled, owner-scoped CRUD (blocker only)
*/

-- Add columns to profiles (idempotent)
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_select_own" ON blocks;
CREATE POLICY "blocks_select_own" ON blocks
  FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_insert_own" ON blocks;
CREATE POLICY "blocks_insert_own" ON blocks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_delete_own" ON blocks;
CREATE POLICY "blocks_delete_own" ON blocks
  FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks (blocker_id);
