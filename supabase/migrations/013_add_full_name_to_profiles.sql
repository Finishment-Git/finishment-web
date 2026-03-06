-- Add full_name column to profiles for dealer users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
