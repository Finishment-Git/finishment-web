import { createClient } from '@/utils/supabase/server';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const adminUser = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();
    const { notes } = body;

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('notes')
      .eq('id', params.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order notes (append)
    const updatedNotes = order.notes 
      ? `${order.notes}\n\n[${new Date().toLocaleString()}] ${notes}`
      : `[${new Date().toLocaleString()}] ${notes}`;

    const { error: updateError } = await supabase
      .from('orders')
      .update({ notes: updatedNotes })
      .eq('id', params.orderId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update notes', details: updateError.message },
        { status: 500 }
      );
    }

    // Create audit log entry
    await supabase
      .from('order_audit_log')
      .insert({
        order_id: params.orderId,
        admin_user_id: adminUser.id,
        action: 'note_added',
        new_value: { notes },
        notes: notes,
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notes update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
