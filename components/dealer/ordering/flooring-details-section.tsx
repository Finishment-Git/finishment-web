import { OrderFormData, sectionStyle, sectionHeadingStyle } from './types'

interface FlooringDetailsSectionProps {
  formData: OrderFormData
  onChange: (updates: Partial<OrderFormData>) => void
}

const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
}

export function FlooringDetailsSection({ formData, onChange }: FlooringDetailsSectionProps) {
  return (
    <div style={sectionStyle}>
      <h2 style={sectionHeadingStyle}>
        Please provide any additional details we might need to know
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Manufacturer <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input type="text" value={formData.manufacturer} onChange={(e) => onChange({ manufacturer: e.target.value })}
            placeholder="Manufacturer" required style={fieldInputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Style <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input type="text" value={formData.style} onChange={(e) => onChange({ style: e.target.value })}
            placeholder="Style" required style={fieldInputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Color <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input type="text" value={formData.color} onChange={(e) => onChange({ color: e.target.value })}
            placeholder="Color" required style={fieldInputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
          Enter Size of the longest flooring planks in the box <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input type="text" value={formData.longestPlankSize} onChange={(e) => onChange({ longestPlankSize: e.target.value })}
          placeholder="Enter Size of the longest flooring planks in the box" required style={fieldInputStyle} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
          List Number of Steps and the Size of each step <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input type="text" value={formData.stepsDetails} onChange={(e) => onChange({ stepsDetails: e.target.value })}
          placeholder="Example: (18 Steps at 55 inches)" required style={fieldInputStyle} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
          Please provide any additional details we might need to know
        </label>
        <textarea value={formData.floorMatchDescription} onChange={(e) => onChange({ floorMatchDescription: e.target.value })}
          placeholder="Please provide any additional details we might need to know..." rows={4}
          style={{ ...fieldInputStyle, resize: 'vertical' as const }} />
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontWeight: '500', fontSize: '14px' }}>
          <input type="checkbox" checked={formData.railCapTrimNeeded} onChange={(e) => onChange({ railCapTrimNeeded: e.target.checked })}
            style={{ marginRight: '8px' }} />
          Additional Information: Are additional pieces needed for rail cap trim? <span style={{ color: '#dc2626' }}>*</span>
        </label>
        {formData.railCapTrimNeeded && (
          <textarea value={formData.railCapTrimDetails} onChange={(e) => onChange({ railCapTrimDetails: e.target.value })}
            placeholder="Additional information (Optional)" rows={4}
            style={{ ...fieldInputStyle, resize: 'vertical' as const }} />
        )}
      </div>
    </div>
  )
}
