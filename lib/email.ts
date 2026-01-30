// Email notification functions - placeholder structure
// Ready for integration with email service (Resend, SendGrid, etc.)

interface Order {
  id: string
  order_number: string
  dealer_id: string
  total_amount_cents: number
  payment_method: string
  contact_info?: {
    email?: string
    phone?: string
    name?: string
  }
}

/**
 * Send payment instructions for credit card orders
 * Status: PENDING_PAYMENT - manual processing required
 */
export async function sendPaymentInstructionsCard(order: Order): Promise<void> {
  // TODO: Implement email sending
  // Example structure:
  // await emailService.send({
  //   to: order.contact_info?.email,
  //   subject: `Payment Instructions for Order ${order.order_number}`,
  //   template: 'payment_instructions_card',
  //   data: { order }
  // })
  
  console.log(`[Email] Payment instructions (card) for order ${order.order_number}`)
}

/**
 * Send payment instructions for check orders
 * Status: PAYMENT_ARRANGED - includes mailing address
 */
export async function sendPaymentInstructionsCheck(order: Order): Promise<void> {
  // TODO: Implement email sending
  // Should include:
  // - Mailing address for check
  // - Order number to include on check
  // - Amount due
  
  console.log(`[Email] Payment instructions (check) for order ${order.order_number}`)
}

/**
 * Send payment instructions for ACH orders
 * Status: PAYMENT_ARRANGED - includes bank details
 */
export async function sendPaymentInstructionsACH(order: Order): Promise<void> {
  // TODO: Implement email sending
  // Should include:
  // - Bank account details
  // - Routing number
  // - Account number
  // - Order number for reference
  
  console.log(`[Email] Payment instructions (ACH) for order ${order.order_number}`)
}

/**
 * Send payment confirmation when admin marks payment as received
 */
export async function sendPaymentConfirmation(order: Order): Promise<void> {
  // TODO: Implement email sending
  // Sent when payment_received = true
  
  console.log(`[Email] Payment confirmation for order ${order.order_number}`)
}

/**
 * Send order status update notification
 */
export async function sendStatusUpdate(
  order: Order,
  newStatus: string,
  notes?: string
): Promise<void> {
  // TODO: Implement email sending
  // Sent when order status changes
  
  console.log(`[Email] Status update for order ${order.order_number}: ${newStatus}`)
}

/**
 * Send order confirmation when order is first created
 */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  // TODO: Implement email sending
  // Sent immediately after order creation
  
  console.log(`[Email] Order confirmation for order ${order.order_number}`)
}
