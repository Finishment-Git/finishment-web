import { requireAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { getStatusColor, getStatusLabel, formatAmount } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const adminUser = await requireAuth();
  const supabase = await createClient();

  // Get order counts by status
  const { data: ordersByStatus } = await supabase
    .from('orders')
    .select('status')
    .order('created_at', { ascending: false });

  // Get payment status summary
  const { data: payments } = await supabase
    .from('order_payments')
    .select('payment_received, amount_cents');

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total_amount_cents,
      created_at,
      dealers!inner(company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // Calculate metrics
  const statusCounts: Record<string, number> = {};
  ordersByStatus?.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  const totalOrders = ordersByStatus?.length || 0;
  const pendingPaymentOrders = statusCounts['PENDING_PAYMENT'] || 0;
  const inProductionOrders = statusCounts['IN_PRODUCTION'] || 0;
  const shippedOrders = statusCounts['SHIPPED'] || 0;

  const totalPaymentAmount = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0;
  const receivedPaymentAmount = payments
    ?.filter(p => p.payment_received)
    .reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0;
  const pendingPaymentAmount = totalPaymentAmount - receivedPaymentAmount;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Welcome back, {adminUser.full_name || adminUser.email}
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <MetricCard
          title="Total Orders"
          value={totalOrders.toString()}
          color="#3b82f6"
          link="/admin/orders"
        />
        <MetricCard
          title="Pending Payment"
          value={pendingPaymentOrders.toString()}
          color="#f59e0b"
          link="/admin/orders?status=PENDING_PAYMENT"
        />
        <MetricCard
          title="In Production"
          value={inProductionOrders.toString()}
          color="#10b981"
          link="/admin/orders?status=IN_PRODUCTION"
        />
        <MetricCard
          title="Shipped"
          value={shippedOrders.toString()}
          color="#6366f1"
          link="/admin/orders?status=SHIPPED"
        />
      </div>

      {/* Payment Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Total Payment Amount
          </h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {formatAmount(totalPaymentAmount)}
          </p>
        </div>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Received
          </h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
            {formatAmount(receivedPaymentAmount)}
          </p>
        </div>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Pending
          </h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {formatAmount(pendingPaymentAmount)}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View All →
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    Order Number
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    Dealer
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    Amount
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {order.dealers?.company_name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status)
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {formatAmount(order.total_amount_cents)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No orders yet
          </p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, color, link }: { title: string; value: string; color: string; link: string }) {
  return (
    <Link
      href={link}
      style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        textDecoration: 'none',
        display: 'block',
        transition: 'transform 0.2s'
      }}
    >
      <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '32px', fontWeight: 'bold', color, margin: 0 }}>
        {value}
      </p>
    </Link>
  );
}
