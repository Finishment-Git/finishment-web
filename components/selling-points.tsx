import { Check, Clock, TrendingUp, Sparkles } from "lucide-react";

export default function SellingPoints() {
  return (
    <section style={{ 
      padding: '100px 20px', 
      backgroundColor: '#ffffff'
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
            Key Selling Points & <span style={{ color: '#ff8c42' }}>Positioning</span>
          </h2>
        </div>

        {/* Two Cards Side by Side */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '32px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          
          {/* Left Card - Key Selling Points */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5ddd4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '24px'
            }}>
              Key Selling Points
            </h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Perfect color match',
                'Durable and long-lasting',
                'Fast turnaround',
                'Competitive pricing',
                'Hassle-free process'
              ].map((point, index) => (
                <li key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: '#ff8c42',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    <Check size={14} />
                  </div>
                  <span style={{ color: '#4a4a4a', fontSize: '16px', lineHeight: '1.6' }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Card - Positioning to Customers */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5ddd4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#3d2817',
              marginBottom: '24px'
            }}>
              Positioning to Customers
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* TIME SAVINGS */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ff8c42',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Clock size={18} />
                  </div>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#3d2817',
                    margin: 0
                  }}>
                    TIME SAVINGS
                  </h4>
                </div>
                <p style={{ 
                  color: '#6b5d4f', 
                  fontSize: '14px', 
                  marginLeft: '44px',
                  margin: '4px 0 0 44px'
                }}>
                  Faster project completion
                </p>
              </div>

              {/* PROFITABILITY */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ff8c42',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <TrendingUp size={18} />
                  </div>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#3d2817',
                    margin: 0
                  }}>
                    PROFITABILITY
                  </h4>
                </div>
                <p style={{ 
                  color: '#6b5d4f', 
                  fontSize: '14px', 
                  marginLeft: '44px',
                  margin: '4px 0 0 44px'
                }}>
                  Reduced labor and material waste
                </p>
              </div>

              {/* QUALITY */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ff8c42',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#3d2817',
                    margin: 0
                  }}>
                    QUALITY
                  </h4>
                </div>
                <p style={{ 
                  color: '#6b5d4f', 
                  fontSize: '14px', 
                  marginLeft: '44px',
                  margin: '4px 0 0 44px'
                }}>
                  Seamless look that impresses clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
