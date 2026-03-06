import { requireAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import DealersListClient from './dealers-list-client';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

export default async function DealersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const adminUser = await requireAuth(['admin']);
  const supabase = await createClient();

  const statusFilter = searchParams.status as 'PENDING' | 'ACTIVE' | undefined;
  const searchQuery = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('dealers')
    .select('id, company_name, tax_id, business_type, status, created_at', { count: 'exact' });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  if (searchQuery) {
    query = query.or(`company_name.ilike.%${searchQuery}%,tax_id.ilike.%${searchQuery}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data: dealers, error, count } = await query;

  if (error) {
    console.error('Error fetching dealers:', error);
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Dealers
        </h1>
        <p style={{ color: '#6b7280' }}>
          All dealerships and their status
        </p>
      </div>

      <DealersListClient
        initialDealers={dealers || []}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  );
}
