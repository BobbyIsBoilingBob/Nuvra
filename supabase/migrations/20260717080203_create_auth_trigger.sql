/*
# Create trigger for auto-creating profiles on signup

1. Security
- Creates a trigger that calls handle_new_user() whenever a new auth user is created.
- This ensures every new signup gets a profile row automatically.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
