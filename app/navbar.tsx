"use client";

export default function Navbar() {
  return (
    <nav style={{ 
      backgroundColor: '#1f2937', // Professional dark grey (Slate-800)
      color: 'white', 
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid #374151'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Placeholder for your logo */}
        <span style={{ fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '-0.025em' }}>
          Finement
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <a href="#how" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>How it Works</a>
        <a href="#why" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>Why Us</a>
        <a href="#contact" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
        <button style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '0.875rem', border: 'none' }}>
          Get Started
        </button>
      </div>
    </nav>
  );
}