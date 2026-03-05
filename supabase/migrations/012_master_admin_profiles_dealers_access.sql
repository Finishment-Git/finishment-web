-- Migration: Platform Admin access to profiles and dealers
-- Allows Platform Admins (admin_users with role='admin') to view all dealer users and all dealers

-- Platform Admins can view all profiles (dealer users)
CREATE POLICY "Master admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin_user_check(auth.uid()));

-- Platform Admins can view all dealers
CREATE POLICY "Master admins can view all dealers"
  ON dealers FOR SELECT
  USING (is_admin_user_check(auth.uid()));
