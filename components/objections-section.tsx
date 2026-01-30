export default function ObjectionsSection() {
  return (
    <section style={{ 
      padding: '100px 20px', 
      backgroundColor: '#faf8f3',
      background: 'linear-gradient(to bottom, #ffffff, #faf8f3)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: 'clamp(36px, 6vw, 48px)', 
            fontWeight: '700', 
            fontFamily: 'Georgia, serif',
            color: '#3d2817',
            marginBottom: '16px'
          }}>
            Overcoming Common <span style={{ color: '#ff8c42' }}>Objections</span>
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b5d4f',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            We've heard the concerns—here's why they shouldn't hold you back
          </p>
        </div>

        {/* Objections Card */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '48px',
          borderRadius: '16px',
          border: '1px solid #e5ddd4',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          
          {/* Objection 1 */}
          <div style={{ 
            display: 'flex', 
            gap: '24px',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #e5ddd4'
          }}>
            <div style={{
              width: '4px',
              backgroundColor: '#ff8c42',
              borderRadius: '2px',
              flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#3d2817',
                marginBottom: '8px',
                fontStyle: 'italic'
              }}>
                "Standard nosings are cheaper."
              </p>
              <p style={{ 
                color: '#6b5d4f', 
                fontSize: '16px', 
                lineHeight: '1.6',
                margin: 0
              }}>
                Finishment pricing is competitive and saves on labor costs.
              </p>
            </div>
          </div>

          {/* Objection 2 */}
          <div style={{ 
            display: 'flex', 
            gap: '24px',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #e5ddd4'
          }}>
            <div style={{
              width: '4px',
              backgroundColor: '#ff8c42',
              borderRadius: '2px',
              flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#3d2817',
                marginBottom: '8px',
                fontStyle: 'italic'
              }}>
                "Custom sounds complicated."
              </p>
              <p style={{ 
                color: '#6b5d4f', 
                fontSize: '16px', 
                lineHeight: '1.6',
                margin: 0
              }}>
                Process is simple—just send material, and we handle the rest.
              </p>
            </div>
          </div>

          {/* Objection 3 */}
          <div style={{ 
            display: 'flex', 
            gap: '24px'
          }}>
            <div style={{
              width: '4px',
              backgroundColor: '#ff8c42',
              borderRadius: '2px',
              flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#3d2817',
                marginBottom: '8px',
                fontStyle: 'italic'
              }}>
                "Will it delay my project?"
              </p>
              <p style={{ 
                color: '#6b5d4f', 
                fontSize: '16px', 
                lineHeight: '1.6',
                margin: 0
              }}>
                Delivery in 24-72 hours keeps projects on schedule.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
