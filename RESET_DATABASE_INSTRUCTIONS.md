# Reset and Rebuild Database Instructions

## Overview
This guide will help you completely reset your Supabase database and rebuild it from scratch with all the correct tables, policies, and functions.

## Option 1: Reset via Supabase Dashboard (Recommended)

### Step 1: Delete Existing Tables and Policies

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Cleanup Script**
   - Copy and paste this cleanup script:
   ```sql
   -- Drop all policies
   DROP POLICY IF EXISTS "Users can view their dealer" ON dealers;
   DROP POLICY IF EXISTS "Primary users can update their dealer" ON dealers;
   DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON dealers;
   DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
   DROP POLICY IF EXISTS "Users can view profiles in their dealer" ON profiles;
   DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
   DROP POLICY IF EXISTS "Primary users can update team member profiles" ON profiles;
   DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
   
   -- Drop functions
   DROP FUNCTION IF EXISTS get_user_dealer_id() CASCADE;
   DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
   
   -- Drop triggers
   DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
   DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
   
   -- Drop tables
   DROP TABLE IF EXISTS dealers CASCADE;
   ```
   - Click "Run"

### Step 2: Run the Fresh Setup Script

1. **Open the Fresh Setup Script**
   - Open the file: `supabase/migrations/000_complete_fresh_setup.sql`
   - Copy the entire contents

2. **Paste and Run in SQL Editor**
   - Paste into SQL Editor
   - Click "Run"
   - Wait for "Success" message

### Step 3: Verify Setup

Run this verification query:
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dealers', 'profiles');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('dealers', 'profiles');
```

## Option 2: Reset Database Completely (Nuclear Option)

⚠️ **WARNING: This will delete ALL data including users!**

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Go to Settings → Database**
   - Click "Settings" in the left sidebar
   - Click "Database"

3. **Reset Database**
   - Scroll down to "Reset Database" section
   - Click "Reset Database"
   - Confirm the reset (this deletes everything)

4. **Run Fresh Setup Script**
   - After reset, go to SQL Editor
   - Run `supabase/migrations/000_complete_fresh_setup.sql`

## Option 3: Use Supabase CLI (If Installed)

```bash
# Reset local database (if using local development)
supabase db reset

# Or push the fresh migration
supabase db push
```

## What the Fresh Setup Script Does

✅ **Creates Tables:**
- `dealers` table (company-level accounts)
- Ensures `profiles` table exists (Supabase manages this for auth)

✅ **Adds Columns:**
- Adds `dealer_id`, `is_primary`, `can_order` to profiles table

✅ **Creates Indexes:**
- Performance indexes on frequently queried columns

✅ **Creates Functions:**
- `get_user_dealer_id()` - Gets user's dealer ID without RLS recursion
- `update_updated_at_column()` - Auto-updates timestamps

✅ **Creates Triggers:**
- Auto-updates `updated_at` timestamps

✅ **Sets Up RLS Policies:**
- Dealers table: INSERT, SELECT, UPDATE policies
- Profiles table: INSERT, SELECT, UPDATE policies
- All policies are designed to avoid recursion issues

## After Running the Setup

1. ✅ Test dealer registration at `/dealer-register`
2. ✅ Test dealer login at `/dealer-login`
3. ✅ Test joining existing dealer at `/dealer-join`

## Troubleshooting

### Error: "relation already exists"
- The cleanup script should have removed it, but if you see this:
  - Run the cleanup script again
  - Or manually drop the object causing the error

### Error: "policy already exists"
- Run the cleanup script first to drop all policies
- Then run the fresh setup script

### Error: "function already exists"
- The cleanup script should handle this
- If not, manually drop: `DROP FUNCTION IF EXISTS function_name() CASCADE;`

### Still Getting RLS Errors?
- Make sure you ran the complete fresh setup script
- Check that all policies were created (use verification query above)
- Restart your Next.js dev server after running the script

## Need Help?

If you continue to have issues:
1. Check the Supabase logs (Dashboard → Logs)
2. Verify your environment variables are correct
3. Make sure you're connected to the right Supabase project

