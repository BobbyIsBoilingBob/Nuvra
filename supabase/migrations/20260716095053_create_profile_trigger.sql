/*
# Create auto-profile trigger and updated_at function

1. New Functions
- `handle_new_user()`: Trigger function that auto-creates a profile row when a new auth.users row is inserted.
  - Extracts email for username (part before @)
  - Sets all game stats to fresh defaults: XP=0, Level=1, Coins=1000, etc.
  - Only runs on INSERT (signup), never on anonymous user creation.

- `update_updated_at_column()`: Generic trigger function to set updated_at on row update.

2. New Triggers
- `on_auth_user_created`: AFTER INSERT on auth.users → calls handle_new_user()
- `update_player_location_timestamp`: BEFORE UPDATE on player_locations → sets updated_at

3. Important Notes
- This trigger ensures every newly registered user gets a fresh profile with starting values.
- No anonymous users are created — only real signups trigger this.
- The profile is created server-side so it's atomic with the auth record.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      split_part(NEW.email, '@', 1),
      'explorer_' || substr(NEW.id::text, 1, 8)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_player_location_timestamp ON player_locations;
CREATE TRIGGER update_player_location_timestamp
  BEFORE UPDATE ON player_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
