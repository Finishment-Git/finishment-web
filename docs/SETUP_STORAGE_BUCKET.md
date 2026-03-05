# Setting Up Storage Bucket for Order Images

The order form requires a Supabase Storage bucket named `order-images` to upload project photos.

## How to Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Set the bucket name to: `order-images`
5. Make sure **Public bucket** is checked (enabled)
6. Click **Create bucket**

## Set Up RLS Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. You can run the migration file `008_update_orders_schema.sql` which includes the policies, or manually create them:

1. Go to **Storage** > **Policies** for the `order-images` bucket
2. Create the following policies:

**Policy 1: Dealers can upload order images**
- Policy name: "Dealers can upload order images"
- Allowed operation: INSERT
- Target roles: authenticated
- USING expression: `bucket_id = 'order-images'`
- WITH CHECK expression: `bucket_id = 'order-images'`

**Policy 2: Dealers can view their order images**
- Policy name: "Dealers can view their order images"
- Allowed operation: SELECT
- Target roles: authenticated
- USING expression: `bucket_id = 'order-images'`

**Policy 3: Admins can view all order images**
- Policy name: "Admins can view all order images"
- Allowed operation: SELECT
- Target roles: authenticated
- USING expression: `bucket_id = 'order-images' AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin')`

## Verify the Bucket

After creating the bucket and policies, test the image upload functionality on the order form to ensure it works correctly.
