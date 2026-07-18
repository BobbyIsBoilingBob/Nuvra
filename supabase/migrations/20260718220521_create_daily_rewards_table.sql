/*
# Create daily_rewards table

1. New Tables
- `daily_rewards` — tracks each user's daily reward claim state
  - `id` uuid PK
  - `user_id` uuid NOT NULL DEFAULT auth.uid() — owner
  - `last_claim_date` date — the date of the most recent claim
  - `current_streak` integer DEFAULT 0 — consecutive days claimed
  - `total_claimed` integer DEFAULT 0 — lifetime claims
  - `created_at` timestamptz DEFAULT now()
  - `updated_at` timestamptz DEFAULT now()
2. Security
- Enable RLS on `daily_rewards`.
- Owner-scoped CRUD: each authenticated user can only access their own row.
3. Important Notes
- `user_id` defaults to `auth.uid()` so inserts without explicit user_id succeed.
- One row per user enforced via UNIQUE constraint on user_id.
*/

CREATE TABLE IF NOT EXISTS daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  last_claim_date date,
  current_streak integer NOT NULL DEFAULT 0,
  total_claimed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_rewards_user_unique UNIQUE (user_id)
);

ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_daily_rewards" ON daily_rewards;
CREATE POLICY "select_own_daily_rewards" ON daily_rewards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_daily_rewards" ON daily_rewards;
CREATE POLICY "insert_own_daily_rewards" ON daily_rewards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_daily_rewards" ON daily_rewards;
CREATE POLICY "update_own_daily_rewards" ON daily_rewards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_daily_rewards" ON daily_rewards;
CREATE POLICY "delete_own_daily_rewards" ON daily_rewards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
