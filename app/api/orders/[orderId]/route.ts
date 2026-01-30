import { createClient } from '@/utils/supabase/server';
import { requireAuth, canManageUsers } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const adminUser = await requireAuth(['admin']);
    
    if (!canManageUsers(adminUser)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Get order first for audit log
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

    // Create audit log entry before deletion
    await supabase
      .from('order_audit_log')
      .insert({
        order_id: params.orderId,
        admin_user_id: adminUser.id,
        action: 'order_deleted',
        old_value: order,
        notes: `Order deleted by ${adminUser.email}`,
      });

    // Delete order (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', params.orderId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete order', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
