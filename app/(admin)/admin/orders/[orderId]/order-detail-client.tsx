'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStatusLabel, type OrderStatus } from '@/lib/orders';
import type { AdminUser } from '@/lib/auth';

interface OrderDetailClientProps {
  order: any;
  adminUser: AdminUser;
  canUpdate: boolean;
  canManagePayment: boolean;
  canDelete: boolean;
  nextStatuses: OrderStatus[];
  payment: any;
  paymentReceived: boolean;
}

export default function OrderDetailClient({
  order,
  adminUser,
  canUpdate,
  canManagePayment,
  canDelete,
  nextStatuses,
  payment,
  paymentReceived,
}: OrderDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    transaction_reference: '',
    notes: '',
  });

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setSuccess('Status updated successfully');
      setNote('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentReceived = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/orders/${order.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark payment received');
      }

      setSuccess('Payment marked as received');
      setPaymentData({ transaction_reference: '', notes: '' });
      setShowPaymentForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/orders/${order.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: note }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add note');
      }

      setSuccess('Note added successfully');
      setNote('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete order');
      }

      router.push('/admin/orders');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Status Update */}
      {canUpdate && (
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
            Update Status
          </h2>
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: '#ecfdf5',
              color: '#047857',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}
          <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value={order.status}>Current: {getStatusLabel(order.status)}</option>
                {nextStatuses.map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Notes (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Add notes about this status change..."
              />
            </div>
            <button
              type="submit"
              disabled={loading || newStatus === order.status}
              style={{
                padding: '12px 24px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || newStatus === order.status ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: loading || newStatus === order.status ? 0.5 : 1
              }}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>
      )}

      {/* Payment Management */}
      {canManagePayment && !paymentReceived && (
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
            Payment Management
          </h2>
          {!showPaymentForm ? (
            <button
              onClick={() => setShowPaymentForm(true)}
              style={{
                padding: '12px 24px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Mark Payment Received
            </button>
          ) : (
            <form onSubmit={handlePaymentReceived} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={paymentData.transaction_reference}
                  onChange={(e) => setPaymentData({...paymentData, transaction_reference: e.target.value})}
                  placeholder="Check number, ACH confirmation, etc."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Additional payment notes..."
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Processing...' : 'Mark as Received'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentData({ transaction_reference: '', notes: '' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Add Note */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
          Add Production Note
        </h2>
        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Add a note about this order..."
          />
          <button
            type="submit"
            disabled={loading || !note.trim()}
            style={{
              padding: '12px 24px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !note.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: loading || !note.trim() ? 0.5 : 1
            }}
          >
            {loading ? 'Adding...' : 'Add Note'}
          </button>
        </form>
      </div>

      {/* Delete Order (Admin only) */}
      {canDelete && (
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem', color: '#ef4444' }}>
            Danger Zone
          </h2>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Deleting...' : 'Delete Order'}
          </button>
        </div>
      )}
    </>
  );
}
