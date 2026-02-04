# Order Images System Documentation

## Overview

The order images system now uses a dedicated database table (`order_images`) to track uploaded project photos and their relationship to orders. This provides better organization, querying capabilities, and metadata tracking.

## Database Structure

### `order_images` Table

The `order_images` table stores metadata for each uploaded image:

- `id` (UUID): Primary key
- `order_id` (UUID): Foreign key to `orders` table
- `image_url` (TEXT): Public URL of the image in Supabase Storage
- `file_name` (TEXT): Original filename
- `file_size` (BIGINT): File size in bytes
- `file_type` (TEXT): MIME type (e.g., "image/jpeg")
- `uploaded_by` (UUID): User ID who uploaded the image
- `uploaded_at` (TIMESTAMPTZ): Timestamp of upload
- `created_at` (TIMESTAMPTZ): Record creation timestamp

### Storage Bucket

Images are stored in the Supabase Storage bucket `order-images`:
- **Bucket name**: `order-images`
- **Public**: Yes (publicly accessible)
- **Path structure**: `{user_id}/{timestamp}_{random}.{ext}`

## API Usage

### Creating an Order with Images

When creating an order, send images in two formats:

1. **`project_images`** (array of strings): Array of image URLs for backward compatibility
2. **`image_metadata`** (array of objects): Array with full metadata

```json
{
  "project_images": [
    "https://...",
    "https://..."
  ],
  "image_metadata": [
    {
      "url": "https://...",
      "fileName": "photo1.jpg",
      "fileSize": 123456,
      "fileType": "image/jpeg"
    }
  ]
}
```

The API will:
1. Create the order
2. Insert records into `order_images` table for each image
3. Maintain backward compatibility with the `project_images` array in the orders table

## Querying Images

### Get all images for an order

```sql
SELECT * FROM order_images 
WHERE order_id = 'order-uuid-here'
ORDER BY uploaded_at DESC;
```

### Get images uploaded by a specific user

```sql
SELECT oi.*, o.order_number 
FROM order_images oi
JOIN orders o ON oi.order_id = o.id
WHERE oi.uploaded_by = 'user-uuid-here';
```

### Get images with order details

```sql
SELECT 
  oi.*,
  o.order_number,
  o.first_name,
  o.last_name,
  o.purchase_order_number
FROM order_images oi
JOIN orders o ON oi.order_id = o.id
WHERE o.dealer_id = 'dealer-uuid-here';
```

## Row Level Security (RLS)

The `order_images` table has RLS policies:

1. **Dealers can view their order images**: Dealers can only see images for orders belonging to their dealer account
2. **Dealers can upload images**: Dealers can insert images for their own orders
3. **Admins can view all images**: Admins have full read access
4. **Admins can upload images**: Admins can insert images for any order

## Migration

Run migration `011_create_order_images_table.sql` to:
- Create the `order_images` table
- Set up indexes for performance
- Configure RLS policies
- Ensure the storage bucket exists

## Frontend Implementation

The frontend now stores image metadata in state:

```typescript
const [projectImages, setProjectImages] = useState<Array<{
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}>>([]);
```

When submitting, both formats are sent:
- `project_images`: Array of URLs (for backward compatibility)
- `image_metadata`: Array of objects with full metadata (for new table)

## Benefits

1. **Better Organization**: Images are properly linked to orders with foreign keys
2. **Metadata Tracking**: File names, sizes, and types are stored
3. **Audit Trail**: Track who uploaded what and when
4. **Querying**: Easy to find all images for a project or user
5. **Backward Compatibility**: Old `project_images` array still works
