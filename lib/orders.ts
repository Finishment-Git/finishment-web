export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAYMENT_ARRANGED'
  | 'MATERIALS_RECEIVED'
  | 'READY_FOR_PRODUCTION'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'

/**
 * Get the next valid statuses from current status
 */
export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    PENDING_PAYMENT: ['PAYMENT_ARRANGED', 'CANCELLED'],
    PAYMENT_ARRANGED: ['MATERIALS_RECEIVED', 'CANCELLED'],
    MATERIALS_RECEIVED: ['READY_FOR_PRODUCTION', 'CANCELLED'],
    READY_FOR_PRODUCTION: ['IN_PRODUCTION', 'CANCELLED'],
    IN_PRODUCTION: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [], // Terminal state
    CANCELLED: [], // Terminal state
  }
  
  return statusFlow[currentStatus] || []
}

/**
 * Get the next logical status (for automatic transitions)
 */
export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const nextStatuses = getNextStatuses(currentStatus)
  // Return the first non-cancelled status, or null if none
  return nextStatuses.find(s => s !== 'CANCELLED') || null
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  // Can always stay in same status
  if (currentStatus === newStatus) {
    return true
  }
  
  // Can always cancel (except if already cancelled or completed)
  if (newStatus === 'CANCELLED' && currentStatus !== 'CANCELLED' && currentStatus !== 'COMPLETED') {
    return true
  }
  
  // Check if new status is in valid next statuses
  const nextStatuses = getNextStatuses(currentStatus)
  return nextStatuses.includes(newStatus)
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    PENDING_PAYMENT: '#f59e0b', // amber
    PAYMENT_ARRANGED: '#3b82f6', // blue
    MATERIALS_RECEIVED: '#8b5cf6', // purple
    READY_FOR_PRODUCTION: '#06b6d4', // cyan
    IN_PRODUCTION: '#10b981', // green
    SHIPPED: '#6366f1', // indigo
    COMPLETED: '#059669', // emerald
    CANCELLED: '#ef4444', // red
  }
  
  return colors[status] || '#6b7280'
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Pending Payment',
    PAYMENT_ARRANGED: 'Payment Arranged',
    MATERIALS_RECEIVED: 'Materials Received',
    READY_FOR_PRODUCTION: 'Ready for Production',
    IN_PRODUCTION: 'In Production',
    SHIPPED: 'Shipped',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }
  
  return labels[status] || status
}

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-HHMMSS-RANDOM
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `ORD-${dateStr}-${timeStr}-${random}`
}

/**
 * Format amount in cents to dollars
 */
export function formatAmount(amountCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100)
}

/**
 * Check if order can be updated by role
 */
export function canUpdateStatus(
  userRole: string,
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  // Admin can do anything
  if (userRole === 'admin') {
    return true
  }
  
  // Production managers can update status
  if (userRole === 'production_manager') {
    return isValidStatusTransition(currentStatus, newStatus)
  }
  
  // Customer service can mark payment received (which changes status)
  if (userRole === 'customer_service') {
    return (
      newStatus === 'MATERIALS_RECEIVED' || 
      newStatus === 'READY_FOR_PRODUCTION'
    )
  }
  
  return false
}
