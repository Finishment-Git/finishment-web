import { Palette, Shield, Award } from "lucide-react";

export default function SolutionSection() {
  return (
    <section style={{ 
      padding: '100px 20px', 
      backgroundColor: '#ffffff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Orange Tag */}
        <div style={{
          display: 'inline-block',
          backgroundColor: '#ff8c42',
          borderRadius: '20px',
          padding: '6px 16px',
          marginBottom: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#ffffff'
        }}>
          The Solution
        </div>

        {/* Section Header */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: 'clamp(36px, 6vw, 48px)', 
            fontWeight: '700', 
            fontFamily: 'Georgia, serif',
            color: '#3d2817',
            marginBottom: '16px'
          }}>
            Finishment's <span style={{ color: '#ff8c42' }}>Solution</span>
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b5d4f',
            maxWidth: '600px'
          }}>
            Custom Stair Nosings Made From YOUR Material
          </p>
        </div>

        {/* Three Feature Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '32px'
        }}>
          
          {/* Perfect Color */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5ddd4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#ff8c42',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ffffff'
            }}>
              <Palette size={32} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '12px'
            }}>
              Perfect Color
            </h3>
            <p style={{ 
              color: '#6b5d4f', 
              fontSize: '15px', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Same dye lot for perfect color consistency across the entire project.
            </p>
          </div>

          {/* Superior Strength */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5ddd4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#ff8c42',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ffffff'
            }}>
              <Shield size={32} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '12px'
            }}>
              Superior Strength
            </h3>
            <p style={{ 
              color: '#6b5d4f', 
              fontSize: '15px', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Same durable material for superior strength and longevity.
            </p>
          </div>

          {/* Premium Quality */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5ddd4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#ff8c42',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ffffff'
            }}>
              <Award size={32} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '12px'
            }}>
              Premium Quality
            </h3>
            <p style={{ 
              color: '#6b5d4f', 
              fontSize: '15px', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Crafted with precision for a flawless, professional finish every time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
