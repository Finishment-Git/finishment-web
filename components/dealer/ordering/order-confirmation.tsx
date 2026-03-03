'use client'
import { useState } from 'react'
import type { PaymentMethod } from './types'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'card', label: 'Credit Card', description: 'Complete payment securely at checkout' },
  { value: 'check', label: 'Check', description: 'Mail check with order number included. Note, mailing checks may delay production time.' },
  { value: 'ach', label: 'ACH Transfer', description: 'Bank transfer details will be provided' },
]

interface OrderConfirmationProps {
  orderId: string
  orderNumber: string
  onPlaceAnother: () => void
  onProceedToCheckout: (orderId: string) => void
}

export function OrderConfirmation({
  orderId,
  orderNumber,
  onPlaceAnother,
  onProceedToCheckout,
}: OrderConfirmationProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const handleProceedToCheckout = async () => {
    setUpdating(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderId}/payment-method`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: selectedMethod }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update payment method')
      onProceedToCheckout(orderId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#f5f0e8' }}>
      <div style={{
        background: '#ecfdf5', border: '2px solid #059669', padding: '24px', borderRadius: '8px', textAlign: 'center', marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#059669' }}>
          Order Submitted Successfully!
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '8px', color: '#000' }}>
          Order Number: <strong>{orderNumber}</strong>
        </p>
      </div>

      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
          Select Payment Method
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          Choose how you would like to pay for this order, then proceed to checkout.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PAYMENT_OPTIONS.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', padding: '16px',
              border: selectedMethod === opt.value ? '2px solid #000' : '1px solid #d1d5db',
              borderRadius: '6px', cursor: 'pointer',
              background: selectedMethod === opt.value ? '#f9fafb' : '#fff'
            }}>
              <input type="radio" name="payment" value={opt.value} checked={selectedMethod === opt.value}
                onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)} style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{opt.label}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'pre-line' }}>{opt.description}</div>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={handleProceedToCheckout}
            disabled={updating}
            style={{
              padding: '12px 24px', background: updating ? '#9ca3af' : '#059669', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px'
            }}
          >
            {updating ? 'Updating...' : 'Proceed to Checkout'}
          </button>
          <button
            onClick={onPlaceAnother}
            style={{
              padding: '12px 24px', background: '#000', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '16px'
            }}
          >
            Place Another Order
          </button>
        </div>
      </div>
    </div>
  )
}
