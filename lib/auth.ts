import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export type AdminUserRole = 'admin' | 'production_manager' | 'customer_service' | 'viewer'

export interface AdminUser {
  id: string
  email: string
  role: AdminUserRole
  full_name: string | null
  created_at: string
  last_login: string | null
}

/**
 * Get the current admin user from the session
 * Returns null if not authenticated or not an admin user
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !adminUser) {
    return null
  }
  
  return adminUser as AdminUser
}

/**
 * Require authentication and optionally check for specific roles
 * Throws error or redirects if not authenticated/authorized
 */
export async function requireAuth(allowedRoles?: AdminUserRole[]): Promise<AdminUser> {
  const adminUser = await getCurrentAdminUser()
  
  if (!adminUser) {
    redirect('/admin/login')
  }
  
  if (allowedRoles && !allowedRoles.includes(adminUser.role)) {
    redirect('/unauthorized')
  }
  
  return adminUser
}

/**
 * Check if user has permission for a specific action on a resource
 */
export function hasPermission(
  user: AdminUser | null,
  action: string,
  resource: string
): boolean {
  if (!user) {
    return false
  }
  
  // Admin has all permissions
  if (user.role === 'admin') {
    return true
  }
  
  // Define permission matrix
  const permissions: Record<AdminUserRole, Record<string, string[]>> = {
    admin: {
      orders: ['view', 'create', 'update', 'delete'],
      payments: ['view', 'update'],
      users: ['view', 'create', 'update', 'delete'],
      settings: ['view', 'update'],
    },
    production_manager: {
      orders: ['view', 'update'],
      payments: ['view'],
      users: [],
      settings: [],
    },
    customer_service: {
      orders: ['view'],
      payments: ['view', 'update'],
      users: [],
      settings: [],
    },
    viewer: {
      orders: ['view'],
      payments: ['view'],
      users: [],
      settings: [],
    },
  }
  
  const rolePermissions = permissions[user.role] || {}
  const resourcePermissions = rolePermissions[resource] || []
  
  return resourcePermissions.includes(action)
}

/**
 * Check if user can update order status
 */
export function canUpdateOrderStatus(
  user: AdminUser | null,
  currentStatus: string,
  newStatus: string
): boolean {
  if (!user) {
    return false
  }
  
  // Admin can do anything
  if (user.role === 'admin') {
    return true
  }
  
  // Production managers can update status
  if (user.role === 'production_manager') {
    return true
  }
  
  // Customer service can only update to certain statuses
  if (user.role === 'customer_service') {
    // Can mark payment received (which changes status)
    return newStatus === 'MATERIALS_RECEIVED' || newStatus === 'READY_FOR_PRODUCTION'
  }
  
  return false
}

/**
 * Check if user can manage payments
 */
export function canManagePayments(user: AdminUser | null): boolean {
  if (!user) {
    return false
  }
  
  return user.role === 'admin' || user.role === 'customer_service'
}

/**
 * Check if user can manage admin users
 */
export function canManageUsers(user: AdminUser | null): boolean {
  if (!user) {
    return false
  }
  
  return user.role === 'admin'
}

/**
 * Update last login timestamp for admin user
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
}
