-- Migration: Rename brand_name to manufacturer (or add manufacturer if missing)
-- Ensures orders table has manufacturer column for the order form

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'brand_name'
  ) THEN
    ALTER TABLE orders RENAME COLUMN brand_name TO manufacturer;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE orders ADD COLUMN manufacturer TEXT;
  END IF;
END $$;
