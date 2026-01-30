import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  // Require admin role
  await requireAuth(['admin']);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: '#6b7280' }}>
          System configuration and settings
        </p>
      </div>

      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
          Payment Instructions
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '0.5rem' }}>
              Check Payment
            </h3>
            <div style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Mailing Address:</strong>
              </p>
              <p style={{ color: '#6b7280' }}>
                [Configure in database or environment variables]
              </p>
              <p style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                <strong>Instructions:</strong>
              </p>
              <p style={{ color: '#6b7280' }}>
                Please include the order number on the check memo line.
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '0.5rem' }}>
              ACH Payment
            </h3>
            <div style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Bank Details:</strong>
              </p>
              <p style={{ color: '#6b7280' }}>
                [Configure in database or environment variables]
              </p>
              <p style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                <strong>Instructions:</strong>
              </p>
              <p style={{ color: '#6b7280' }}>
                Please include the order number in the payment reference.
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '0.5rem' }}>
              Credit Card Payment
            </h3>
            <div style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <p style={{ color: '#6b7280' }}>
                Credit card payments are processed manually. We will contact you at the email address provided to process payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginTop: '1.5rem'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
          Email Templates
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Email template configuration will be available in a future update.
        </p>
      </div>

      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginTop: '1.5rem'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
          System Information
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#6b7280' }}>Version:</span>
            <span style={{ marginLeft: '8px' }}>1.0.0</span>
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>Database:</span>
            <span style={{ marginLeft: '8px' }}>Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
