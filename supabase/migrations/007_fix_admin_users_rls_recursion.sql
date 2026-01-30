-- Fix: Resolve infinite recursion in admin_users RLS policies
-- The policies were querying admin_users to check if user is admin, causing recursion

-- Step 1: Create a security definer function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin_user_check(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Step 2: Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage all users" ON admin_users;

-- Step 3: Recreate policies using the helper function (no recursion)
CREATE POLICY "Admins can view all users"
  ON admin_users FOR SELECT
  USING (
    is_admin_user_check(auth.uid())
  );

CREATE POLICY "Admins can manage all users"
  ON admin_users FOR ALL
  USING (
    is_admin_user_check(auth.uid())
  )
  WITH CHECK (
    is_admin_user_check(auth.uid())
  );
