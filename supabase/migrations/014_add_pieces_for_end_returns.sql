-- Add pieces_for_end_returns to orders (0-10 dropdown)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pieces_for_end_returns INT DEFAULT 0;
