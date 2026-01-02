-- ============================================================================
-- CLEANUP SCRIPT - Run this FIRST before running the fresh setup
-- ============================================================================
-- This script removes all existing tables, policies, functions, and triggers
-- so you can start with a clean slate

-- Drop all existing policies (only if tables exist)
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

-- Note: We don't drop the profiles table as Supabase manages it for authentication
-- But we can remove the dealer-related columns if needed
DO $$ 
BEGIN
  -- Remove dealer-related columns from profiles if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'dealer_id'
  ) THEN
    ALTER TABLE profiles DROP COLUMN IF EXISTS dealer_id CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_primary'
  ) THEN
    ALTER TABLE profiles DROP COLUMN IF EXISTS is_primary CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'can_order'
  ) THEN
    ALTER TABLE profiles DROP COLUMN IF EXISTS can_order CASCADE;
  END IF;
END $$;

-- Cleanup complete
SELECT 'Cleanup completed successfully. Now run 000_complete_fresh_setup.sql' AS message;

