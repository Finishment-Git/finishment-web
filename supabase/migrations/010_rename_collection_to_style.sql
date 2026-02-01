-- Migration: Rename collection to style
-- This migration renames the collection column to style in the orders table

ALTER TABLE orders
  RENAME COLUMN collection TO style;
