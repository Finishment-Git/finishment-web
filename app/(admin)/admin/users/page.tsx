import { requireAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import AdminUsersClient from './admin-users-client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  // Require admin role
  const adminUser = await requireAuth(['admin']);
  const supabase = await createClient();

  // Get all admin users
  const { data: adminUsers, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin users:', error);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Admin Users
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage admin users and their roles
        </p>
      </div>

      <AdminUsersClient initialUsers={adminUsers || []} currentUser={adminUser} />
    </div>
  );
}
