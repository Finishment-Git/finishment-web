-- Migration: Rename brand_name to manufacturer
-- This migration renames the brand_name column to manufacturer in the orders table

ALTER TABLE orders
  RENAME COLUMN brand_name TO manufacturer;
