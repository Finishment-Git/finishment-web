import { X, AlertTriangle, Clock, DollarSign, Frown } from "lucide-react";

export default function ProblemSection() {
  return (
    <section style={{ 
      padding: '100px 20px', 
      backgroundColor: '#faf8f3',
      background: 'linear-gradient(to bottom, #f5f0e8, #faf8f3)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: 'clamp(36px, 6vw, 48px)', 
            fontWeight: '700', 
            fontFamily: 'Georgia, serif',
            color: '#3d2817',
            marginBottom: '16px'
          }}>
            Understanding the <span style={{ color: '#ff8c42' }}>Problem</span>
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b5d4f',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Standard stair nosings create more problems than they solve.
          </p>
        </div>

        {/* Two Cards Side by Side */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          
          {/* Left Card - Standard Stair Nosings */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5ddd4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                <X size={18} />
              </div>
              <h3 style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                color: '#3d2817',
                margin: 0
              }}>
                Standard Stair Nosings
              </h3>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <AlertTriangle size={14} />
                </div>
                <span style={{ color: '#4a4a4a', fontSize: '16px', lineHeight: '1.6' }}>
                  Hard to source
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <X size={14} />
                </div>
                <span style={{ color: '#4a4a4a', fontSize: '16px', lineHeight: '1.6' }}>
                  Often brittle and overpriced
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Frown size={14} />
                </div>
                <span style={{ color: '#4a4a4a', fontSize: '16px', lineHeight: '1.6' }}>
                  Rarely match flooring material
                </span>
              </li>
            </ul>
          </div>

          {/* Right Card - These Issues Lead To */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5ddd4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
              }}>
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                color: '#3d2817',
                margin: 0
              }}>
                These Issues Lead To
              </h3>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Clock size={14} />
                </div>
                <span style={{ color: '#4a4a4a', fontSize: '16px', lineHeight: '1.6' }}>
                  Delays in project completion
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <DollarSign size={14} />
                </div>
                <span style={{ color: '#4a4a4a', fontSize: '16px', lineHeight: '1.6' }}>
                  Increased costs
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Frown size={14} />
                </div>
                <span style={{ color: '#4a4a4a', fontSize: '16px', lineHeight: '1.6' }}>
                  Poor aesthetics and dissatisfied customers
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
