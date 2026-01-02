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
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const canOrder = profile?.is_primary || profile?.can_order;
  const isPrimary = profile?.is_primary;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Dealer Dashboard
      </h1>

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Account Status</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: profile?.status === 'ACTIVE' ? '#059669' : '#f59e0b' }}>
            {profile?.status === 'ACTIVE' ? 'Active' : 'Pending'}
          </p>
        </div>

        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Role</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {isPrimary ? 'Primary Account Holder' : 'Team Member'}
          </p>
        </div>

        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Ordering Permission</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: canOrder ? '#059669' : '#ef4444' }}>
            {canOrder ? 'Authorized' : 'Not Authorized'}
          </p>
        </div>
      </div>

      {/* Dealer Information */}
      {dealer && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Dealer Information</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Company Name:</span>
              <p style={{ fontWeight: '500', marginTop: '4px' }}>{dealer.company_name}</p>
            </div>
            <div>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Tax ID:</span>
              <p style={{ fontWeight: '500', marginTop: '4px' }}>{dealer.tax_id}</p>
            </div>
            <div>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Business Type:</span>
              <p style={{ fontWeight: '500', marginTop: '4px' }}>{dealer.business_type}</p>
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
              padding: '16px',
              background: '#000',
              color: '#fff',
              textAlign: 'center',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Go to Ordering
          </Link>
        ) : (
          <div style={{
            padding: '20px',
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            color: '#92400e'
          }}>
            <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Ordering Not Authorized</p>
            <p style={{ fontSize: '14px' }}>
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
              padding: '16px',
              background: '#f3f4f6',
              color: '#000',
              textAlign: 'center',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              border: '1px solid #e5e7eb'
            }}
          >
            Manage Team Members
          </Link>
        )}

        {profile?.status === 'PENDING' && (
          <Link
            href="/dealer/education"
            style={{
              display: 'block',
              padding: '16px',
              background: '#059669',
              color: '#fff',
              textAlign: 'center',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Complete Training
          </Link>
        )}
      </div>
    </div>
  );
}

