'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CheckoutCardForm } from '@/components/dealer/ordering/checkout-card-form'
import { formatAmount } from '@/lib/orders'

interface Order {
  id: string
  order_number: string
  payment_method: string
  total_amount_cents: number
  first_name: string
  last_name: string
  contact_info?: { email?: string; phone?: string; name?: string }
  shipping_address?: {
    name?: string
    address1?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
}

interface OrderPayment {
  id: string
  amount_cents: number
  payment_received: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<(Order & { order_payments?: OrderPayment[] }) | null>(null)
  const [error, setError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (!orderId) {
      router.push('/dealer/ordering')
      return
    }
    const fetchOrder = async () => {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load order')
        setLoading(false)
        return
      }
      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [orderId, router])

  const payment = order?.order_payments?.[0]
  const amountCents = payment?.amount_cents ?? order?.total_amount_cents ?? 0

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f0e8', color: '#3d2817', minHeight: '100vh' }}>
        <p>Loading checkout...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#f5f0e8' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '24px', borderRadius: '8px', color: '#b91c1c' }}>
          <p>{error || 'Order not found'}</p>
          <button
            onClick={() => router.push('/dealer/ordering')}
            style={{ marginTop: '16px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Back to Ordering
          </button>
        </div>
      </div>
    )
  }

  if (payment?.payment_received) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#f5f0e8' }}>
        <div style={{ background: '#ecfdf5', border: '2px solid #059669', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#059669' }}>Payment Received</h2>
          <p style={{ marginBottom: '24px', color: '#000' }}>
            Thank you! Your payment for order <strong>{order.order_number}</strong> has been processed.
          </p>
          <button
            onClick={() => router.push('/dealer/dashboard')}
            style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#f5f0e8' }}>
        <div style={{ background: '#ecfdf5', border: '2px solid #059669', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#059669' }}>Payment Successful</h2>
          <p style={{ marginBottom: '24px', color: '#000' }}>
            Your payment for order <strong>{order.order_number}</strong> has been processed successfully.
          </p>
          <button
            onClick={() => router.push('/dealer/dashboard')}
            style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#f5f0e8', color: '#3d2817', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#3d2817', fontFamily: 'Georgia, serif' }}>
        Checkout
      </h1>
      <p style={{ marginBottom: '24px', color: '#6b7280' }}>
        Order <strong>{order.order_number}</strong>
      </p>

      {order.payment_method === 'card' ? (
        amountCents > 0 ? (
          <>
            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px' }}>
                {error}
              </div>
            )}
            <CheckoutCardForm
              orderId={order.id}
              orderNumber={order.order_number}
              amountCents={amountCents}
              firstName={order.first_name}
              lastName={order.last_name}
              onSuccess={() => setPaymentSuccess(true)}
              onError={(msg) => setError(msg)}
              onClearError={() => setError('')}
            />
          </>
        ) : (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Your order total is being calculated. We&apos;ll contact you with a payment link once it&apos;s ready.
            </p>
            <button
              onClick={() => router.push('/dealer/dashboard')}
              style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            >
              Back to Dashboard
            </button>
          </div>
        )
      ) : order.payment_method === 'check' ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Check Payment Instructions</h3>
          <p style={{ marginBottom: '12px', color: '#374151' }}>
            Please mail your check with order number <strong>{order.order_number}</strong> included.
          </p>
          {amountCents > 0 && (
            <p style={{ marginBottom: '12px', color: '#374151' }}>
              Amount due: <strong>{formatAmount(amountCents)}</strong>
            </p>
          )}
          <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
            Our team will provide the mailing address. You may also contact us for assistance.
          </p>
          <button
            onClick={() => router.push('/dealer/dashboard')}
            style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>ACH Transfer Instructions</h3>
          <p style={{ marginBottom: '12px', color: '#374151' }}>
            Please complete your ACH transfer and use order number <strong>{order.order_number}</strong> as the reference.
          </p>
          {amountCents > 0 && (
            <p style={{ marginBottom: '12px', color: '#374151' }}>
              Amount due: <strong>{formatAmount(amountCents)}</strong>
            </p>
          )}
          <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
            Bank transfer details will be provided by our team. Contact us if you need assistance.
          </p>
          <button
            onClick={() => router.push('/dealer/dashboard')}
            style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
