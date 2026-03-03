import type { PaymentMethod } from './types'

interface PaymentSectionProps {
  paymentMethod: PaymentMethod
  setPaymentMethod: (v: PaymentMethod) => void
  notes: string
  setNotes: (v: string) => void
  submitting: boolean
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'card', label: 'Credit Card', description: "We'll contact you to process payment manually" },
  { value: 'check', label: 'Check', description: 'Mail check with order number included\nNote, mailing checks may delay production time.' },
  { value: 'ach', label: 'ACH Transfer', description: 'Bank transfer details will be provided' },
]

export function PaymentSection({ paymentMethod, setPaymentMethod, notes, setNotes, submitting }: PaymentSectionProps) {
  return (
    <>
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
          Payment Method
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
          {PAYMENT_OPTIONS.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', padding: '16px',
              border: paymentMethod === opt.value ? '2px solid #000' : '1px solid #d1d5db',
              borderRadius: '6px', cursor: 'pointer',
              background: paymentMethod === opt.value ? '#f9fafb' : '#fff'
            }}>
              <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{opt.label}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'pre-line' }}>{opt.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
          Additional Notes (Optional)
        </h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
          style={{ width: '100%', maxWidth: '600px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
          placeholder="Any special instructions or notes for this order..." />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
          Thank you for taking the time to complete this form. Once submitted, a member of our staff will confirm a delivery time or ask any follow-up questions.
        </p>
        <button type="submit" disabled={submitting}
          style={{
            padding: '14px 32px', background: submitting ? '#9ca3af' : '#000', color: '#fff',
            border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: '600', fontSize: '18px', minWidth: '200px'
          }}>
          {submitting ? 'Submitting...' : 'Submit Order'}
        </button>
      </div>
    </>
  )
}
