'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function DealerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/dealer-login');
        return;
      }

      setUser(user);

      // Get profile with dealer info
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          dealers (*)
        `)
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setDealer(profileData.dealers);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}>
        <p style={{ fontSize: '18px', color: '#000000' }}>Loading...</p>
      </div>
    );
  }

  const canOrder = profile?.is_primary || profile?.can_order;
  const isPrimary = profile?.is_primary;

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '20px', 
      fontFamily: 'sans-serif',
      backgroundColor: '#ffffff',
      color: '#000000',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '30px',
        color: '#000000'
      }}>
        Dealer Dashboard
      </h1>

      {/* Status Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '12px', 
          border: '2px solid #000000',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            color: '#000000', 
            marginBottom: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Account Status
          </h3>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: profile?.status === 'ACTIVE' ? '#059669' : '#f59e0b',
            margin: 0
          }}>
            {profile?.status === 'ACTIVE' ? 'Active' : 'Pending'}
          </p>
        </div>

        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '12px', 
          border: '2px solid #000000',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            color: '#000000', 
            marginBottom: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Role
          </h3>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#000000',
            margin: 0
          }}>
            {isPrimary ? 'Primary Account Holder' : 'Team Member'}
          </p>
        </div>

        <div style={{ 
          background: '#ffffff', 
          padding: '24px', 
          borderRadius: '12px', 
          border: '2px solid #000000',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            color: '#000000', 
            marginBottom: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Ordering Permission
          </h3>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: canOrder ? '#059669' : '#dc2626',
            margin: 0
          }}>
            {canOrder ? 'Authorized' : 'Not Authorized'}
          </p>
        </div>
      </div>

      {/* Dealer Information */}
      {dealer && (
        <div style={{ 
          background: '#ffffff', 
          padding: '32px', 
          borderRadius: '12px', 
          border: '2px solid #000000', 
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            color: '#000000'
          }}>
            Dealer Information
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <span style={{ 
                color: '#000000', 
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Company Name:
              </span>
              <p style={{ 
                fontWeight: '600', 
                marginTop: '8px',
                fontSize: '18px',
                color: '#000000'
              }}>
                {dealer.company_name}
              </p>
            </div>
            <div>
              <span style={{ 
                color: '#000000', 
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Tax ID:
              </span>
              <p style={{ 
                fontWeight: '600', 
                marginTop: '8px',
                fontSize: '18px',
                color: '#000000'
              }}>
                {dealer.tax_id}
              </p>
            </div>
            <div>
              <span style={{ 
                color: '#000000', 
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Business Type:
              </span>
              <p style={{ 
                fontWeight: '600', 
                marginTop: '8px',
                fontSize: '18px',
                color: '#000000'
              }}>
                {dealer.business_type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {canOrder ? (
          <Link 
            href="/dealer/ordering"
            style={{
              display: 'block',
              padding: '18px 24px',
              background: '#000000',
              color: '#ffffff',
              textAlign: 'center',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              border: '2px solid #000000',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Go to Ordering
          </Link>
        ) : (
          <div style={{
            padding: '24px',
            background: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            color: '#92400e'
          }}>
            <p style={{ 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: '18px',
              color: '#92400e'
            }}>
              Ordering Not Authorized
            </p>
            <p style={{ 
              fontSize: '16px',
              color: '#92400e',
              lineHeight: '1.6'
            }}>
              You need permission from the primary account holder to place orders. 
              {isPrimary ? ' Contact support if you believe this is an error.' : ' Please contact your primary account holder to request ordering permissions.'}
            </p>
          </div>
        )}

        {isPrimary && (
          <Link
            href="/dealer/team"
            style={{
              display: 'block',
              padding: '18px 24px',
              background: '#ffffff',
              color: '#000000',
              textAlign: 'center',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              border: '2px solid #000000',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Manage Team Members
          </Link>
        )}

        {profile?.status === 'PENDING' && (
          <Link
            href="/dealer/education"
            style={{
              display: 'block',
              padding: '18px 24px',
              background: '#059669',
              color: '#ffffff',
              textAlign: 'center',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              border: '2px solid #059669',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Complete Training
          </Link>
        )}
      </div>
    </div>
  );
}

