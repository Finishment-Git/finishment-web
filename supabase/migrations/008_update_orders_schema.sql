-- Migration: Update Orders Schema for Detailed Order Form
-- This migration updates the orders table to support the new detailed order form structure

-- Update orders table to add new fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS purchase_order_number TEXT,
  ADD COLUMN IF NOT EXISTS sidemark TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS stair_type TEXT CHECK (stair_type IN ('standard_bullnose', 'other')),
  ADD COLUMN IF NOT EXISTS steps_no_open_return INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS steps_one_open_return INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS steps_two_open_return INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_plank_size TEXT,
  ADD COLUMN IF NOT EXISTS steps_details TEXT, -- Text describing steps (e.g., "18 Steps at 55 inches")
  ADD COLUMN IF NOT EXISTS flooring_size TEXT,
  ADD COLUMN IF NOT EXISTS brand_name TEXT,
  ADD COLUMN IF NOT EXISTS collection TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS floor_match_description TEXT,
  ADD COLUMN IF NOT EXISTS rail_cap_trim_needed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rail_cap_trim_details TEXT,
  ADD COLUMN IF NOT EXISTS project_images TEXT[]; -- Array of image URLs from Supabase Storage

-- Note: We keep existing fields:
-- - order_items (can store additional details if needed)
-- - shipping_address (for delivery)
-- - contact_info (for communication)
-- - notes (for any additional notes)

-- Add index for purchase order number lookups
CREATE INDEX IF NOT EXISTS idx_orders_po_number ON orders(purchase_order_number) WHERE purchase_order_number IS NOT NULL;

-- Create storage bucket for order images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-images', 'order-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for order-images bucket
CREATE POLICY IF NOT EXISTS "Dealers can upload order images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'order-images');

CREATE POLICY IF NOT EXISTS "Dealers can view their order images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-images');

CREATE POLICY IF NOT EXISTS "Admins can view all order images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'order-images' AND
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin'
    )
  );
