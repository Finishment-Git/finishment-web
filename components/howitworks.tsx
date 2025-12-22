import { Layers, Hammer, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  // New Card Style with visible borders and rounded corners
  const cardStyle = {
    flex: '1',
    minWidth: '300px',
    padding: '40px 30px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    backgroundColor: '#0f0f12', // Slightly lighter than background to create depth
    borderRadius: '24px',
    border: '1px solid #1f1f23', // Subtle border
    transition: 'all 0.3s ease',
  };

  const iconContainerStyle = {
    padding: '24px',
    backgroundColor: 'rgba(234, 88, 12, 0.1)', // Subtle orange glow behind icon
    borderRadius: '20px',
    border: '1px solid rgba(234, 88, 12, 0.2)',
    color: '#ea580c', // Bright Orange
    marginBottom: '24px',
    boxShadow: '0 0 20px rgba(234, 88, 12, 0.1)', // Soft glow
  };

  return (
    <section id="how" style={{ backgroundColor: '#09090b', color: 'white', padding: '120px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '-1px' }}>
            From Your Floor to Your Stairs <br />
            in <span style={{ color: '#ea580c' }}>3 Simple Steps</span>
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '20px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            We bridge the gap between your flooring material and a perfect finish.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          flexWrap: 'wrap' 
        }}>
          
          {/* Step 1 */}
          <div style={cardStyle} className="hover-card">
            <div style={iconContainerStyle}>
              <Layers size={48} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px' }}>
              1. Provide the Planks
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '17px', lineHeight: '1.7' }}>
              Bring us your vinyl, LVP, or SPC planks. This ensures a 
              <span style={{ color: 'white', fontWeight: '600' }}> 100% perfect color and texture match</span>.
            </p>
            <div style={{ marginTop: '20px', fontSize: '11px', color: '#52525b', letterSpacing: '2px', fontWeight: '800' }}>
              * MATERIAL SOURCING AVAILABLE
            </div>
          </div>

          {/* Step 2 */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              <Hammer size={48} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px' }}>
              2. We Fabricate
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '17px', lineHeight: '1.7' }}>
              Our Austin-based team crafts your nosing with precision. 
              We use professional-grade tools for a 
              <span style={{ color: 'white', fontWeight: '600' }}> durable, minimalist profile</span>.
            </p>
          </div>n

          {/* Step 3 */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              <CheckCircle size={48} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px' }}>
              3. Pick Up & Install
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '17px', lineHeight: '1.7' }}>
              Your custom pieces are ready in 
              <span style={{ color: 'white', fontWeight: '600' }}> 24 to 72 hours</span>. 
              Pick them up and install them for a seamless finish.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}