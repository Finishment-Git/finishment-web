import Link from "next/link";
import Image from "next/image";
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
        padding: '0 20px',
        overflow: 'hidden'
      }}
    >
      {/* Background Image with Next.js Image optimization */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <Image
          src="/hero-background.png"
          alt=""
          fill
          priority
          quality={90}
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }} />
      </div>

      <div style={{ maxWidth: '1000px', position: 'relative', zIndex: 10 }}>
        
        {/* Main Heading Container */}
        <h1 style={{ 
          marginBottom: '24px',
          textShadow: '0 4px 10px rgba(0,0,0,0.5)',
          lineHeight: '1.2'
        }}>
          {/* Line 1: Largest Font */}
          <span style={{ 
            display: 'block',
            fontSize: 'clamp(42px, 9vw, 82px)', // Massive size
            fontWeight: '900',
            letterSpacing: '-0.03em',
            marginBottom: '10px' // Space between this and next line
          }}>
            Custom Stair Nose
          </span>

          {/* Line 2: Smaller Font */}
          <span style={{ 
            display: 'block',
            fontSize: 'clamp(24px, 5vw, 48px)', // Smaller size
            fontWeight: '700',
            color: '#e5e7eb' // Slightly softer white/grey
          }}>
            Perfect Match
          </span>

          {/* Line 3: Same size as Line 2 */}
          <span style={{ 
            display: 'block',
            fontSize: 'clamp(24px, 5vw, 48px)', // Matches line above
            fontWeight: '700',
            color: '#e5e7eb'
          }}>
            Delivered in 24–72 Hours
          </span>
        </h1>
        
        {/* Subtext */}
        <p style={{ 
          fontSize: 'clamp(18px, 2.5vw, 24px)', 
          lineHeight: '1.5', 
          fontWeight: '400',
          marginBottom: '48px', 
          maxWidth: '800px',
          margin: '0 auto 48px',
          color: '#f3f4f6'
        }}>
          We fabricate stair nose to match your exact flooring using the material you provide — so your stairs look seamless and professional. Order online in minutes.
        </p>

        {/* Button Container */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '20px', 
          flexWrap: 'wrap'
        }}>
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
