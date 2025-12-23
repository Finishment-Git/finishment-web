import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        // Background with a dark overlay for high text contrast
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/hero-background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '0 20px',
        overflow: 'hidden'
      }}
    >
      <div style={{ maxWidth: '1000px', position: 'relative', zIndex: 10 }}>
        {/* Main Heading - Extra Large & Bold */}
        <h1 style={{ 
          fontSize: 'clamp(42px, 8vw, 78px)', // Scales from mobile to desktop
          fontWeight: '900', 
          lineHeight: '1.1',
          marginBottom: '24px',
          letterSpacing: '-0.03em',
          textShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
          Custom Stair Nosing Made <br style={{ display: 'none' }} className="md:block" /> From Your Flooring
        </h1>
        
        {/* Subtext - Larger & High Readability */}
        <p style={{ 
          fontSize: 'clamp(18px, 2.5vw, 24px)', 
          lineHeight: '1.5', 
          fontWeight: '400',
          marginBottom: '48px', 
          maxWidth: '800px',
          margin: '0 auto 48px',
          color: '#f3f4f6'
        }}>
          Don't settle for mismatched transitions. We fabricate seamless, minimalist stair noses using your exact Vinyl, LVP, or SPC planks, in 24-72 hours.
        </p>

        {/* Button Container - Side-by-Side Horizontal Layout */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', // Horizontal alignment
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '20px', // Space between buttons
          flexWrap: 'wrap' // Stack on small mobile screens if needed
        }}>
          {/* Primary Action: Solid Blue Button */}
          <Link href="#contact" style={{ 
            backgroundColor: '#2563eb', 
            color: 'white',
            padding: '16px 40px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: '700',
            width: 'fit-content',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
            transition: 'transform 0.2s ease'
          }}>
            Start Your Order
          </Link>
          
          {/* Secondary Action: Transparent White Border Button */}
          <Link href="#contact" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid white',
            color: 'white',
            padding: '14px 40px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: 'fit-content',
            backdropFilter: 'blur(4px)',
            transition: 'background 0.2s ease'
          }}>
            Order samples <ArrowRight size={22} />
          </Link>
        </div>
      </div>
    </section>
  );
}