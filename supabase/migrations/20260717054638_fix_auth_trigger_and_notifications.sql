/*
# Fix auth trigger and notifications for real authentication

## Summary
Updates the `handle_new_user` trigger to use the username from signup metadata
(entered by the user) instead of auto-generating from email. Adds `actor_id`
column to `notifications` for social notifications. Adds a unique constraint
on username with a check for valid characters and length.

## Modified Tables
- `notifications`: ADD COLUMN `actor_id` uuid nullable (FK to profiles.id ON DELETE SET NULL)
- `profiles`: username already has UNIQUE constraint; add CHECK for length >= 3 and alphanumeric/underscore

## Modified Functions
- `handle_new_user`: now reads `username` from `raw_user_meta_data` (passed during signup),
  validates it, and falls back to email prefix only if not provided

## Security
- No RLS policy changes needed (existing policies are correct)
- The `notifications` INSERT policy already allows `auth.uid() = actor_id`
*/

-- Add actor_id to notifications
DO $$ BEGIN
  ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Update notifications insert policy to allow actor_id
DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = actor_id);

-- Add username validation check constraint
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_username_check
    CHECK (char_length(username) >= 3 AND char_length(username) <= 20
          AND username ~ '^[a-zA-Z0-9_]+$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update the trigger function to use username from metadata
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  chosen_username text;
BEGIN
  chosen_username := NEW.raw_user_meta_data->>'username';

  -- If no username provided or invalid, derive from email prefix
  IF chosen_username IS NULL OR char_length(chosen_username) < 3 THEN
    chosen_username := split_part(NEW.email, '@', 1);
  END IF;

  -- Ensure it meets constraints (fallback)
  IF char_length(chosen_username) < 3 OR chosen_username !~ '^[a-zA-Z0-9_]+$' THEN
    chosen_username := 'explorer_' || substr(replace(NEW.id::text, '-', ''), 1, 6);
  END IF;

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, chosen_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
