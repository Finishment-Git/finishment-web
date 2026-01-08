# Fix: Dealer Registration RLS Error

## Problem
When registering a new dealer, you're getting this error:
```
Error creating dealer account: new row violates row-level security policy for table "dealers"
```

## Root Cause
After `supabase.auth.signUp()`, the user session might not be immediately available, causing `auth.uid()` to be `NULL` when the RLS policy checks it. The RLS policy requires `auth.uid() IS NOT NULL` to allow inserts.

## Solution
A database function with `SECURITY DEFINER` has been created that bypasses RLS while still requiring authentication. The registration code has also been updated to:
1. Ensure the user is signed in after signUp
2. Use the new database function to create dealers

## Steps to Fix

### 1. Run the Migration
Execute the migration SQL file in your Supabase database:

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"
5. Open `supabase/migrations/004_fix_dealer_registration_rls.sql`
6. Copy and paste the entire contents
7. Click "Run" or press `Ctrl+Enter` / `Cmd+Enter`

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### 2. Verify the Fix
After running the migration:
1. Try registering a new dealer at `/dealer-register`
2. The registration should now work without RLS errors

## What the Migration Does

1. **Creates `create_dealer_for_registration()` function**
   - Uses `SECURITY DEFINER` to bypass RLS
   - Still requires authentication (`auth.uid() IS NOT NULL`)
   - Validates that the Tax ID doesn't already exist
   - Returns the newly created dealer ID

2. **Updates RLS Policy**
   - Keeps the existing INSERT policy as a fallback
   - The function is the primary method for creating dealers during registration

## Code Changes

The registration page (`app/(auth)/dealer-register/page.tsx`) has been updated to:
- Verify the user session after signUp
- Use `supabase.rpc('create_dealer_for_registration', ...)` instead of direct INSERT
- Handle the function's return value (UUID) correctly

## Testing

After applying the fix, test the registration flow:
1. Go to `/dealer-register`
2. Fill out the form with:
   - Company Name
   - Tax ID (unique)
   - Business Type
   - Email
   - Password
3. Submit the form
4. You should see: "Application Received! You are the primary account holder..."
5. You should be redirected to `/dealer-login`

## Troubleshooting

### If you still get RLS errors:
1. Verify the migration ran successfully
2. Check that the function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'create_dealer_for_registration';
   ```
3. Check that the function has the correct permissions:
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.routine_privileges 
   WHERE routine_name = 'create_dealer_for_registration';
   ```

### If you get "function does not exist" error:
- Make sure you ran the migration SQL file
- Check that you're connected to the correct Supabase project

### If registration succeeds but profile creation fails:
- Check the browser console for detailed error messages
- Verify that the `profiles` table RLS policies are correct
- Check that the `dealer_id` foreign key constraint is valid

