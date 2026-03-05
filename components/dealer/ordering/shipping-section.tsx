import type { ShippingAddress } from './types'

interface ShippingSectionProps {
  needsShipping: boolean
  setNeedsShipping: (v: boolean) => void
  shippingAddress: ShippingAddress
  setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddress>>
}

const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
}

export function ShippingSection({ needsShipping, setNeedsShipping, shippingAddress, setShippingAddress }: ShippingSectionProps) {
  const update = (field: keyof ShippingAddress, value: string) =>
    setShippingAddress(prev => ({ ...prev, [field]: value }))

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={needsShipping} onChange={(e) => setNeedsShipping(e.target.checked)}
            style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }} />
          <span style={{ fontSize: '16px', fontWeight: '500', color: '#000000' }}>
            NOT able to pick up completed order in Leander, TX
          </span>
        </label>
      </div>

      {needsShipping && (
        <>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
            Shipping Address
          </h2>
          <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
            <ShipField label="Full Name" required value={shippingAddress.name} onChange={(v) => update('name', v)} />
            <ShipField label="Company Name" value={shippingAddress.company} onChange={(v) => update('company', v)} />
            <ShipField label="Address Line 1" required value={shippingAddress.address1} onChange={(v) => update('address1', v)} />
            <ShipField label="Address Line 2" value={shippingAddress.address2} onChange={(v) => update('address2', v)} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <ShipField label="City" required value={shippingAddress.city} onChange={(v) => update('city', v)} />
              <ShipField label="State" required value={shippingAddress.state} onChange={(v) => update('state', v)} maxLength={2} placeholder="TX" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <ShipField label="ZIP Code" required value={shippingAddress.zip} onChange={(v) => update('zip', v)} />
              <ShipField label="Phone" required value={shippingAddress.phone} onChange={(v) => update('phone', v)} type="tel" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ShipField({ label, required, value, onChange, type, maxLength, placeholder }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; type?: string; maxLength?: number; placeholder?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} maxLength={maxLength} placeholder={placeholder} style={fieldInputStyle} />
    </div>
  )
}
