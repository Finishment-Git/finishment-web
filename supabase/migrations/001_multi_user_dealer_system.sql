-- Migration: Multi-User Dealer Account System
-- This migration adds support for multiple users per dealer account

-- Step 1: Create dealers table (company-level account)
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  tax_id TEXT NOT NULL UNIQUE,
  business_type TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add new columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS can_order BOOLEAN DEFAULT FALSE;

-- Step 3: Migrate existing data (if any)
-- For existing profiles, create a dealer record and link them
DO $$
DECLARE
  profile_record RECORD;
  new_dealer_id UUID;
BEGIN
  -- Loop through existing profiles that don't have a dealer_id
  FOR profile_record IN 
    SELECT id, company_name, tax_id, business_type 
    FROM profiles 
    WHERE dealer_id IS NULL
  LOOP
    -- Create a dealer record for each existing profile
    INSERT INTO dealers (company_name, tax_id, business_type, status)
    VALUES (
      COALESCE(profile_record.company_name, 'Unknown Company'),
      COALESCE(profile_record.tax_id, 'MIGRATED-' || profile_record.id::text),
      COALESCE(profile_record.business_type, 'Retailer'),
      'PENDING'
    )
    RETURNING id INTO new_dealer_id;
    
    -- Link the profile to the new dealer and set as primary
    UPDATE profiles
    SET 
      dealer_id = new_dealer_id,
      is_primary = TRUE,
      can_order = TRUE
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_dealer_id ON profiles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_primary ON profiles(is_primary);
CREATE INDEX IF NOT EXISTS idx_dealers_tax_id ON dealers(tax_id);

-- Step 5: Add RLS (Row Level Security) policies
-- Enable RLS on dealers table
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view dealers they belong to
CREATE POLICY "Users can view their dealer"
  ON dealers FOR SELECT
  USING (
    id IN (
      SELECT dealer_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Primary users can update their dealer
CREATE POLICY "Primary users can update their dealer"
  ON dealers FOR UPDATE
  USING (
    id IN (
      SELECT dealer_id FROM profiles 
      WHERE id = auth.uid() AND is_primary = TRUE
    )
  );

-- Policy: Authenticated users can insert new dealers (for registration)
CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update profiles RLS to include dealer context
-- (Assuming RLS is already enabled on profiles)

-- First, drop any existing conflicting policies to avoid recursion issues
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

-- Step 6: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for dealers table
CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

