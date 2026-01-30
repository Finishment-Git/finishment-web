import { createClient } from '@/utils/supabase/server';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const adminUser = await requireAuth(['admin']);
    const supabase = await createClient();
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Prevent self-role change
    if (userId === adminUser.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ role })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update role', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const adminUser = await requireAuth(['admin']);
    const supabase = await createClient();

    // Prevent self-deletion
    if (userId === adminUser.id) {
      return NextResponse.json(
        { error: 'You cannot deactivate yourself' },
        { status: 400 }
      );
    }

    // Delete admin_users record (cascade will handle auth.users if configured)
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to deactivate user', details: deleteError.message },
        { status: 500 }
      );
    }

    // Also delete auth user
    await supabase.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
