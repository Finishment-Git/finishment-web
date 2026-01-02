# Database Migration Instructions

## Problem
The `dealers` table doesn't exist in your Supabase database, causing the error:
```
Could not find the table 'public.dealers' in the schema cache
```

## Solution: Run the Migration

You need to execute the migration SQL file in your Supabase database. Here are two methods:

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Migration**
   - Open the file: `supabase/migrations/001_multi_user_dealer_system.sql`
   - Copy the entire contents
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for the migration to complete (should take a few seconds)

5. **Verify Success**
   - You should see "Success. No rows returned" or similar message
   - Check the Table Editor to confirm the `dealers` table exists

### Method 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## What the Migration Does

1. ✅ Creates the `dealers` table (company-level accounts)
2. ✅ Adds new columns to `profiles` table (`dealer_id`, `is_primary`, `can_order`)
3. ✅ Migrates existing data (if any profiles exist)
4. ✅ Creates indexes for performance
5. ✅ Sets up Row Level Security (RLS) policies
6. ✅ Creates triggers for automatic timestamp updates

## After Running the Migration

Once the migration is complete:
- ✅ The dealer registration form should work
- ✅ New dealers can be created
- ✅ Users can register and join dealer accounts

## Troubleshooting

### If you get an error about existing policies:
The migration uses `CREATE POLICY IF NOT EXISTS` for most policies, but some older PostgreSQL versions might not support this. If you get a "policy already exists" error:
- Drop the existing policy first, or
- Modify the migration to use `DROP POLICY IF EXISTS` before creating

### If you get an error about the profiles table:
Make sure the `profiles` table exists first. If it doesn't, you may need to create it or run any previous migrations.

### Verify the migration worked:
Run this query in SQL Editor to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'dealers';
```

You should see `dealers` in the results.

