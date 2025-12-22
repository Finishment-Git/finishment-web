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
        // Standard background image method
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/hero-background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '0 20px'
      }}
    >
      <div style={{ maxWidth: '900px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          letterSpacing: '-0.5px' 
        }}>
          Custom Stair Nosing Made From Your Flooring
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          lineHeight: '1.6', 
          marginBottom: '30px', 
          maxWidth: '800px',
          margin: '0 auto 30px',
          color: '#f3f4f6'
        }}>
          Don't settle for mismatched transitions. We fabricate seamless, minimalist stair noses using your exact Vinyl, LVP, or SPC planks, in 24-72 hours.
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '15px' 
        }}>
          {/* Blue Button */}
          <Link href="#contact" style={{ 
            backgroundColor: '#2563eb', // Solid Blue
            color: 'white',
            padding: '12px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '600',
            width: 'fit-content'
          }}>
            Start Your Order
          </Link>
          
          {/* See-Through (Transparent) Button */}
          <Link href="#contact" style={{ 
            backgroundColor: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '10px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: 'fit-content'
          }}>
            Order samples <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}