'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getStatusColor, getStatusLabel, formatAmount, type OrderStatus } from '@/lib/orders';

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount_cents: number;
  payment_method: string;
  created_at: string;
  dealers: { company_name: string };
  profiles: { email: string };
}

interface OrdersListClientProps {
  initialOrders: Order[];
  paymentMap: Record<string, boolean>;
  statusFilter?: OrderStatus;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  sortBy: string;
  statusCounts: Record<string, number>;
  totalCount: number;
}

export default function OrdersListClient({
  initialOrders,
  paymentMap,
  statusFilter,
  searchQuery,
  currentPage,
  totalPages,
  sortBy,
  statusCounts,
  totalCount,
}: OrdersListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>(statusFilter || '');

  const updateFilters = (newStatus?: OrderStatus | '', newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newStatus !== undefined) {
      if (newStatus) {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }
    }
    
    if (newSearch !== undefined) {
      if (newSearch) {
        params.set('search', newSearch);
      } else {
        params.delete('search');
      }
    }
    
    params.delete('page'); // Reset to page 1
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(selectedStatus, search);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus | '';
    setSelectedStatus(newStatus);
    updateFilters(newStatus, search);
  };

  const handleSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/admin/orders?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <div>
      {/* Filters and Search */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '1.5rem'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order number, dealer name..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              {Object.entries(statusCounts).map(([status, count]) => (
                <option key={status} value={status}>
                  {getStatusLabel(status as OrderStatus)} ({count})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              height: 'fit-content'
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing {initialOrders.length} of {totalCount} orders
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="created_at">Newest First</option>
              <option value="order_number">Order Number</option>
              <option value="total_amount_cents">Amount (High to Low)</option>
            </select>
          </div>
        </div>

        {initialOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                    Order Number
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                    Dealer
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                    Payment
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                    Amount
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                    Date
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      {order.dealers?.company_name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
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
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: paymentMap[order.id] ? '#05966920' : '#f59e0b20',
                        color: paymentMap[order.id] ? '#059669' : '#f59e0b'
                      }}>
                        {paymentMap[order.id] ? 'Received' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                      {formatAmount(order.total_amount_cents)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>No orders found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: currentPage === 1 ? '#f3f4f6' : '#fff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
