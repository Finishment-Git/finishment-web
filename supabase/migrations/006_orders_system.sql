-- Migration: Orders System
-- This migration creates the orders, payments, and audit log tables

-- Step 1: Create order_status ENUM
CREATE TYPE order_status AS ENUM (
  'PENDING_PAYMENT',
  'PAYMENT_ARRANGED',
  'MATERIALS_RECEIVED',
  'READY_FOR_PRODUCTION',
  'IN_PRODUCTION',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED'
);

-- Step 2: Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_method TEXT CHECK (payment_method IN ('card', 'check', 'ach')),
  total_amount_cents INT NOT NULL,
  order_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB,
  contact_info JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create order_payments table
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'check', 'ach')),
  amount_cents INT NOT NULL,
  payment_received BOOLEAN DEFAULT FALSE,
  received_date TIMESTAMP WITH TIME ZONE,
  received_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create order_audit_log table
CREATE TABLE IF NOT EXISTS order_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_dealer_id ON orders(dealer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_received_by ON order_payments(received_by);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order_id ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_admin_user_id ON order_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_created_at ON order_audit_log(created_at);

-- Step 6: Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate format: ORD-YYYYMMDD-HHMMSS-RANDOM
    new_order_number := 'ORD-' || 
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      TO_CHAR(NOW(), 'HH24MISS') || '-' ||
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number) INTO exists_check;
    
    -- If it doesn't exist, we're done
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to update updated_at on orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Enable Row Level Security on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 9: Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Step 10: Create security definer function to check if user is admin or production manager
CREATE OR REPLACE FUNCTION is_admin_or_production_manager()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND role IN ('admin', 'production_manager')
  );
$$;

-- Step 11: Create security definer function to check if user is admin or customer service
CREATE OR REPLACE FUNCTION is_admin_or_customer_service()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  );
$$;

-- Step 12: Create security definer function to check if user is any admin user
CREATE OR REPLACE FUNCTION is_any_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  );
$$;

-- Step 13: RLS Policies for orders table

-- Policy: Dealers can view their own orders
CREATE POLICY "Dealers can view their own orders"
  ON orders FOR SELECT
  USING (
    dealer_id IN (
      SELECT dealer_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Admin users can view all orders
CREATE POLICY "Admin users can view all orders"
  ON orders FOR SELECT
  USING (is_any_admin_user());

-- Policy: Dealers can insert their own orders
CREATE POLICY "Dealers can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (
    dealer_id IN (
      SELECT dealer_id FROM profiles WHERE id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

-- Policy: Admin and production managers can update orders
CREATE POLICY "Admin and production managers can update orders"
  ON orders FOR UPDATE
  USING (is_admin_or_production_manager())
  WITH CHECK (is_admin_or_production_manager());

-- Policy: Only admins can delete orders
CREATE POLICY "Only admins can delete orders"
  ON orders FOR DELETE
  USING (is_admin_user());

-- Step 14: RLS Policies for order_payments table

-- Policy: Dealers can view payments for their orders
CREATE POLICY "Dealers can view their order payments"
  ON order_payments FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE dealer_id IN (
        SELECT dealer_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy: Admin users can view all payments
CREATE POLICY "Admin users can view all payments"
  ON order_payments FOR SELECT
  USING (is_any_admin_user());

-- Policy: Admin and customer service can manage payments
CREATE POLICY "Admin and customer service can manage payments"
  ON order_payments FOR ALL
  USING (is_admin_or_customer_service())
  WITH CHECK (is_admin_or_customer_service());

-- Step 15: RLS Policies for order_audit_log table

-- Policy: Admin users can view audit logs
CREATE POLICY "Admin users can view audit logs"
  ON order_audit_log FOR SELECT
  USING (is_any_admin_user());

-- Policy: Admin users can insert audit logs
CREATE POLICY "Admin users can insert audit logs"
  ON order_audit_log FOR INSERT
  WITH CHECK (is_any_admin_user());

-- Note: Audit logs should be append-only, so no UPDATE or DELETE policies
