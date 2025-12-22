"use client";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export default function ContactUs() {
  const infoBlockStyle = {
    display: 'flex',
    alignItems: 'start',
    gap: '16px',
    marginBottom: '32px'
  };

  const iconBoxStyle = {
    padding: '12px',
    backgroundColor: '#18181b',
    borderRadius: '12px',
    color: '#ea580c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginTop: '8px',
    outline: 'none',
    fontSize: '16px',
    color: '#1e293b'
  };

  return (
    <section id="contact" style={{ 
      position: 'relative', 
      padding: '100px 20px', 
      backgroundColor: '#09090b', 
      color: 'white', 
      overflow: 'hidden' 
    }}>
      
      {/* Decorative Blur Element */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        backgroundColor: 'rgba(234, 88, 12, 0.15)',
        borderRadius: '100%',
        filter: 'blur(100px)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '80px',
          alignItems: 'start'
        }}>
          
          {/* Left Side: Contact Info */}
          <div>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.1' }}>
              Let's Start Your <br />
              <span style={{ color: '#ea580c' }}>Custom Project</span>
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '48px', maxWidth: '400px', lineHeight: '1.6' }}>
              Ready to get the perfect finish for your stairs? Visit us in Leander or send us a message to get a quote.
            </p>

            <div style={infoBlockStyle}>
              <div style={iconBoxStyle}><Phone size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Phone</h3>
                <p style={{ color: '#a1a1aa' }}>(512) 800-4665</p>
              </div>
            </div>

            <div style={infoBlockStyle}>
              <div style={iconBoxStyle}><MapPin size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Location</h3>
                <p style={{ color: '#a1a1aa' }}>1501 Leander Dr<br />Leander, TX 78641</p>
              </div>
            </div>

            <div style={infoBlockStyle}>
              <div style={iconBoxStyle}><Mail size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Email</h3>
                <p style={{ color: '#a1a1aa' }}>finishment@proton.me</p>
              </div>
            </div>
          </div>

          {/* Right Side: The Form */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '24px', 
            color: '#1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Send us a message</h3>
            
            <form action="https://formsubmit.co/finishment@proton.me" method="POST">
              <input type="hidden" name="_captcha" value="false" />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>First Name *</label>
                  <input type="text" name="firstName" required placeholder="Jane" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Last Name *</label>
                  <input type="text" name="lastName" required placeholder="Doe" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600' }}>Email Address</label>
                <input type="email" name="email" placeholder="jane@example.com" style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600' }}>Message</label>
                <textarea name="message" rows={4} placeholder="Tell us about your project..." style={{...inputStyle, resize: 'none'}}></textarea>
              </div>

              <button type="submit" style={{
                width: '100%',
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                Send Message <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}