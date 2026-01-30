import { Zap, Truck, DollarSign, Wrench } from "lucide-react";

export default function WhyChoose() {
  return (
    <section style={{ 
      padding: '100px 20px', 
      backgroundColor: '#faf8f3',
      background: 'linear-gradient(to bottom, #ffffff, #faf8f3)'
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
            Why Choose <span style={{ color: '#ff8c42' }}>Finishment?</span>
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b5d4f',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            We make custom stair nosings simple, fast, and affordable
          </p>
        </div>

        {/* Four Benefit Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '32px'
        }}>
          
          {/* Speed */}
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
              backgroundColor: '#3d2817',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ffffff'
            }}>
              <Zap size={32} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '12px'
            }}>
              Speed
            </h3>
            <p style={{ 
              color: '#6b5d4f', 
              fontSize: '15px', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Delivery within 24-72 hours
            </p>
          </div>

          {/* Logistics */}
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
              backgroundColor: '#3d2817',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ffffff'
            }}>
              <Truck size={32} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '12px'
            }}>
              Logistics
            </h3>
            <p style={{ 
              color: '#6b5d4f', 
              fontSize: '15px', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Local drop-off/pick-up & shipping options
            </p>
          </div>

          {/* Pricing */}
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
              backgroundColor: '#3d2817',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ffffff'
            }}>
              <DollarSign size={32} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '12px'
            }}>
              Pricing
            </h3>
            <p style={{ 
              color: '#6b5d4f', 
              fontSize: '15px', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Comparable or better than standard options
            </p>
          </div>

          {/* Prep Work */}
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
              backgroundColor: '#3d2817',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ffffff'
            }}>
              <Wrench size={32} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '12px'
            }}>
              Prep Work
            </h3>
            <p style={{ 
              color: '#6b5d4f', 
              fontSize: '15px', 
              lineHeight: '1.6',
              margin: 0
            }}>
              We handle all the precision cutting and finishing
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
