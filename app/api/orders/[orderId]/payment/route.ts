import { createClient } from '@/utils/supabase/server';
import { requireAuth, canManagePayments } from '@/lib/auth';
import { sendPaymentConfirmation } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const adminUser = await requireAuth(['admin', 'customer_service']);
    
    if (!canManagePayments(adminUser)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const { transaction_reference, notes } = body;

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_payments(*)')
      .eq('id', params.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get payment record
    const payment = order.order_payments?.[0];
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Update payment
    const { error: updateError } = await supabase
      .from('order_payments')
      .update({
        payment_received: true,
        received_date: new Date().toISOString(),
        received_by: adminUser.id,
        transaction_reference: transaction_reference || null,
        notes: notes || null,
      })
      .eq('id', payment.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update payment', details: updateError.message },
        { status: 500 }
      );
    }

    // Update order status if needed
    let newStatus = order.status;
    if (order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_ARRANGED') {
      newStatus = 'MATERIALS_RECEIVED';
      
      const { error: statusError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', params.orderId);

      if (statusError) {
        console.error('Failed to update order status:', statusError);
      }
    }

    // Create audit log entry
    await supabase
      .from('order_audit_log')
      .insert({
        order_id: params.orderId,
        admin_user_id: adminUser.id,
        action: 'payment_received',
        old_value: { payment_received: false },
        new_value: { payment_received: true, received_date: new Date().toISOString() },
        notes: notes || `Payment received. Reference: ${transaction_reference || 'N/A'}`,
      });

    // Send confirmation email
    await sendPaymentConfirmation(order);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
