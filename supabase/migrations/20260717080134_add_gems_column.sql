/*
# Add gems column to profiles

1. Modified Tables
- `profiles`: Added `gems` column (integer, default 0) for the premium currency.
2. Security
- No RLS changes needed — existing policies cover the new column.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gems integer NOT NULL DEFAULT 0;
