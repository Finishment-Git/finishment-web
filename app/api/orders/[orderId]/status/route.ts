import { createClient } from '@/utils/supabase/server';
import { requireAuth, canUpdateOrderStatus } from '@/lib/auth';
import { isValidStatusTransition } from '@/lib/orders';
import { sendStatusUpdate } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const adminUser = await requireAuth(['admin', 'production_manager']);
    const supabase = await createClient();
    const body = await request.json();
    const { status, notes } = body;

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    if (!isValidStatusTransition(order.status, status)) {
      return NextResponse.json(
        { error: 'Invalid status transition' },
        { status: 400 }
      );
    }

    // Check permissions
    if (!canUpdateOrderStatus(adminUser, order.status, status)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', params.orderId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update status', details: updateError.message },
        { status: 500 }
      );
    }

    // Create audit log entry
    await supabase
      .from('order_audit_log')
      .insert({
        order_id: params.orderId,
        admin_user_id: adminUser.id,
        action: 'status_change',
        old_value: { status: order.status },
        new_value: { status },
        notes: notes || null,
      });

    // Send status update email
    await sendStatusUpdate(order, status, notes);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
