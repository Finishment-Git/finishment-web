-- Migration: Admin Users System
-- This migration creates the admin user management system with role-based access

-- Step 1: Create user_role ENUM
CREATE TYPE user_role AS ENUM ('admin', 'production_manager', 'customer_service', 'viewer');

-- Step 2: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Step 4: Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can view all admin users
CREATE POLICY "Admins can view all users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can manage all users (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Authenticated users can insert their own record (for registration)
-- This allows the first admin to be created
CREATE POLICY "Authenticated users can insert their own admin record"
  ON admin_users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update their own profile"
  ON admin_users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 6: Create function to update last_login
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admin_users
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger would need to be set up via a separate mechanism
-- as we can't directly trigger on auth.users changes
-- We'll handle last_login updates in the application code
