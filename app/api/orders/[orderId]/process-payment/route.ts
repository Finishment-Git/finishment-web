import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { processNMISale } from '@/lib/nmi';
import { NextResponse } from 'next/server';

export async function POST(
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
      .select('dealer_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_payments(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.dealer_id !== profile.dealer_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payment = order.order_payments?.[0];
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }
    if (order.payment_method !== 'card') {
      return NextResponse.json({ error: 'Order is not configured for card payment' }, { status: 400 });
    }
    if (payment.payment_received) {
      return NextResponse.json({ error: 'Payment has already been received' }, { status: 400 });
    }
    if (!payment.amount_cents || payment.amount_cents <= 0) {
      return NextResponse.json({ error: 'Order amount has not been set. Please contact us to complete payment.' }, { status: 400 });
    }

    const body = await request.json();
    const { payment_token } = body;
    if (!payment_token || typeof payment_token !== 'string') {
      return NextResponse.json({ error: 'Payment token is required' }, { status: 400 });
    }

    const shipping = order.shipping_address as { address1?: string; city?: string; state?: string; zip?: string } | null;
    const contact = order.contact_info as { name?: string } | null;
    const nameParts = (contact?.name || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Customer').split(' ');
    const firstName = order.first_name || nameParts[0] || 'Customer';
    const lastName = order.last_name || nameParts.slice(1).join(' ') || '';

    const result = await processNMISale({
      paymentToken: payment_token,
      amountDollars: payment.amount_cents / 100,
      orderId: order.order_number,
      firstName,
      lastName,
      address1: shipping?.address1,
      city: shipping?.city,
      state: shipping?.state,
      zip: shipping?.zip,
      country: 'US',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { error: updateError } = await admin
      .from('order_payments')
      .update({
        payment_received: true,
        received_date: new Date().toISOString(),
        transaction_reference: result.transactionId,
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
      return NextResponse.json({ error: 'Payment processed but failed to update record. Please contact support.' }, { status: 500 });
    }

    await admin
      .from('orders')
      .update({ status: 'MATERIALS_RECEIVED', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Process payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
