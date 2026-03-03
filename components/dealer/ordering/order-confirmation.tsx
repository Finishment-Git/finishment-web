import type { PaymentMethod } from './types'

interface OrderConfirmationProps {
  orderNumber: string
  paymentMethod: PaymentMethod
  onPlaceAnother: () => void
}

export function OrderConfirmation({ orderNumber, paymentMethod, onPlaceAnother }: OrderConfirmationProps) {
  const paymentMessage = paymentMethod === 'card'
    ? "We'll contact you to process your credit card payment."
    : paymentMethod === 'check'
    ? 'Please send your check with the order number included.'
    : 'Please complete ACH transfer with the order number as reference.'

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#ffffff' }}>
      <div style={{
        background: '#ecfdf5', border: '2px solid #059669', padding: '24px', borderRadius: '8px', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#059669' }}>
          Order Submitted Successfully!
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '8px', color: '#000' }}>
          Order Number: <strong>{orderNumber}</strong>
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
          {paymentMessage}
        </p>
        <button onClick={onPlaceAnother}
          style={{
            padding: '12px 24px', background: '#000', color: '#fff', border: 'none',
            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '16px'
          }}>
          Place Another Order
        </button>
      </div>
    </div>
  )
}
