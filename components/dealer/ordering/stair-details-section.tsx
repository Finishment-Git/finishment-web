import { useRef } from 'react'
import Image from 'next/image'
import { OrderFormData, StepsFieldKey, sectionStyle, sectionHeadingStyle, handleInputFocus, handleInputBlur } from './types'

interface StairDetailsSectionProps {
  formData: OrderFormData
  onChange: (updates: Partial<OrderFormData>) => void
}

const quantityInputStyle: React.CSSProperties = {
  width: '80px',
  padding: '8px 10px',
  border: '1px solid #e5ddd4',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#faf8f3',
  color: '#3d2817',
  transition: 'all 0.2s',
  outline: 'none',
  textAlign: 'center',
  MozAppearance: 'textfield' as never,
}

export function StairDetailsSection({ formData, onChange }: StairDetailsSectionProps) {
  const stepsTouchedFields = useRef({ stepsNoOpenReturn: false, stepsOneOpenReturn: false, stepsTwoOpenReturn: false })
  const stepsTriggeredAutoFillRef = useRef({ stepsNoOpenReturn: false, stepsOneOpenReturn: false, stepsTwoOpenReturn: false })

  const handleStepsQuantityChange = (field: StepsFieldKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const val = raw === '' ? 0 : Math.min(9999, Math.max(0, parseInt(raw, 10) || 0))
    stepsTouchedFields.current[field] = true

    const updates: Partial<OrderFormData> = { [field]: val }
    if (!stepsTriggeredAutoFillRef.current[field]) {
      stepsTriggeredAutoFillRef.current[field] = true
      const others: StepsFieldKey[] = (['stepsNoOpenReturn', 'stepsOneOpenReturn', 'stepsTwoOpenReturn'] as StepsFieldKey[]).filter(k => k !== field)
      others.forEach(other => {
        if (!stepsTouchedFields.current[other]) updates[other] = 0
      })
    }
    onChange(updates)
  }

  const totalSteps = (formData.stepsNoOpenReturn || 0) + (formData.stepsOneOpenReturn || 0) + (formData.stepsTwoOpenReturn || 0)

  return (
    <>
      {/* Nosing Type Selection */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
          Select type of nosing <span style={{ color: '#dc2626' }}>*</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <NosingSelectorCard
            value="standard_bullnose"
            label="Standard Bullnose with return"
            image="/stnd_return.png"
            selected={formData.stairType === 'standard_bullnose'}
            onSelect={() => onChange({ stairType: 'standard_bullnose' })}
          />
          <NosingSelectorCard
            value="other"
            label="Single end flush-mount bullnose"
            image="/single_flush.png"
            selected={formData.stairType === 'other'}
            onSelect={() => onChange({ stairType: 'other' })}
          />
        </div>
      </div>

      {/* Stair Layout */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Select Stairs Layout</h2>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '40px',
          padding: '24px', background: '#faf8f3', borderRadius: '10px', border: '1px solid #e5ddd4'
        }}>
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/stnd_dimen.png" alt="Bullnose Profile Diagram" width={400} height={300}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
          </div>
          <p style={{ fontSize: '20px', color: '#6b5d4f', lineHeight: '1.6', textAlign: 'center', margin: 0, fontWeight: '500' }}>
            Standard dimensions of a Finishment stairnose
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <StairLayoutOption label="No Open Returns" image="/no_return.png"
            value={formData.stepsNoOpenReturn} onChangeValue={(e) => handleStepsQuantityChange('stepsNoOpenReturn', e)} />
          <StairLayoutOption label="One Open Returns" image="/one_return.png"
            value={formData.stepsOneOpenReturn} onChangeValue={(e) => handleStepsQuantityChange('stepsOneOpenReturn', e)} />
          <StairLayoutOption label="Two Open Returns" image={null}
            value={formData.stepsTwoOpenReturn} onChangeValue={(e) => handleStepsQuantityChange('stepsTwoOpenReturn', e)} />
        </div>

        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '28px', background: '#faf8f3', borderRadius: '12px', border: '1px solid #e5ddd4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '18px', fontWeight: '600', color: '#3d2817', textAlign: 'center' }}>
            Total # of stair noses needed
          </label>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input type="number" value={totalSteps > 0 ? totalSteps : ''} readOnly
              style={{ width: '60%', padding: '14px', border: '2px solid #c9a882', borderRadius: '8px', fontSize: '20px', fontWeight: '600', backgroundColor: '#ffffff', color: '#c9a882', textAlign: 'center', cursor: 'not-allowed' }} />
          </div>
        </div>
      </div>
    </>
  )
}

function NosingSelectorCard({ value, label, image, selected, onSelect }: {
  value: string; label: string; image: string; selected: boolean; onSelect: () => void
}) {
  return (
    <label style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px',
      border: selected ? '2px solid #000' : '1px solid #d1d5db', borderRadius: '8px',
      cursor: 'pointer', background: selected ? '#f9fafb' : '#fff', transition: 'all 0.2s'
    }}>
      <input type="radio" name="stairType" value={value} checked={selected} onChange={onSelect} style={{ marginBottom: '12px' }} />
      <div style={{ fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>{label}</div>
      <Image src={image} alt={label} width={200} height={150} style={{ objectFit: 'contain', borderRadius: '4px' }} />
    </label>
  )
}

function StairLayoutOption({ label, image, value, onChangeValue }: {
  label: string; image: string | null; value: number; onChangeValue: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: '600', marginBottom: '12px', color: '#3d2817', fontSize: '16px' }}>{label}</div>
      <div style={{
        width: '100%', height: '180px', background: '#faf8f3', borderRadius: '10px', marginBottom: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5ddd4',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden', color: '#6b7280', fontSize: '14px'
      }}>
        {image ? (
          <Image src={image} alt={`${label} Stair Diagram`} width={300} height={180} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
        ) : (
          '[Stair Diagram 3]'
        )}
      </div>
      <input type="number" min="0" max="9999" value={value} onChange={onChangeValue} placeholder="Quantity" required
        style={quantityInputStyle}
        onFocus={(e) => { e.target.select(); handleInputFocus(e) }}
        onBlur={handleInputBlur}
      />
    </div>
  )
}
