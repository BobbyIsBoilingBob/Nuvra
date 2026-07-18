-- Fix: Allow a user to insert notifications FOR another user when they are the actor.
-- This is needed for friend request notifications: the sender creates a notification
-- for the receiver. The existing policy only allowed auth.uid() = user_id, which
-- blocked all social notifications.

-- Drop the old duplicate/restrictive notification insert policies
DROP POLICY IF EXISTS "insert_own_notif" ON notifications;
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;

-- Single permissive insert policy: allow if you are the owner or the actor
CREATE POLICY "insert_notif_as_owner_or_actor" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR (auth.uid() = actor_id));

-- Drop duplicate select/update/delete policies (keep one of each)
DROP POLICY IF EXISTS "select_own_notif" ON notifications;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications_v2" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notif" ON notifications;
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications_v2" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notif" ON notifications;
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications_v2" ON notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix: Allow inserting a friends row where auth.uid() = friend_id as well
-- (for the bidirectional insert on accept).
DROP POLICY IF EXISTS "insert_own_friends" ON friends;
CREATE POLICY "insert_friends_as_user_or_friend" ON friends
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR (auth.uid() = friend_id));

-- Prevent duplicate pending friend requests in either direction (A->B and B->A)
CREATE UNIQUE INDEX IF NOT EXISTS friend_requests_no_duplicate_pending
  ON friend_requests (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
  WHERE status = 'pending';

-- Prevent duplicate friendships in either direction
CREATE UNIQUE INDEX IF NOT EXISTS friends_no_duplicate_either_direction
  ON friends (LEAST(user_id, friend_id), GREATEST(user_id, friend_id));
