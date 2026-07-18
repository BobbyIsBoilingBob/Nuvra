-- The previous unique index friends_no_duplicate_either_direction on
-- LEAST(user_id, friend_id), GREATEST(user_id, friend_id) blocks the
-- legitimate bidirectional insert on accept (both (A,B) and (B,A)
-- produce the same key). Replace it with a same-direction unique index
-- that prevents duplicate (user_id, friend_id) pairs while still
-- allowing the reverse row needed for bidirectional friend queries.

DROP INDEX IF EXISTS friends_no_duplicate_either_direction;

CREATE UNIQUE INDEX friends_no_duplicate_same_direction
  ON friends (user_id, friend_id);