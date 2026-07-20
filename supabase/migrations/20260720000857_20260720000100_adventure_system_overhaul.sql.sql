/*
# Adventure System Overhaul

## Summary
Extends the existing `adventures` and `challenges` tables to support the
production-ready adventure system: rich route data, per-checkpoint challenges,
location preferences, difficulty scaling, and suggested-adventure metadata.

## 1. Modified Tables

### adventures
Adds columns so a generated adventure can carry its full route, checkpoints,
challenge assignments, and the user preferences that produced it.

New columns:
- `center_lat` / `center_lng` (double precision) — the geographic centre used
  for generation (user GPS or geocoded location). NEVER NULL after generation.
- `location_name` (text) — human-readable location label, e.g. "Brisbane".
- `location_source` (text) — one of 'gps' | 'manual' | 'suggested'.
- `preferences` (jsonb) — the optional preferences object the user supplied
  (max distance, min distance, difficulty, length, challenge types).
- `checkpoints` (jsonb) — ordered array of checkpoint objects, each with
  lat/lng/label/challenge. This is the structured route data the map and
  challenge runner consume.
- `route_geojson` (jsonb) — GeoJSON LineString of the full route for map render.
- `estimated_distance_km` (double precision) — computed route length.
- `estimated_duration_min` (integer) — computed route duration.
- `is_suggested` (boolean, default false) — marks suggested adventures.

### challenges
Adds columns to support the expanded challenge library and sensor challenges.

New columns:
- `adventure_id` (uuid, nullable) — links a runtime challenge to its adventure.
- `checkpoint_index` (integer) — which checkpoint this challenge belongs to.
- `category` (text) — challenge category (observation, photography, etc.).
- `sensor_type` (text, nullable) — which device sensor is required, if any.
- `sensor_config` (jsonb) — sensor challenge parameters (target angle, etc.).
- `data` (jsonb) — full challenge definition payload from the library.

## 2. Security
- RLS already enabled on both tables; existing policies remain.
- No new tables created — only additive columns, so no data loss.
- All new columns are nullable (or have safe defaults) so existing rows remain valid.

## 3. Important Notes
1. This migration is purely additive — no columns are dropped or retyped.
2. `center_lat`/`center_lng` are nullable so existing rows are not broken, but
   the generator always sets them for new rows.
3. The `checkpoints` jsonb is the single source of truth for the route at
   runtime; `waypoints` (existing) is left untouched for backward compatibility.
*/

ALTER TABLE adventures
  ADD COLUMN IF NOT EXISTS center_lat double precision,
  ADD COLUMN IF NOT EXISTS center_lng double precision,
  ADD COLUMN IF NOT EXISTS location_name text,
  ADD COLUMN IF NOT EXISTS location_source text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS checkpoints jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS route_geojson jsonb,
  ADD COLUMN IF NOT EXISTS estimated_distance_km double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_duration_min integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS is_suggested boolean DEFAULT false;

ALTER TABLE challenges
  ADD COLUMN IF NOT EXISTS adventure_id uuid REFERENCES adventures(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS checkpoint_index integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS sensor_type text,
  ADD COLUMN IF NOT EXISTS sensor_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS adventures_center_idx ON adventures (center_lat, center_lng);
CREATE INDEX IF NOT EXISTS adventures_user_idx ON adventures (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS challenges_adventure_idx ON challenges (adventure_id, checkpoint_index);
