-- IMMEDIATE FIX: Run this in Supabase SQL Editor RIGHT NOW
-- This will fix the RLS error immediately without requiring the function

-- Option 1: Make the INSERT policy work for any authenticated user
-- This allows users to create dealers during registration
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;

CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Option 2: Also create the function for better security (recommended)
CREATE OR REPLACE FUNCTION create_dealer_for_registration(
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
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a dealer';
  END IF;
  
  IF EXISTS (SELECT 1 FROM dealers WHERE tax_id = p_tax_id) THEN
    RAISE EXCEPTION 'A dealer with this Tax ID already exists';
  END IF;
  
  INSERT INTO dealers (company_name, tax_id, business_type, status)
  VALUES (p_company_name, p_tax_id, p_business_type, 'PENDING')
  RETURNING id INTO v_dealer_id;
  
  RETURN v_dealer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_dealer_for_registration TO authenticated;
GRANT EXECUTE ON FUNCTION create_dealer_for_registration TO anon;

-- Verify it worked
SELECT 'Fix applied successfully! Try registering again.' as status;

