import { requireAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import DealerUsersListClient from './dealer-users-list-client';

export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  page?: string;
}

export default async function DealerUsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const adminUser = await requireAuth(['admin']);
  const supabase = await createClient();

  const searchQuery = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('profiles')
    .select(`
      id,
      status,
      is_primary,
      can_order,
      company_name,
      full_name,
      dealer_id,
      dealers(company_name, tax_id)
    `, { count: 'exact' });

  if (searchQuery) {
    query = query.or(`company_name.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data: profiles, error, count } = await query;

  if (error) {
    console.error('Error fetching dealer users:', error);
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Dealer Users
        </h1>
        <p style={{ color: '#6b7280' }}>
          All users across all dealerships
        </p>
      </div>

      <DealerUsersListClient
        initialUsers={profiles || []}
        searchQuery={searchQuery}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  );
}
