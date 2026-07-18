/*
# Extend adventures table for Creator feature

1. Modified Tables
- `adventures` — add columns needed to store full adventure metadata created by users
  - `title` text NOT NULL — adventure name
  - `description` text — adventure description
  - `difficulty` text DEFAULT 'easy' — easy/medium/hard
  - `distance_km` double precision DEFAULT 0 — route distance
  - `duration_min` integer DEFAULT 30 — estimated duration
  - `start_lat` double precision — start latitude
  - `start_lng` double precision — start longitude
  - `tags` text[] DEFAULT '{}' — adventure tags
  - `image_url` text — cover image
  - `ai_generated` boolean DEFAULT false — whether AI-generated
2. Security
- No RLS policy changes (existing owner-scoped policies remain).
3. Important Notes
- All additions use IF NOT EXISTS via DO $$ block to be idempotent.
- Existing rows get safe defaults so nothing breaks.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='title') THEN
    ALTER TABLE adventures ADD COLUMN title text NOT NULL DEFAULT 'Untitled Adventure';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='description') THEN
    ALTER TABLE adventures ADD COLUMN description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='difficulty') THEN
    ALTER TABLE adventures ADD COLUMN difficulty text NOT NULL DEFAULT 'easy';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='distance_km') THEN
    ALTER TABLE adventures ADD COLUMN distance_km double precision NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='duration_min') THEN
    ALTER TABLE adventures ADD COLUMN duration_min integer NOT NULL DEFAULT 30;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='start_lat') THEN
    ALTER TABLE adventures ADD COLUMN start_lat double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='start_lng') THEN
    ALTER TABLE adventures ADD COLUMN start_lng double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='tags') THEN
    ALTER TABLE adventures ADD COLUMN tags text[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='image_url') THEN
    ALTER TABLE adventures ADD COLUMN image_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='adventures' AND column_name='ai_generated') THEN
    ALTER TABLE adventures ADD COLUMN ai_generated boolean NOT NULL DEFAULT false;
  END IF;
END $$;
