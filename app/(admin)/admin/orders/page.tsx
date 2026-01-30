import { requireAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { getStatusColor, getStatusLabel, formatAmount, type OrderStatus } from '@/lib/orders';
import OrdersListClient from './orders-list-client';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
  sort?: string;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const adminUser = await requireAuth();
  const supabase = await createClient();

  const statusFilter = searchParams.status as OrderStatus | undefined;
  const searchQuery = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const sortBy = searchParams.sort || 'created_at';
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Build query
  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total_amount_cents,
      payment_method,
      created_at,
      dealers!inner(company_name),
      profiles!created_by(email)
    `, { count: 'exact' });

  // Apply filters
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  if (searchQuery) {
    query = query.or(`order_number.ilike.%${searchQuery}%,dealers.company_name.ilike.%${searchQuery}%`);
  }

  // Apply sorting
  if (sortBy === 'created_at') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'order_number') {
    query = query.order('order_number', { ascending: true });
  } else if (sortBy === 'total_amount_cents') {
    query = query.order('total_amount_cents', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data: orders, error, count } = await query;

  // Get payment status for each order
  const orderIds = orders?.map(o => o.id) || [];
  const { data: payments } = await supabase
    .from('order_payments')
    .select('order_id, payment_received')
    .in('order_id', orderIds);

  const paymentMap = new Map(
    payments?.map(p => [p.order_id, p.payment_received]) || []
  );

  // Get all statuses for filter dropdown
  const { data: allStatuses } = await supabase
    .from('orders')
    .select('status');

  const statusCounts: Record<string, number> = {};
  allStatuses?.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Orders
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage and track all orders
        </p>
      </div>

      <OrdersListClient
        initialOrders={orders || []}
        paymentMap={Object.fromEntries(paymentMap)}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        currentPage={page}
        totalPages={totalPages}
        sortBy={sortBy}
        statusCounts={statusCounts}
        totalCount={count || 0}
      />
    </div>
  );
}
