-- Migration: Create order_images table for better photo management
-- This migration creates a dedicated table to track uploaded project images linked to orders

-- Create order_images table
CREATE TABLE IF NOT EXISTS order_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by order_id
CREATE INDEX IF NOT EXISTS idx_order_images_order_id ON order_images(order_id);

-- Create index for uploaded_by lookups
CREATE INDEX IF NOT EXISTS idx_order_images_uploaded_by ON order_images(uploaded_by);

-- Enable RLS
ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;

-- Policy: Dealers can view images for their own orders
CREATE POLICY IF NOT EXISTS "Dealers can view their order images"
  ON order_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON o.dealer_id = p.dealer_id
      WHERE o.id = order_images.order_id
      AND p.id = auth.uid()
    )
  );

-- Policy: Dealers can insert images for their own orders
CREATE POLICY IF NOT EXISTS "Dealers can upload images to their orders"
  ON order_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON o.dealer_id = p.dealer_id
      WHERE o.id = order_images.order_id
      AND p.id = auth.uid()
    )
  );

-- Policy: Admins can view all order images
CREATE POLICY IF NOT EXISTS "Admins can view all order images"
  ON order_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can insert images for any order
CREATE POLICY IF NOT EXISTS "Admins can upload images to any order"
  ON order_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure storage bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-images', 'order-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for order-images bucket (idempotent)
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

-- Add comment to table
COMMENT ON TABLE order_images IS 'Stores metadata for images uploaded to orders. Images are stored in Supabase Storage bucket "order-images".';
