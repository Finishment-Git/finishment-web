-- ============================================================================
-- FRESH START: Complete Database Setup for Dealer & Individual Registration
-- Run this entire file in Supabase SQL Editor
-- This will drop everything and recreate it cleanly
-- ============================================================================

-- ============================================================================
-- STEP 1: Clean up everything
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their dealer" ON dealers;
DROP POLICY IF EXISTS "Primary users can update their dealer" ON dealers;
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their dealer" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Primary users can update team member profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Drop all existing functions
DROP FUNCTION IF EXISTS create_dealer_and_profile CASCADE;
DROP FUNCTION IF EXISTS create_dealer_for_registration CASCADE;
DROP FUNCTION IF EXISTS join_existing_dealer CASCADE;
DROP FUNCTION IF EXISTS get_user_dealer_id() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- STEP 2: Create dealers table
-- ============================================================================

CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  tax_id TEXT NOT NULL UNIQUE,
  business_type TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create profiles table
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  tax_id TEXT,
  business_type TEXT,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  can_order BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create indexes
-- ============================================================================

CREATE INDEX idx_profiles_dealer_id ON profiles(dealer_id);
CREATE INDEX idx_profiles_is_primary ON profiles(is_primary);
CREATE INDEX idx_dealers_tax_id ON dealers(tax_id);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_dealers_status ON dealers(status);

-- ============================================================================
-- STEP 5: Create SECURITY DEFINER function for dealer registration
-- This bypasses RLS completely, so it will work even if auth.uid() is NULL
-- ============================================================================

CREATE OR REPLACE FUNCTION create_dealer_and_profile(
  p_user_id UUID,
  p_company_name TEXT,
  p_tax_id TEXT,
  p_business_type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dealer_id UUID;
BEGIN
  -- Check if tax_id already exists
  IF EXISTS (SELECT 1 FROM dealers WHERE tax_id = p_tax_id) THEN
    RAISE EXCEPTION 'A dealer with this Tax ID already exists';
  END IF;
  
  -- Create the dealer record (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO dealers (company_name, tax_id, business_type, status)
  VALUES (p_company_name, p_tax_id, p_business_type, 'PENDING')
  RETURNING id INTO v_dealer_id;
  
  -- Create the profile record (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO profiles (
    id,
    dealer_id,
    company_name,
    tax_id,
    business_type,
    status,
    is_primary,
    can_order
  )
  VALUES (
    p_user_id,
    v_dealer_id,
    p_company_name,
    p_tax_id,
    p_business_type,
    'PENDING',
    TRUE,  -- First user is always primary
    TRUE   -- Primary user can always order
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN v_dealer_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_dealer_and_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_dealer_and_profile TO anon;

-- ============================================================================
-- STEP 6: Create function for individual user joining existing dealer
-- ============================================================================

CREATE OR REPLACE FUNCTION join_existing_dealer(
  p_user_id UUID,
  p_dealer_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dealer_info RECORD;
BEGIN
  -- Get dealer info
  SELECT company_name, tax_id, business_type INTO v_dealer_info
  FROM dealers
  WHERE id = p_dealer_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dealer not found';
  END IF;
  
  -- Create profile for the user
  INSERT INTO profiles (
    id,
    dealer_id,
    company_name,
    tax_id,
    business_type,
    status,
    is_primary,
    can_order
  )
  VALUES (
    p_user_id,
    p_dealer_id,
    v_dealer_info.company_name,
    v_dealer_info.tax_id,
    v_dealer_info.business_type,
    'PENDING',
    FALSE,  -- Not primary
    FALSE   -- Default: no ordering permission
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION join_existing_dealer TO authenticated;
GRANT EXECUTE ON FUNCTION join_existing_dealer TO anon;

-- ============================================================================
-- STEP 7: Create helper function for getting dealer_id
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_dealer_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT dealer_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================================
-- STEP 8: Create trigger function for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 9: Create triggers
-- ============================================================================

CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 10: Enable RLS
-- ============================================================================

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 11: Create RLS Policies
-- ============================================================================

-- Dealers table policies
CREATE POLICY "Users can view their dealer"
  ON dealers FOR SELECT
  USING (
    id IN (SELECT dealer_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Primary users can update their dealer"
  ON dealers FOR UPDATE
  USING (
    id IN (
      SELECT dealer_id FROM profiles 
      WHERE id = auth.uid() AND is_primary = TRUE
    )
  );

-- Profiles table policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their dealer"
  ON profiles FOR SELECT
  USING (dealer_id = get_user_dealer_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

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

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT 'Database setup completed successfully! Try registering a dealer now.' as status;

