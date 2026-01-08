"use client";
import { Instagram, Facebook } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ 
      backgroundColor: '#f3f4f6', 
      height: '140px',           
      padding: '0 40px',         
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid #e5e7eb'
    }}>
      {/* LOGO SECTION */}
      <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo2.png" 
            alt="Logo" 
            style={{ 
              height: '100%',    
              width: 'auto', 
              display: 'block',
              objectFit: 'contain'
            }} 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        </a>
      </div>
      
      {/* NAVIGATION & SOCIALS */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        <a href="/#how" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '500' }}>How it Works</a>
        <a href="/#why" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '500' }}>Why Us</a>
        <a href="/#faq" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '500' }}>FAQ</a>
        
        {/* SOCIAL GRAPHICS */}
        <div style={{ display: 'flex', gap: '20px', marginLeft: '10px', borderLeft: '2px solid #d1d5db', paddingLeft: '20px' }}>
          <a href="https://www.instagram.com/wearefinishment/" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563' }}>
            <Instagram size={28} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563' }}>
            <Facebook size={28} />
          </a>
        </div>

        <Link href="/dealer-register" style={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '8px', 
          border: 'none', 
          fontWeight: '600', 
          fontSize: '1rem',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Dealer Registration
        </Link>
        <Link href="/dealer-login" style={{ 
          backgroundColor: 'transparent', 
          color: '#2563eb', 
          padding: '12px 24px', 
          borderRadius: '8px', 
          border: '2px solid #2563eb', 
          fontWeight: '600', 
          fontSize: '1rem',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Dealer Login
        </Link>
      </div>
    </nav>
  );
}