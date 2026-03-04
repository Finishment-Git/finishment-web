import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('dealer_id, status, is_primary, can_order')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    if (profile.status !== 'ACTIVE' || (!profile.is_primary && !profile.can_order)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { payment_method } = body;
    if (!payment_method || !['card', 'check', 'ach'].includes(payment_method)) {
      return NextResponse.json({ error: 'Invalid payment_method' }, { status: 400 });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, dealer_id, created_by')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.dealer_id !== profile.dealer_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createServiceRoleClient();
    const { error: orderUpdateError } = await admin
      .from('orders')
      .update({ payment_method, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (orderUpdateError) {
      return NextResponse.json({ error: 'Failed to update order', details: orderUpdateError.message }, { status: 500 });
    }

    const { error: paymentUpdateError } = await admin
      .from('order_payments')
      .update({ payment_method })
      .eq('order_id', orderId);

    if (paymentUpdateError) {
      console.error('Failed to update order_payments:', paymentUpdateError);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Payment method update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
