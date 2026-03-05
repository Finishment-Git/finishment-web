-- Migration: Rename collection to style (or add style if missing)
-- Ensures orders table has style column for the order form

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'collection'
  ) THEN
    ALTER TABLE orders RENAME COLUMN collection TO style;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'style'
  ) THEN
    ALTER TABLE orders ADD COLUMN style TEXT;
  END IF;
END $$;
