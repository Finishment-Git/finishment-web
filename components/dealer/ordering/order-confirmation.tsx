'use client'
import { useState } from 'react'
import type { PaymentMethod } from './types'
import { formatAmount } from '@/lib/orders'

const PRICE_PER_UNIT = 28

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'card', label: 'Credit Card', description: 'Complete payment securely at checkout' },
  { value: 'check', label: 'Check', description: 'Mail check with order number included. Note, mailing checks may delay production time.' },
  { value: 'ach', label: 'ACH Transfer', description: 'Bank transfer details will be provided' },
]

interface OrderConfirmationProps {
  orderId: string
  orderNumber: string
  totalSteps: number
  totalAmountCents: number
  onPlaceAnother: () => void
  onProceedToCheckout: (orderId: string) => void
}

export function OrderConfirmation({
  orderId,
  orderNumber,
  totalSteps,
  totalAmountCents,
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
    <div style={{ maxWidth: '560px', margin: '16px auto', padding: '20px', backgroundColor: '#f5f0e8' }}>
      <div style={{
        background: 'rgba(234, 88, 12, 0.1)', border: '2px solid #ea580c', padding: '16px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#ea580c' }}>
          Order Submitted Successfully!
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '0', color: '#3d2817' }}>
          Order Number: <strong>{orderNumber}</strong>
        </p>
      </div>

      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#3d2817' }}>
          Order Summary
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{totalSteps} unit{totalSteps !== 1 ? 's' : ''} × ${PRICE_PER_UNIT}</span>
            <span>{formatAmount(totalAmountCents)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '18px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', color: '#3d2817' }}>
            <span>Order Total</span>
            <span>{formatAmount(totalAmountCents)}</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#3d2817' }}>
          Select Payment Method
        </h2>
        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '12px' }}>
          Choose how you would like to pay for this order, then proceed to checkout.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PAYMENT_OPTIONS.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', padding: '14px',
              border: selectedMethod === opt.value ? '2px solid #ea580c' : '1px solid #d1d5db',
              borderRadius: '6px', cursor: 'pointer',
              background: selectedMethod === opt.value ? 'rgba(234, 88, 12, 0.08)' : '#fff'
            }}>
              <input type="radio" name="payment" value={opt.value} checked={selectedMethod === opt.value}
                onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)} style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3d2817', fontSize: '16px' }}>{opt.label}</div>
                <div style={{ fontSize: '13px', color: '#4b5563', whiteSpace: 'pre-line' }}>{opt.description}</div>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleProceedToCheckout}
            disabled={updating}
            style={{
              padding: '12px 24px', background: updating ? '#9ca3af' : '#ea580c', color: '#fff', border: 'none',
              borderRadius: '8px', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px',
              boxShadow: updating ? 'none' : '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}
          >
            {updating ? 'Updating...' : 'Proceed to Checkout'}
          </button>
          <button
            onClick={onPlaceAnother}
            style={{
              padding: '12px 24px', background: 'transparent', color: '#ea580c', border: '2px solid #ea580c',
              borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px'
            }}
          >
            Place Another Order
          </button>
        </div>
      </div>
    </div>
  )
}
