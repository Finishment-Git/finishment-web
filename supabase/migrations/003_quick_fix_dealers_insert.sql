-- Quick Fix: Allow authenticated users to insert into dealers table
-- Run this in Supabase SQL Editor if you're getting RLS violations on dealers INSERT

-- Drop and recreate the INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;

-- Create a permissive INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

