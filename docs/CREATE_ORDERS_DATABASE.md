# Creating the Orders Database

This guide walks you through setting up the orders system in your Supabase database. The orders tables depend on `dealers`, `profiles`, and `admin_users`—so those must exist first.

---

## Prerequisites

Before running the orders migrations, your database must have:

- **dealers** table
- **profiles** table (with `dealer_id`, `is_primary`, `can_order` columns)
- **admin_users** table
- **update_updated_at_column()** function (from the dealer system migration)

If you've already run migrations 001 through 005, you're ready. If not, run those first in order.

---

## Step 1: Open Supabase SQL Editor

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

---

## Step 2: Run Migration 006 (Orders System)

This creates the core orders tables and RLS policies.

1. Open `supabase/migrations/006_orders_system.sql` in your project
2. Copy the **entire contents** of the file
3. Paste into the SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
5. Wait for "Success. No rows returned" or similar

**What this creates:**
- `order_status` enum (PENDING_PAYMENT, PAYMENT_ARRANGED, etc.)
- `orders` table (links to dealers and profiles)
- `order_payments` table
- `order_audit_log` table
- `generate_order_number()` function
- RLS policies so dealers can create/view their orders and admins can manage them

---

## Step 3: Run Migration 008 (Order Form Fields)

This adds the detailed fields your order form uses (first name, stair details, manufacturer, etc.).

1. Open `supabase/migrations/008_update_orders_schema.sql`
2. Copy the entire contents
3. Paste into a **new query** in the SQL Editor
4. Click **Run**

**What this adds:**
- `first_name`, `last_name`, `company`, `purchase_order_number`, `sidemark`, `phone`
- `stair_type`, `steps_no_open_return`, `steps_one_open_return`, `steps_two_open_return`
- `longest_plank_size`, `steps_details`
- `brand_name`, `collection`, `color`, `floor_match_description`
- `rail_cap_trim_needed`, `rail_cap_trim_details`
- `project_images` (array of image URLs)
- Storage bucket `order-images` and its RLS policies

---

## Step 4: Run Migration 009 (Rename brand_name → manufacturer)

1. Open `supabase/migrations/009_rename_brand_name_to_manufacturer.sql`
2. Copy the contents
3. Paste into a new query
4. Click **Run**

---

## Step 5: Run Migration 010 (Rename collection → style)

1. Open `supabase/migrations/010_rename_collection_to_style.sql`
2. Copy the contents
3. Paste into a new query
4. Click **Run**

---

## Step 6: Run Migration 011 (Order Images Table)

This creates a dedicated table for order image metadata (optional but recommended).

1. Open `supabase/migrations/011_create_order_images_table.sql`
2. Copy the entire contents
3. Paste into a new query
4. Click **Run**

**What this creates:**
- `order_images` table (links images to orders with metadata)
- RLS policies for dealers and admins
- Ensures the `order-images` storage bucket exists

---

## Verify It Worked

Run this query in the SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_payments', 'order_images');
```

You should see all three tables listed.

---

## Troubleshooting

### "relation 'dealers' does not exist"
Run migration `001_multi_user_dealer_system.sql` first (and any earlier migrations it depends on).

### "relation 'admin_users' does not exist"
Run migration `005_admin_users_system.sql` first.

### "function update_updated_at_column() does not exist"
Run migration `001_multi_user_dealer_system.sql`—it creates this function.

### "column already exists" or "policy already exists"
The migrations use `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` where possible. If you see conflicts, you may have partially run migrations before. Check which objects exist and either skip that migration or drop the conflicting object first (with caution).

---

## Migration Order Summary

| Order | File | Purpose |
|-------|------|---------|
| 1 | 006_orders_system.sql | Core orders, payments, audit log |
| 2 | 008_update_orders_schema.sql | Order form fields + storage bucket |
| 3 | 009_rename_brand_name_to_manufacturer.sql | Column rename |
| 4 | 010_rename_collection_to_style.sql | Column rename |
| 5 | 011_create_order_images_table.sql | Order images table |
