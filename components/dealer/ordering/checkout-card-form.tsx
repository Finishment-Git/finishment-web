'use client'
import { useCallback, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    CollectJS?: {
      configure: (opts: {
        callback?: (response: { token?: string }) => void
        tokenizationKey?: string
        variant?: string
        [key: string]: unknown
      }) => void
      startPaymentRequest: (e?: Event) => void
    }
  }
}

interface CheckoutCardFormProps {
  orderId: string
  orderNumber: string
  amountCents: number
  firstName: string
  lastName: string
  onSuccess: () => void
  onError: (message: string) => void
  onClearError?: () => void
}

export function CheckoutCardForm({
  orderId,
  orderNumber,
  amountCents,
  onSuccess,
  onError,
  onClearError,
}: CheckoutCardFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)
  const tokenizationKey = process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  const initCollectJS = useCallback(() => {
    if (!tokenizationKey || !window.CollectJS) return
    window.CollectJS.configure({
      tokenizationKey,
      variant: 'inline',
      callback: async (response: { token?: string }) => {
        const token = response.token
        if (!token) {
          onErrorRef.current('Failed to tokenize payment. Please check your card details.')
          setSubmitting(false)
          return
        }
        try {
          const res = await fetch(`/api/orders/${orderId}/process-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_token: token }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Payment failed')
          onSuccessRef.current()
        } catch (err) {
          onErrorRef.current(err instanceof Error ? err.message : 'Payment failed. Please try again.')
        } finally {
          setSubmitting(false)
        }
      },
    })
    setReady(true)
  }, [tokenizationKey, orderId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready || submitting || !window.CollectJS) return
    onClearError?.()
    setSubmitting(true)
    window.CollectJS.startPaymentRequest(e.nativeEvent)
  }

  if (!tokenizationKey) {
    return (
      <div style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c' }}>
        Payment form is not configured. Please contact support.
      </div>
    )
  }

  const amountDisplay = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountCents / 100)

  return (
    <>
      <Script
        src="https://secure.nmi.com/token/Collect.js"
        data-tokenization-key={tokenizationKey}
        data-variant="inline"
        data-country="US"
        data-currency="USD"
        strategy="lazyOnload"
        onLoad={initCollectJS}
      />
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000' }}>
          Pay {amountDisplay} for Order {orderNumber}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Card Number</label>
            <div id="ccnumber" style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '40px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Expiration</label>
              <div id="ccexp" style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '40px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>CVV</label>
              <div id="cvv" style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '40px' }} />
            </div>
          </div>
          <button
            type="submit"
            disabled={!ready || submitting}
            style={{
              padding: '12px 24px', background: ready && !submitting ? '#059669' : '#9ca3af', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: ready && !submitting ? 'pointer' : 'not-allowed', fontWeight: '600'
            }}
          >
            {submitting ? 'Processing...' : `Pay ${amountDisplay}`}
          </button>
        </form>
      </div>
    </>
  )
}
