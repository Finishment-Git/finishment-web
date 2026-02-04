import { createClient } from '@/utils/supabase/server';
import { generateOrderNumber } from '@/lib/orders';
import { sendOrderConfirmation, sendPaymentInstructionsCard, sendPaymentInstructionsCheck, sendPaymentInstructionsACH } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated (dealer)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile to get dealer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dealer_id, status, is_primary, can_order')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user can order
    if (profile.status !== 'ACTIVE' || (!profile.is_primary && !profile.can_order)) {
      return NextResponse.json(
        { error: 'Not authorized to place orders' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      // Basic information
      first_name,
      last_name,
      company,
      purchase_order_number,
      sidemark,
      phone,
      email,
      // Stair details
      stair_type,
      steps_no_open_return,
      steps_one_open_return,
      steps_two_open_return,
      longest_plank_size,
      steps_details,
      // Flooring match information
      manufacturer,
      style,
      color,
      floor_match_description,
      // Rail cap trim
      rail_cap_trim_needed,
      rail_cap_trim_details,
      // Images (can be array of URLs or array of objects with metadata)
      project_images,
      image_metadata, // Optional: array of {url, fileName, fileSize, fileType}
      // Payment and shipping
      payment_method,
      total_amount_cents,
      shipping_address,
      contact_info,
      notes,
    } = body;

    // Validate required fields
    if (!payment_method || !first_name || !last_name || !purchase_order_number || 
        !email || !sidemark || !phone || !longest_plank_size || 
        !steps_details || !manufacturer || !style || 
        !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate shipping address if provided
    if (shipping_address && (!shipping_address.name || !shipping_address.address1 || 
        !shipping_address.city || !shipping_address.state || 
        !shipping_address.zip || !shipping_address.phone)) {
      return NextResponse.json(
        { error: 'Please complete all required shipping address fields' },
        { status: 400 }
      );
    }

    // Validate stair layout - always require at least one step
    const totalSteps = (steps_no_open_return || 0) + (steps_one_open_return || 0) + (steps_two_open_return || 0);
    if (totalSteps === 0) {
      return NextResponse.json(
        { error: 'Please enter the number of steps for at least one stair layout option' },
        { status: 400 }
      );
    }

    // Determine initial status based on payment method
    let initialStatus = 'PENDING_PAYMENT';
    if (payment_method === 'check' || payment_method === 'ach') {
      initialStatus = 'PAYMENT_ARRANGED';
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with all new fields
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        dealer_id: profile.dealer_id,
        created_by: user.id,
        status: initialStatus,
        // Basic information
        first_name,
        last_name,
        company: company || null,
        purchase_order_number,
        sidemark,
        phone,
        // Stair details
        stair_type: stair_type || null,
        steps_no_open_return: steps_no_open_return || 0,
        steps_one_open_return: steps_one_open_return || 0,
        steps_two_open_return: steps_two_open_return || 0,
        longest_plank_size,
        steps_details,
        // Flooring match information
        manufacturer,
        style,
        color,
        floor_match_description,
        // Rail cap trim
        rail_cap_trim_needed: rail_cap_trim_needed || false,
        rail_cap_trim_details: rail_cap_trim_details || null,
        // Images
        project_images: project_images || [],
        // Payment and shipping
        payment_method,
        total_amount_cents: total_amount_cents || 0, // Will be calculated by admin
        order_items: [], // Empty for now, can be populated later if needed
        shipping_address,
        contact_info: contact_info || {
          email,
          phone,
          name: `${first_name} ${last_name}`,
        },
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError?.message },
        { status: 500 }
      );
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('order_payments')
      .insert({
        order_id: order.id,
        payment_method,
        amount_cents: total_amount_cents,
        payment_received: false,
      });

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
    }

    // Insert images into order_images table if provided
    if (project_images && project_images.length > 0) {
      const imageRecords = project_images.map((img: string | { url: string; fileName?: string; fileSize?: number; fileType?: string }) => {
        // Handle both string URLs and object format
        const imageUrl = typeof img === 'string' ? img : img.url;
        const fileName = typeof img === 'object' ? img.fileName : null;
        const fileSize = typeof img === 'object' ? img.fileSize : null;
        const fileType = typeof img === 'object' ? img.fileType : null;

        return {
          order_id: order.id,
          image_url: imageUrl,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          uploaded_by: user.id,
        };
      });

      const { error: imageError } = await supabase
        .from('order_images')
        .insert(imageRecords);

      if (imageError) {
        console.error('Failed to create image records:', imageError);
        // Don't fail the order creation if image records fail
      }
    }

    // Send email notifications (placeholders)
    await sendOrderConfirmation(order);
    if (payment_method === 'card') {
      await sendPaymentInstructionsCard(order);
    } else if (payment_method === 'check') {
      await sendPaymentInstructionsCheck(order);
    } else if (payment_method === 'ach') {
      await sendPaymentInstructionsACH(order);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
