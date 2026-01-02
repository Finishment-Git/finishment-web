-- ============================================================================
-- COMPLETE FRESH DATABASE SETUP
-- Run this script to set up a clean database from scratch
-- ============================================================================

-- ============================================================================
-- STEP 1: Clean up existing objects (if any)
-- ============================================================================

-- Drop existing policies (only if tables exist)
DO $$ 
BEGIN
  -- Drop dealers policies if dealers table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dealers') THEN
    DROP POLICY IF EXISTS "Users can view their dealer" ON dealers;
    DROP POLICY IF EXISTS "Primary users can update their dealer" ON dealers;
    DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;
  END IF;
  
  -- Drop profiles policies if profiles table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can view profiles in their dealer" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Primary users can update team member profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  END IF;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_dealer_id() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop existing triggers (only if tables exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dealers') THEN
    DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  END IF;
END $$;

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS dealers CASCADE;
-- Note: We don't drop profiles table as Supabase manages it for auth

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
-- STEP 3: Ensure profiles table exists and add required columns
-- ============================================================================

-- Create profiles table if it doesn't exist (Supabase usually creates this)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  tax_id TEXT,
  business_type TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add dealer-related columns to profiles (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'dealer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_primary'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_primary BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'can_order'
  ) THEN
    ALTER TABLE profiles ADD COLUMN can_order BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_dealer_id ON profiles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_primary ON profiles(is_primary);
CREATE INDEX IF NOT EXISTS idx_dealers_tax_id ON dealers(tax_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);

-- ============================================================================
-- STEP 5: Create helper functions
-- ============================================================================

-- Function to get user's dealer_id without RLS recursion
CREATE OR REPLACE FUNCTION get_user_dealer_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT dealer_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Function to update updated_at timestamp
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
-- STEP 6: Create triggers
-- ============================================================================

-- Trigger for dealers table updated_at
CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles table updated_at (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- STEP 7: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: Create RLS Policies for dealers table
-- ============================================================================

-- Policy: Authenticated users can insert new dealers (for registration)
CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

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

-- ============================================================================
-- STEP 9: Create RLS Policies for profiles table
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Policy: Users can view profiles in their dealer account (using security definer function to avoid recursion)
CREATE POLICY "Users can view profiles in their dealer"
  ON profiles FOR SELECT
  USING (dealer_id = get_user_dealer_id());

-- Policy: Users can insert their own profile (for registration)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Policy: Primary users can update any profile in their dealer
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
-- SETUP COMPLETE
-- ============================================================================

-- Verify tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dealers') THEN
    RAISE EXCEPTION 'dealers table was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'profiles table was not created';
  END IF;
  
  RAISE NOTICE 'Database setup completed successfully!';
END $$;

