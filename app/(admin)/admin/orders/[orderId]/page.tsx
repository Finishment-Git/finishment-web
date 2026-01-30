import { requireAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { getStatusColor, getStatusLabel, formatAmount, getNextStatuses, type OrderStatus } from '@/lib/orders';
import { canUpdateOrderStatus, canManagePayments, canManageUsers } from '@/lib/auth';
import OrderDetailClient from './order-detail-client';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string }
}) {
  const adminUser = await requireAuth();
  const supabase = await createClient();

  // Get order with related data
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      dealers!inner(company_name, tax_id),
      profiles!created_by(email, id),
      order_payments(*),
      order_audit_log(
        *,
        admin_users(email, full_name)
      )
    `)
    .eq('id', params.orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  // Get payment info
  const payment = order.order_payments?.[0];
  const paymentReceived = payment?.payment_received || false;

  // Get audit log sorted by date
  const auditLog = (order.order_audit_log || []).sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Check permissions
  const canUpdate = canUpdateOrderStatus(adminUser, order.status, order.status);
  const canManagePayment = canManagePayments(adminUser);
  const canDelete = canManageUsers(adminUser);

  // Get next possible statuses
  const nextStatuses = getNextStatuses(order.status as OrderStatus);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Order {order.order_number}
            </h1>
            <p style={{ color: '#6b7280' }}>
              Created {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <span style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: getStatusColor(order.status as OrderStatus) + '20',
              color: getStatusColor(order.status as OrderStatus)
            }}>
              {getStatusLabel(order.status as OrderStatus)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Order Information */}
          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
              Order Information
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Dealer:</span>
                <p style={{ fontWeight: '500', marginTop: '4px' }}>
                  {order.dealers?.company_name || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Created By:</span>
                <p style={{ fontWeight: '500', marginTop: '4px' }}>
                  {order.profiles?.email || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Amount:</span>
                <p style={{ fontWeight: '500', marginTop: '4px', fontSize: '18px' }}>
                  {formatAmount(order.total_amount_cents)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Payment Method:</span>
                <p style={{ fontWeight: '500', marginTop: '4px', textTransform: 'uppercase' }}>
                  {order.payment_method || 'N/A'}
                </p>
              </div>
              {order.shipping_address && (
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Shipping Address:</span>
                  <pre style={{
                    marginTop: '4px',
                    padding: '8px',
                    background: '#f9fafb',
                    borderRadius: '4px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {JSON.stringify(order.shipping_address, null, 2)}
                  </pre>
                </div>
              )}
              {order.order_items && (
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Order Items:</span>
                  <pre style={{
                    marginTop: '4px',
                    padding: '8px',
                    background: '#f9fafb',
                    borderRadius: '4px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {JSON.stringify(order.order_items, null, 2)}
                  </pre>
                </div>
              )}
              {order.notes && (
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Notes:</span>
                  <p style={{ marginTop: '4px', fontSize: '14px' }}>
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Update and Actions */}
          <OrderDetailClient
            order={order}
            adminUser={adminUser}
            canUpdate={canUpdate}
            canManagePayment={canManagePayment}
            canDelete={canDelete}
            nextStatuses={nextStatuses}
            payment={payment}
            paymentReceived={paymentReceived}
          />

          {/* Audit Log */}
          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
              Status History
            </h2>
            {auditLog.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {auditLog.map((entry: any) => (
                  <div key={entry.id} style={{
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    borderLeft: '3px solid #3b82f6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: '500' }}>{entry.action}</span>
                        {entry.admin_users && (
                          <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>
                            by {entry.admin_users.full_name || entry.admin_users.email}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.notes && (
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                        {entry.notes}
                      </p>
                    )}
                    {entry.old_value && entry.new_value && (
                      <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#6b7280' }}>
                        <span style={{ textDecoration: 'line-through', marginRight: '8px' }}>
                          {JSON.stringify(entry.old_value)}
                        </span>
                        →
                        <span style={{ marginLeft: '8px', color: '#059669' }}>
                          {JSON.stringify(entry.new_value)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                No status history yet
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Payment Status */}
          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>
              Payment Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Status:</span>
                <p style={{ marginTop: '4px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: paymentReceived ? '#05966920' : '#f59e0b20',
                    color: paymentReceived ? '#059669' : '#f59e0b'
                  }}>
                    {paymentReceived ? 'Received' : 'Pending'}
                  </span>
                </p>
              </div>
              {payment && (
                <>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Amount:</span>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>
                      {formatAmount(payment.amount_cents)}
                    </p>
                  </div>
                  {payment.received_date && (
                    <div>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Received:</span>
                      <p style={{ marginTop: '4px', fontSize: '14px' }}>
                        {new Date(payment.received_date).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {payment.transaction_reference && (
                    <div>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Reference:</span>
                      <p style={{ marginTop: '4px', fontSize: '14px' }}>
                        {payment.transaction_reference}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a
                href={`mailto:${order.profiles?.email}`}
                style={{
                  padding: '10px',
                  background: '#f3f4f6',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#000',
                  textAlign: 'center',
                  fontSize: '14px'
                }}
              >
                Email Dealer
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
