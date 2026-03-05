'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface DealerUser {
  id: string;
  status: string;
  is_primary: boolean;
  can_order: boolean;
  company_name: string | null;
  dealer_id: string;
  dealers: { company_name: string; tax_id: string } | { company_name: string; tax_id: string }[] | null;
}

interface DealerUsersListClientProps {
  initialUsers: DealerUser[];
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

function getDealerCompany(dealers: DealerUser['dealers']): string {
  if (!dealers) return '—';
  if (Array.isArray(dealers)) return dealers[0]?.company_name || '—';
  return dealers.company_name || '—';
}

export default function DealerUsersListClient({
  initialUsers,
  searchQuery,
  currentPage,
  totalPages,
  totalCount,
}: DealerUsersListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('search', search);
    else params.delete('search');
    params.delete('page');
    router.push(`/admin/dealer-users?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/dealer-users?${params.toString()}`);
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
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div style={{ flex: '1', maxWidth: '400px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Search by company
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Company name..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
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
          {totalCount} user{totalCount !== 1 ? 's' : ''} total
        </div>
        {initialUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>User ID</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Dealer</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>Can Order</th>
                </tr>
              </thead>
              <tbody>
                {initialUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace' }}>
                      {user.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      {getDealerCompany(user.dealers)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: user.status === 'ACTIVE' ? '#10b98120' : '#f59e0b20',
                        color: user.status === 'ACTIVE' ? '#059669' : '#d97706'
                      }}>
                        {user.status || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      {user.is_primary ? (
                        <span style={{ fontWeight: '600' }}>Primary</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Team</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      {user.can_order ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No dealer users found
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
