-- Fix: Resolve infinite recursion in profiles RLS policies
-- Run this in Supabase SQL Editor to fix the existing database

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view profiles in their dealer" ON profiles;
DROP POLICY IF EXISTS "Primary users can update team member profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a security definer function to get user's dealer_id without RLS recursion
CREATE OR REPLACE FUNCTION get_user_dealer_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT dealer_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can view profiles in their dealer account (using security definer function to avoid recursion)
CREATE POLICY "Users can view profiles in their dealer"
  ON profiles FOR SELECT
  USING (dealer_id = get_user_dealer_id());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Primary users can update any profile in their dealer
CREATE POLICY "Primary users can update team member profiles"
  ON profiles FOR UPDATE
  USING (
    dealer_id = get_user_dealer_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND dealer_id = profiles.dealer_id 
      AND is_primary = TRUE
    )
  );

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Fix dealers INSERT policy to allow authenticated users to create dealers during registration
-- Drop all existing dealers policies first to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;
DROP POLICY IF EXISTS "Users can view their dealer" ON dealers;
DROP POLICY IF EXISTS "Primary users can update their dealer" ON dealers;

-- Recreate dealers policies with proper permissions
-- Allow authenticated users to insert dealers (for registration)
CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view dealers they belong to
CREATE POLICY "Users can view their dealer"
  ON dealers FOR SELECT
  USING (
    id IN (
      SELECT dealer_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Primary users can update their dealer
CREATE POLICY "Primary users can update their dealer"
  ON dealers FOR UPDATE
  USING (
    id IN (
      SELECT dealer_id FROM profiles 
      WHERE id = auth.uid() AND is_primary = TRUE
    )
  );

