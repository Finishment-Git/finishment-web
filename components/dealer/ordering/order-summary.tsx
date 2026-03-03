import type { OrderFormData } from './types'
import { calculateOrderTotalCents } from '@/lib/pricing'
import { formatAmount } from '@/lib/orders'
import { PRICE_PER_UNIT_CENTS } from '@/lib/pricing'

interface OrderSummaryProps {
  formData: OrderFormData
}

export function OrderSummary({ formData }: OrderSummaryProps) {
  const totalSteps = (formData.stepsNoOpenReturn || 0) + (formData.stepsOneOpenReturn || 0) + (formData.stepsTwoOpenReturn || 0)
  const totalCents = calculateOrderTotalCents(totalSteps)
  const pricePerUnit = PRICE_PER_UNIT_CENTS / 100

  if (totalSteps === 0) return null

  return (
    <div style={{
      background: '#ffffff', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#000000' }}>
        Order Summary
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px', color: '#374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{totalSteps} unit{totalSteps !== 1 ? 's' : ''} × ${pricePerUnit}</span>
          <span>{formatAmount(totalCents)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '18px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
          <span>Order Total</span>
          <span>{formatAmount(totalCents)}</span>
        </div>
      </div>
    </div>
  )
}
