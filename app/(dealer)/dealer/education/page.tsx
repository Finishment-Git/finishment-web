'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, AlertTriangle, ShieldCheck, Ruler, Package, Zap, Truck, DollarSign, Wrench, Clock, Award, TrendingUp, X, MapPin, Sparkles, Settings } from 'lucide-react';

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function DealerEducation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Check if they are actually logged in and get profile
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/dealer-login');
        return;
      }
      
      setUser(user);
      
      // Get user profile to check if they're primary
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, dealer_id, is_primary, status')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
    };
    getUser();
  }, [router]);

  // The "Unlock" Logic
  const handleCompleteTraining = async () => {
    if (!user || !profile) return;
    setLoading(true);
    const supabase = createClient();

    // Update user profile status to ACTIVE
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('id', user.id);

    if (profileError) {
      alert("Error updating status: " + profileError.message);
      setLoading(false);
      return;
    }

    // If user is primary, also update dealer status to ACTIVE
    if (profile.is_primary && profile.dealer_id) {
      const { error: dealerError } = await supabase
        .from('dealers')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.dealer_id);

      if (dealerError) {
        alert("Error updating dealer status: " + dealerError.message);
        setLoading(false);
        return;
      }
    }

    // Success! Send them to the Ordering Page
    alert("🎉 Congratulations! You are now an authorized dealer.");
    router.push("/dealer/ordering");
  };

  if (!user || !profile) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}>
        <p style={{ fontSize: '18px', color: '#000000' }}>Loading...</p>
      </div>
    );
  }

  const isActive = profile?.status === 'ACTIVE';

  return (
    <div style={{ 
      backgroundColor: '#faf8f3',
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '30px 20px',
        backgroundColor: '#f5f0e8',
        background: 'linear-gradient(to bottom, #faf8f3, #f5f0e8)'
      }}>
        {/* Background Image with Transparency */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/Finishment_dealer.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
          zIndex: 0
        }} />
        {/* Overlay to ensure text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(245, 240, 232, 0.3)',
          zIndex: 1
        }} />
        <div style={{ maxWidth: '1000px', width: '100%', position: 'relative', zIndex: 2 }}>
          
          {/* Orange Banner */}
          <div style={{
            display: 'inline-block',
            backgroundColor: '#ff8c42',
            border: '1px solid #e67e22',
            borderRadius: '20px',
            padding: '8px 20px',
            marginBottom: '32px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#3d2817'
          }}>
            Custom Stair Nosings Made From YOUR Material
          </div>

          {/* Main Heading */}
          <h1 style={{ 
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
            <span style={{ 
              display: 'block',
              fontSize: 'clamp(48px, 8vw, 72px)',
              fontWeight: '700',
              fontFamily: 'Georgia, serif',
              color: '#3d2817',
              letterSpacing: '-0.02em',
              marginBottom: '8px'
            }}>
              Perfect Match.
            </span>
            <span style={{ 
              display: 'block',
              fontSize: 'clamp(48px, 8vw, 72px)',
              fontWeight: '700',
              color: '#ff8c42',
              letterSpacing: '-0.02em'
            }}>
              Superior Finish.
            </span>
          </h1>
          
          {/* Body Text */}
          <p style={{ 
            fontSize: 'clamp(16px, 2vw, 18px)', 
            lineHeight: '1.7',
            fontWeight: '400',
            marginBottom: '48px', 
            maxWidth: '700px',
            margin: '0 auto 48px',
            color: '#4a4a4a',
            textAlign: 'center'
          }}>
            Stop settling for generic stair nosings that never quite match. We craft custom nosings from your exact flooring material for a seamless, professional finish.
          </p>

          {/* Training Status */}
          {isActive && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#10b981',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              marginTop: '16px'
            }}>
              <CheckCircle size={20} />
              Training Complete - Account Active
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        {/* Problem Section */}
        <section style={{ 
          marginBottom: '40px',
          backgroundColor: '#faf8f3',
          padding: '30px 20px',
          borderRadius: '0'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ 
                fontSize: 'clamp(36px, 6vw, 48px)', 
                fontWeight: '700', 
                fontFamily: 'Georgia, serif',
                color: '#3d2817',
                marginBottom: '16px'
              }}>
                Understanding the <span style={{ color: '#ff8c42' }}>Problem</span>
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: '#6b5d4f',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Standard stair nosings create more problems than they solve.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '32px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Left Card - Standard Stair Nosings */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '16px',
                border: '1px solid #e5ddd4',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '24px' 
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <X size={24} color="#dc2626" />
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    color: '#3d2817',
                    margin: 0
                  }}>
                    Standard Stair Nosings
                  </h3>
                </div>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {['Hard to source', 'Often brittle and overpriced', 'Dye lots rarely match'].map((item, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#3d2817',
                      fontSize: '16px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <X size={14} color="#dc2626" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Card - These Issues Lead To */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '16px',
                border: '1px solid #e5ddd4',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '24px' 
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <AlertTriangle size={24} color="#6b7280" />
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    color: '#3d2817',
                    margin: 0
                  }}>
                    These Issues Lead To
                  </h3>
                </div>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {['Delays in project completion', 'Increased costs', 'Poor aesthetics and dissatisfied customers'].map((item, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#3d2817',
                      fontSize: '16px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <X size={14} color="#6b7280" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section style={{
          backgroundColor: '#ffffff',
          padding: '30px 20px',
          marginBottom: '60px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Orange Tag */}
            <div style={{
              display: 'inline-block',
              backgroundColor: '#ff8c42',
              borderRadius: '20px',
              padding: '6px 16px',
              marginBottom: '20px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#ffffff'
            }}>
              The Solution
            </div>

            <div style={{ marginBottom: '60px' }}>
              <h2 style={{ 
                fontSize: 'clamp(36px, 6vw, 48px)', 
                fontWeight: '700', 
                fontFamily: 'Georgia, serif',
                color: '#3d2817',
                marginBottom: '16px'
              }}>
                Finishment's <span style={{ color: '#ff8c42' }}>Solution</span>
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: '#6b5d4f',
                maxWidth: '600px'
              }}>
                Custom Stair Nosings Made From YOUR Material
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              {[
                { icon: <Ruler size={32} />, title: 'Perfect Color', desc: 'Same dye lot for perfect color consistency across the entire project.' },
                { icon: <ShieldCheck size={32} />, title: 'Superior Strength', desc: 'Same durable material for superior strength and longevity.' },
                { icon: <Settings size={32} />, title: 'Premium Quality', desc: 'Crafted with precision for a flawless, professional finish every time.' }
              ].map((feature, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5ddd4',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#ff8c42',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    color: '#ffffff'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#3d2817'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b5d4f',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Finishment */}
        <section style={{ 
          marginBottom: '40px',
          backgroundColor: '#faf8f3',
          padding: '60px 20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px'
            }}>
              {[
                { icon: <Zap size={24} />, title: 'Speed', desc: 'Delivery within 24-72 hours' },
                { icon: <MapPin size={24} />, title: 'Logistics', desc: 'Local drop-off/pick-up & shipping options' },
                { icon: <DollarSign size={24} />, title: 'Pricing', desc: 'Comparable or better than standard options' },
                { icon: <Wrench size={24} />, title: 'Prep Work', desc: 'We handle all the precision cutting and finishing' }
              ].map((benefit, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5ddd4',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#3d2817',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    color: '#ffffff'
                  }}>
                    {benefit.icon}
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#3d2817'
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b5d4f',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Points & Positioning */}
        <section style={{
          backgroundColor: '#ffffff',
          padding: '30px 20px',
          marginBottom: '60px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '40px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5ddd4',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '24px',
                  color: '#3d2817'
                }}>
                  Key Selling Points
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {['Perfect color match', 'Durable and long-lasting', 'Fast turnaround', 'Competitive pricing', 'Hassle-free process'].map((item) => (
                    <li key={item} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#3d2817',
                      fontSize: '16px'
                    }}>
                      <CheckCircle size={20} color="#ff8c42" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: '500' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5ddd4',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '24px',
                  color: '#3d2817'
                }}>
                  Positioning to Customers
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {[
                    { icon: <Clock size={20} />, label: 'TIME SAVINGS', text: 'Faster project completion' },
                    { icon: <DollarSign size={20} />, label: 'PROFITABILITY', text: 'Reduced labor and material waste' },
                    { icon: <Sparkles size={20} />, label: 'QUALITY', text: 'Seamless look that impresses clients' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#ff8c42',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#3d2817',
                          marginBottom: '8px'
                        }}>
                          {item.label}
                        </div>
                        <p style={{
                          fontSize: '16px',
                          color: '#6b5d4f',
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Objections Section */}
        <section style={{ 
          marginBottom: '40px',
          backgroundColor: '#faf8f3',
          padding: '60px 20px'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ 
                fontSize: 'clamp(36px, 6vw, 48px)', 
                fontWeight: '700', 
                fontFamily: 'Georgia, serif',
                color: '#3d2817',
                marginBottom: '16px'
              }}>
                Overcoming Common <span style={{ color: '#ff8c42' }}>Objections</span>
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: '#6b5d4f',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                We've heard the concerns—here's why they shouldn't hold you back
              </p>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5ddd4',
              borderRadius: '16px',
              padding: '48px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {[
                  { objection: 'Standard nosings are cheaper.', response: 'Finishment pricing is competitive and saves on labor costs.' },
                  { objection: 'Custom sounds complicated.', response: 'Process is simple—just send material, and we handle the rest.' },
                  { objection: 'Will it delay my project?', response: 'Delivery in 24–72 hours keeps projects on schedule.' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    borderLeft: '4px solid #ff8c42',
                    paddingLeft: '24px'
                  }}>
                    <p style={{
                      fontStyle: 'italic',
                      fontSize: '18px',
                      color: '#6b5d4f',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      "{item.objection}"
                    </p>
                    <p style={{
                      fontSize: '16px',
                      color: '#3d2817',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      Response: {item.response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div style={{
          backgroundColor: '#3d2817',
          borderRadius: '24px',
          padding: '30px 40px',
          textAlign: 'center',
          color: '#ffffff',
          maxWidth: '1000px',
          margin: '0 auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          {isActive ? (
            <>
              <CheckCircle size={48} style={{ marginBottom: '24px', color: '#10b981' }} />
              <h3 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Training Complete
              </h3>
              <p style={{
                fontSize: '18px',
                color: '#e5e5e5',
                marginBottom: '32px',
                maxWidth: '600px',
                margin: '0 auto 32px'
              }}>
                You have already completed the dealer training and your account is active.
              </p>
              <button
                onClick={() => router.push('/dealer/ordering')}
                style={{
                  padding: '16px 48px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Go to Ordering →
              </button>
            </>
          ) : (
            <>
              <h3 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Ready to Start?
              </h3>
              <p style={{
                fontSize: '18px',
                color: '#e5e5e5',
                marginBottom: '32px',
                maxWidth: '600px',
                margin: '0 auto 32px'
              }}>
                By clicking below, you confirm you've reviewed the training material and are ready to offer custom stair nosings to your clients.
              </p>
              <button
                onClick={handleCompleteTraining}
                disabled={loading}
                style={{
                  padding: '16px 48px',
                  background: loading ? '#6b7280' : '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {loading ? 'Activating Account...' : "I've Read the Training - Unlock My Account"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
