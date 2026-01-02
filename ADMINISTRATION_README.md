# Dealer Account Administration Guide

## Overview

This system supports **multi-user dealer accounts** where:
- The **first user** registers and becomes the **Primary Account Holder**
- Additional users can be **invited** to join the same dealer account
- The primary user can **grant or revoke ordering permissions** for team members
- Primary users **always have ordering permissions** and cannot be revoked

---

## System Architecture

### Database Structure

#### `dealers` Table (Company-Level)
- `id` - Unique dealer account ID
- `company_name` - Legal company name
- `tax_id` - Tax ID / Reseller number (unique)
- `business_type` - Type of business (Retailer, Contractor, Designer)
- `status` - Account status: `PENDING` or `ACTIVE`
- `created_at`, `updated_at` - Timestamps

#### `profiles` Table (User-Level)
- `id` - User ID (links to auth.users)
- `dealer_id` - Foreign key to `dealers` table
- `is_primary` - Boolean: `true` for the first/primary user
- `can_order` - Boolean: Whether user can place orders
- `status` - User status: `PENDING` or `ACTIVE`
- `company_name`, `tax_id`, `business_type` - Copied from dealer for convenience

### Key Relationships
- One `dealer` → Many `profiles` (one-to-many)
- Each `profile` belongs to exactly one `dealer`
- Only one `profile` per dealer has `is_primary = true`

---

## User Roles & Permissions

### Primary Account Holder (`is_primary = true`)
**Capabilities:**
- ✅ Always has ordering permissions (cannot be revoked)
- ✅ Can manage team members
- ✅ Can grant/revoke ordering permissions for team members
- ✅ Can view all team member information
- ✅ Can invite new users to join the dealer account
- ✅ Completes training to activate dealer account

**Limitations:**
- Cannot remove themselves as primary (requires admin intervention)
- Cannot transfer primary status (requires admin intervention)

### Team Members (`is_primary = false`)
**Capabilities:**
- ✅ Can view dealer information
- ✅ Can access dashboard
- ✅ Can complete training (if status is PENDING)
- ✅ Can place orders **IF** `can_order = true` (granted by primary user)
- ❌ Cannot manage team members
- ❌ Cannot grant permissions to others

**Default State:**
- `can_order = false` (must be granted by primary user)
- `status = 'PENDING'` (must complete training)

---

## Registration Flows

### Flow 1: Primary User Registration
**Path:** `/dealer-register`

1. User fills out registration form:
   - Company Name
   - Tax ID
   - Business Type
   - Email
   - Password

2. System creates:
   - Auth user account
   - New `dealer` record
   - `profile` record with:
     - `dealer_id` = new dealer ID
     - `is_primary = true`
     - `can_order = true`
     - `status = 'PENDING'`

3. User completes training → `status = 'ACTIVE'`
4. User can now place orders

### Flow 2: Team Member Joining
**Path:** `/dealer-join`

1. User enters Tax ID (provided by primary user)
2. System searches for existing dealer by Tax ID
3. If found and dealer is `ACTIVE`:
   - User creates account (email + password)
   - System creates `profile` linked to existing dealer:
     - `dealer_id` = existing dealer ID
     - `is_primary = false`
     - `can_order = false` (default)
     - `status = 'PENDING'`
4. User completes training → `status = 'ACTIVE'`
5. Primary user must grant `can_order = true` for ordering access

---

## Authorization Logic

### Ordering Page Access
User can access `/dealer/ordering` **IF**:
```
status === 'ACTIVE' AND (is_primary === true OR can_order === true)
```

### Team Management Access
User can access `/dealer/team` **IF**:
```
is_primary === true
```

### Dashboard Access
All authenticated users can access `/dealer/dashboard`

---

## Primary User Workflows

### Inviting a Team Member

1. **Navigate to Team Management**
   - Go to `/dealer/team` (only visible to primary users)

2. **Get Invite Information**
   - Enter team member's email
   - Click "Get Invite Link"
   - System displays:
     - Join link: `/dealer-join`
     - Tax ID to share

3. **Share with Team Member**
   - Send them the Tax ID
   - Direct them to `/dealer-join`
   - They register using the Tax ID

4. **Team Member Appears in List**
   - Once registered, they appear in Team Members list
   - Status: `PENDING` (must complete training)

### Granting Ordering Permissions

1. **View Team Members**
   - Go to `/dealer/team`
   - See all team members with their current permissions

2. **Toggle Permissions**
   - Click "Allow Ordering" to grant permission
   - Click "Revoke Ordering" to remove permission
   - Changes take effect immediately

3. **Permission States**
   - ✅ **Authorized**: `can_order = true` → Can place orders
   - ❌ **Not Authorized**: `can_order = false` → Cannot place orders

### Viewing Team Status

The Team Management page shows:
- **Email** (or user ID if email unavailable)
- **Role**: PRIMARY badge for primary user
- **Status**: PENDING or ACTIVE
- **Ordering Permission**: Authorized or Not Authorized
- **Action Buttons**: Toggle ordering permission (for non-primary users)

---

## Team Member Workflows

### Joining an Existing Dealer Account

1. **Get Tax ID from Primary User**
   - Primary user shares the dealer's Tax ID

2. **Navigate to Join Page**
   - Go to `/dealer-join`
   - Enter the Tax ID
   - Click "Find Dealer Account"

3. **Create Account**
   - If dealer found, enter email and password
   - Account is created and linked to dealer
   - Default: `can_order = false`, `status = 'PENDING'`

4. **Complete Training**
   - Go to `/dealer/education`
   - Complete training → `status = 'ACTIVE'`

5. **Request Ordering Permission**
   - Contact primary user to request `can_order = true`
   - Once granted, can access `/dealer/ordering`

### Checking Ordering Status

1. **View Dashboard**
   - Go to `/dealer/dashboard`
   - See current status:
     - Account Status: PENDING or ACTIVE
     - Role: Primary Account Holder or Team Member
     - Ordering Permission: Authorized or Not Authorized

2. **If Not Authorized**
   - Contact primary account holder
   - Request ordering permissions
   - Wait for primary user to grant access

---

## Status Flow

### Dealer Account Status
```
PENDING → (Admin/System Approval) → ACTIVE
```

### User Status
```
PENDING → (Complete Training) → ACTIVE
```

### Ordering Permission
```
can_order = false → (Primary User Grants) → can_order = true
```

**Note:** Primary users always have `can_order = true` and cannot be revoked.

---

## Database Migration

### Running the Migration

1. **Access Supabase Dashboard**
   - Go to SQL Editor
   - Or use Supabase CLI

2. **Run Migration File**
   - Execute: `supabase/migrations/001_multi_user_dealer_system.sql`
   - This will:
     - Create `dealers` table
     - Add columns to `profiles` table
     - Migrate existing data (creates dealer for each existing profile)
     - Set up RLS policies
     - Create indexes

3. **Verify Migration**
   - Check that all existing profiles have `dealer_id`
   - Verify primary users have `is_primary = true`
   - Confirm RLS policies are active

### Data Migration Notes

- **Existing Users**: Automatically migrated to have their own dealer account
- **Primary Status**: All existing users set as `is_primary = true`
- **Ordering Permission**: All existing users set as `can_order = true`

---

## Row Level Security (RLS) Policies

### Dealers Table
- **SELECT**: Users can view dealers they belong to
- **UPDATE**: Only primary users can update their dealer

### Profiles Table
- **SELECT**: Users can view profiles in their dealer account
- **UPDATE**: 
  - Users can update their own profile
  - Primary users can update any profile in their dealer

---

## Common Scenarios

### Scenario 1: New Dealer Registration
1. User registers at `/dealer-register`
2. Creates dealer account + primary user profile
3. Completes training
4. Can immediately place orders

### Scenario 2: Adding Team Member
1. Primary user gets invite link from `/dealer/team`
2. Shares Tax ID with team member
3. Team member joins at `/dealer-join`
4. Team member completes training
5. Primary user grants ordering permission
6. Team member can now place orders

### Scenario 3: Revoking Access
1. Primary user goes to `/dealer/team`
2. Clicks "Revoke Ordering" for team member
3. Team member loses ordering access immediately
4. Can still access dashboard but not ordering page

### Scenario 4: Team Member Without Permission
1. Team member logs in
2. Sees dashboard with "Ordering Not Authorized" message
3. Contacts primary user
4. Primary user grants permission
5. Team member can now access ordering

---

## Troubleshooting

### Issue: "Only primary account holder can manage team members"
**Solution:** User is not the primary account holder. Only the first registered user for a dealer account has this permission.

### Issue: "Dealer account not found" when joining
**Solution:** 
- Verify Tax ID is correct
- Ensure dealer account exists and is ACTIVE
- Contact primary user to confirm Tax ID

### Issue: "Ordering Not Authorized" for team member
**Solution:**
- Team member must have `can_order = true`
- Primary user must grant permission in Team Management
- Check user status is ACTIVE

### Issue: Cannot see Team Management link
**Solution:** 
- Only primary users see this link
- Verify user's `is_primary` status in database
- If needed, update manually: `UPDATE profiles SET is_primary = true WHERE id = 'user-id'`

---

## API/Code Reference

### Key Functions

#### Check if User Can Order
```typescript
const canOrder = profile.status === 'ACTIVE' && 
                 (profile.is_primary || profile.can_order);
```

#### Check if User is Primary
```typescript
const isPrimary = profile.is_primary === true;
```

#### Get Team Members
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('dealer_id', dealerId)
  .order('is_primary', { ascending: false });
```

#### Grant Ordering Permission
```typescript
await supabase
  .from('profiles')
  .update({ can_order: true })
  .eq('id', userId);
```

#### Revoke Ordering Permission
```typescript
await supabase
  .from('profiles')
  .update({ can_order: false })
  .eq('id', userId)
  .neq('is_primary', true); // Prevent revoking primary user
```

---

## Future Enhancements

Potential improvements:
- Email invitation system (automated invites)
- Role-based permissions (beyond just ordering)
- Transfer primary status functionality
- Bulk user management
- Activity logs for permission changes
- Email notifications for permission grants/revocations

---

## Support

For issues or questions:
1. Check this documentation
2. Review database schema and RLS policies
3. Check user permissions in `profiles` table
4. Verify dealer account status in `dealers` table

---

**Last Updated:** 2024
**Version:** 1.0

