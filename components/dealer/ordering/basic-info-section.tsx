import { OrderFormData, inputStyle, sectionStyle, sectionHeadingStyle, labelStyle, handleInputFocus, handleInputBlur } from './types'

interface BasicInfoSectionProps {
  formData: OrderFormData
  onChange: (updates: Partial<OrderFormData>) => void
}

export function BasicInfoSection({ formData, onChange }: BasicInfoSectionProps) {
  return (
    <div style={sectionStyle} className="order-form-section">
      <h2 style={sectionHeadingStyle}>Basic Information</h2>

      <div className="order-form-grid-2col">
        <Field label="First Name" required>
          <input type="text" value={formData.firstName} onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="First Name" required style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
        </Field>
        <Field label="Last Name" required>
          <input type="text" value={formData.lastName} onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Last Name" required style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
        </Field>
      </div>

      <div className="order-form-grid-2col">
        <Field label="Company">
          <input type="text" value={formData.company} onChange={(e) => onChange({ company: e.target.value })}
            placeholder="Company" style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
        </Field>
        <Field label="Purchase Order #" required>
          <input type="text" value={formData.purchaseOrderNumber} onChange={(e) => onChange({ purchaseOrderNumber: e.target.value })}
            placeholder="PO #" required style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
        </Field>
      </div>

      <div className="order-form-grid-2col">
        <Field label="Email" required>
          <input type="email" value={formData.email} onChange={(e) => onChange({ email: e.target.value })}
            placeholder="Email Address" required style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
        </Field>
        <Field label="Sidemark" required>
          <input type="text" value={formData.sidemark} onChange={(e) => onChange({ sidemark: e.target.value })}
            placeholder="Sidemark/Project Name" required style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
        </Field>
      </div>

      <Field label="Phone" required>
        <input type="tel" value={formData.phone} onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="Phone Number" required style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
      </Field>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
