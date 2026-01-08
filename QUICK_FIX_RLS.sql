-- QUICK FIX: Run this in Supabase SQL Editor to immediately fix the RLS error
-- Copy and paste this entire file into Supabase Dashboard > SQL Editor > New Query

-- Step 1: Create the function to handle dealer registration
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
  -- Get the current authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a dealer';
  END IF;
  
  -- Check if tax_id already exists
  IF EXISTS (SELECT 1 FROM dealers WHERE tax_id = p_tax_id) THEN
    RAISE EXCEPTION 'A dealer with this Tax ID already exists';
  END IF;
  
  -- Create the dealer record (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO dealers (company_name, tax_id, business_type, status)
  VALUES (p_company_name, p_tax_id, p_business_type, 'PENDING')
  RETURNING id INTO v_dealer_id;
  
  RETURN v_dealer_id;
END;
$$;

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_dealer_for_registration TO authenticated;
GRANT EXECUTE ON FUNCTION create_dealer_for_registration TO anon;

-- Step 3: Update the INSERT policy as a fallback (though function should be used)
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;

CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the function was created
SELECT 'Function created successfully!' as status;

