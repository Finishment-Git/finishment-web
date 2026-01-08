-- Fix: Create a function to handle dealer registration that bypasses RLS
-- This solves the issue where auth.uid() might not be available immediately after signUp()

-- Create a function to create a dealer during registration
-- This function uses SECURITY DEFINER to bypass RLS, but still requires authentication
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
  
  -- Create the dealer record
  INSERT INTO dealers (company_name, tax_id, business_type, status)
  VALUES (p_company_name, p_tax_id, p_business_type, 'PENDING')
  RETURNING id INTO v_dealer_id;
  
  RETURN v_dealer_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_dealer_for_registration TO authenticated;

-- Also update the INSERT policy to be more permissive for registration
-- But keep the function as the primary method
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;

-- Create a more permissive policy that allows inserts if user is authenticated
CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

