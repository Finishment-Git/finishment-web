import { createClient } from '@/utils/supabase/server';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const adminUser = await requireAuth(['admin']);
    const supabase = await createClient();
    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user', details: authError?.message },
        { status: 500 }
      );
    }

    // Create admin_users record
    const { data: adminUserData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        full_name: full_name || null,
        role: role || 'viewer',
      })
      .select()
      .single();

    if (adminError || !adminUserData) {
      // Rollback: delete auth user if admin_users creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create admin user record', details: adminError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: adminUserData }, { status: 201 });
  } catch (error: any) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
