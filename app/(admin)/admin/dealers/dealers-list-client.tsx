'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Dealer {
  id: string;
  company_name: string;
  tax_id: string;
  business_type: string;
  status: string;
  created_at: string;
}

interface DealersListClientProps {
  initialDealers: Dealer[];
  statusFilter?: 'PENDING' | 'ACTIVE';
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function DealersListClient({
  initialDealers,
  statusFilter,
  searchQuery,
  currentPage,
  totalPages,
  totalCount,
}: DealersListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'ACTIVE' | ''>(statusFilter || '');

  const updateFilters = (newStatus?: 'PENDING' | 'ACTIVE' | '', newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus !== undefined) {
      if (newStatus) params.set('status', newStatus);
      else params.delete('status');
    }
    if (newSearch !== undefined) {
      if (newSearch) params.set('search', newSearch);
      else params.delete('search');
    }
    params.delete('page');
    router.push(`/admin/dealers?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(selectedStatus, search);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'PENDING' | 'ACTIVE' | '';
    setSelectedStatus(newStatus);
    updateFilters(newStatus, search);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/dealers?${params.toString()}`);
  };

  return (
    <div>
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
              placeholder="Company name, tax ID..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ minWidth: '160px' }}>
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
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
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
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#6b7280' }}>
          {totalCount} dealer{totalCount !== 1 ? 's' : ''} total
        </div>
        {initialDealers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Company</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Tax ID</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Business Type</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {initialDealers.map((dealer) => (
                  <tr key={dealer.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                      {dealer.company_name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{dealer.tax_id || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: dealer.status === 'ACTIVE' ? '#10b98120' : '#f59e0b20',
                        color: dealer.status === 'ACTIVE' ? '#059669' : '#d97706'
                      }}>
                        {dealer.status || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                      {dealer.business_type || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                      {new Date(dealer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No dealers found
          </p>
        )}
        {totalPages > 1 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage <= 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
