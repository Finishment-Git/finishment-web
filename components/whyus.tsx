import { Zap, Gem, SlidersHorizontal, MapPin } from "lucide-react";

export default function WhyUs() {
  const features = [
    {
      icon: <Zap size={32} />,
      title: "24-72 Hour Turnaround",
      description: "Don't pause your project for weeks. We are the fastest fabricators in Austin, designed to keep your renovation on schedule."
    },
    {
      icon: <Gem size={32} />,
      title: "The Perfect Match",
      description: "Off‑the‑shelf stair noses rarely match the finish, and dye lots are never guaranteed. Using your own planks means a flawless, perfectly matched transition—every time"
    },
    {
      icon: <SlidersHorizontal size={32} />,
      title: "Superior Process",
      description: "Tight control over material removal and bending temperature ensures a durable stair nose with precise, clean angles while maintaining the color and consistency of the bends."
    },
    {
      icon: <MapPin size={32} />,
      title: "Austin Local & Nationwide",
      description: "Located in Central Texas, customers can drop off and pick up locally, request pickup and delivery for an added fee, or ship materials to us from anywhere in the country—we'll send them back finished."
    }
  ];

  return (
    <section id="why" style={{ 
      position: 'relative', 
      padding: '100px 20px', 
      backgroundColor: '#f8fafc', 
      overflow: 'hidden' 
    }}>
      
      {/* Background Image at 50% opacity */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backgroundImage: 'url("/stairexample.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.5 // Increased to 50% as requested
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: 'bold', 
            color: '#0f172a', 
            letterSpacing: '-1px',
            textShadow: '0 2px 4px rgba(255,255,255,0.5)' // Added slight shadow to help text pop
          }}>
            Why Flooring Dealers, Installers, <br /> and Homeowners Choose Finishment
          </h2>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '30px' 
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)', // Solid white with very slight transparency
              padding: '40px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              <div style={{
                marginBottom: '20px',
                backgroundColor: '#fff7ed',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '16px' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}