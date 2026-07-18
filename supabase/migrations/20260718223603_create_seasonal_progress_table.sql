/*
# Create seasonal_progress table

1. New Tables
- `seasonal_progress` — tracks each user's progress in the current seasonal event
  - `id` uuid PK
  - `user_id` uuid NOT NULL DEFAULT auth.uid() — owner
  - `season_id` text NOT NULL — identifier for the current season (e.g. "summer-2026")
  - `season_name` text NOT NULL DEFAULT 'Summer Walking Festival'
  - `adventures_completed` integer NOT NULL DEFAULT 0 — count of adventures completed this season
  - `distance_walked` double precision NOT NULL DEFAULT 0 — meters walked this season
  - `target_adventures` integer NOT NULL DEFAULT 5 — adventures needed to complete the season
  - `target_distance` double precision NOT NULL DEFAULT 50000 — meters target for the season
  - `reward_claimed` boolean NOT NULL DEFAULT false
  - `created_at` timestamptz DEFAULT now()
  - `updated_at` timestamptz DEFAULT now()
2. Security
- Enable RLS on `seasonal_progress`.
- Owner-scoped CRUD: each authenticated user can only access their own row.
3. Important Notes
- `user_id` defaults to `auth.uid()` so inserts without explicit user_id succeed.
- One row per user per season enforced via UNIQUE constraint on (user_id, season_id).
*/

CREATE TABLE IF NOT EXISTS seasonal_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id text NOT NULL DEFAULT 'summer-2026',
  season_name text NOT NULL DEFAULT 'Summer Walking Festival',
  adventures_completed integer NOT NULL DEFAULT 0,
  distance_walked double precision NOT NULL DEFAULT 0,
  target_adventures integer NOT NULL DEFAULT 5,
  target_distance double precision NOT NULL DEFAULT 50000,
  reward_claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seasonal_progress_user_season_unique UNIQUE (user_id, season_id)
);

ALTER TABLE seasonal_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_seasonal_progress" ON seasonal_progress;
CREATE POLICY "select_own_seasonal_progress" ON seasonal_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_seasonal_progress" ON seasonal_progress;
CREATE POLICY "insert_own_seasonal_progress" ON seasonal_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_seasonal_progress" ON seasonal_progress;
CREATE POLICY "update_own_seasonal_progress" ON seasonal_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_seasonal_progress" ON seasonal_progress;
CREATE POLICY "delete_own_seasonal_progress" ON seasonal_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
