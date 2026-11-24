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
  const totalSteps = (formData.stepsNoOpenReturn || 0) + (formData.stepsOneOpenReturn || 0) + (formData.stepsTwoOpenReturn || 0)

  return (
    <div style={sectionStyle} className="order-form-section">
      <h2 style={sectionHeadingStyle}>
        Please provide any additional details we might need to know
      </h2>

      <div className="order-form-grid-3col-tight">
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
          Total number of stair noses (pulled from above)
        </label>
        <input
          type="number"
          value={totalSteps > 0 ? totalSteps : ''}
          readOnly
          style={{
            ...fieldInputStyle,
            maxWidth: '120px',
            backgroundColor: '#f3f4f6',
            cursor: 'not-allowed',
            color: '#6b7280',
            fontWeight: '600',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
          Number of additional pieces needed to complete end returns
        </label>
        <select
          value={formData.piecesForEndReturns}
          onChange={(e) => onChange({ piecesForEndReturns: parseInt(e.target.value, 10) })}
          style={{
            ...fieldInputStyle,
            maxWidth: '120px',
            cursor: 'pointer',
          }}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
          Total # of pieces (Total # of stairs + end returns)
        </label>
        <input
          type="number"
          value={totalSteps + (formData.piecesForEndReturns || 0)}
          readOnly
          style={{
            ...fieldInputStyle,
            maxWidth: '120px',
            backgroundColor: '#f3f4f6',
            cursor: 'not-allowed',
            color: '#6b7280',
            fontWeight: '600',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
          Please provide any additional details we might need to know
        </label>
        <textarea value={formData.floorMatchDescription} onChange={(e) => onChange({ floorMatchDescription: e.target.value })}
          placeholder="Please provide any additional details we might need to know..." rows={4}
          style={{ ...fieldInputStyle, resize: 'vertical' as const }} />
      </div>

    </div>
  )
}
