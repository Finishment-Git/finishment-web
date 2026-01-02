'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function TeamManagement() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/dealer-login');
        return;
      }

      setUser(user);

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, dealer_id, is_primary, tax_id')
        .eq('id', user.id)
        .single();

      if (!profileData) {
        router.push('/dealer-login');
        return;
      }

      setProfile(profileData);

      // Check if user is primary
      if (!profileData.is_primary) {
        alert("Only the primary account holder can manage team members.");
        router.push('/dealer/dashboard');
        return;
      }

      // Load all team members for this dealer
      await loadTeamMembers(profileData.dealer_id);
      setLoading(false);
    };

    loadData();
  }, [router, supabase]);

  const loadTeamMembers = async (dealerId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        is_primary,
        can_order,
        status,
        company_name
      `)
      .eq('dealer_id', dealerId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    } else {
      // Get current user once (already available from useEffect)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Map profiles with email information
      const profilesWithEmails = (data || []).map((p) => {
        return { 
          ...p, 
          email: p.id === currentUser?.id ? (currentUser?.email || 'N/A') : `User ${p.id.substring(0, 8)}...` 
        };
      });
      
      setTeamMembers(profilesWithEmails);
    }
  };

  const toggleOrderPermission = async (memberId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ can_order: !currentValue })
      .eq('id', memberId);

    if (error) {
      alert("Error updating permission: " + error.message);
    } else {
      // Reload team members
      if (profile?.dealer_id) {
        await loadTeamMembers(profile.dealer_id);
      }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError('');

    if (!inviteEmail || !inviteEmail.includes('@')) {
      setError('Please enter a valid email address');
      setInviting(false);
      return;
    }

    // Get dealer tax_id for invite
    const { data: dealerData } = await supabase
      .from('dealers')
      .select('tax_id')
      .eq('id', profile?.dealer_id)
      .single();

    const taxId = dealerData?.tax_id || profile?.tax_id || 'N/A';

    // Check if email already exists in auth
    // Note: In production, you'd want to send an actual invite email
    // For now, we'll just show instructions
    alert(
      `To invite ${inviteEmail}:\n\n` +
      `1. Share this link: ${window.location.origin}/dealer-join\n` +
      `2. They should register with this email\n` +
      `3. Use Tax ID: ${taxId}\n\n` +
      `Or they can register normally and you can manually add them later.`
    );

    setInviteEmail('');
    setInviting(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Team Management
      </h1>

      {/* Invite Section */}
      <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Invite Team Member</h2>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="email"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={inviting}
            style={{
              padding: '12px 24px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: inviting ? 'not-allowed' : 'pointer',
              opacity: inviting ? 0.7 : 1
            }}
          >
            {inviting ? 'Sending...' : 'Get Invite Link'}
          </button>
        </form>
        {error && (
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>
        )}
      </div>

      {/* Team Members List */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Team Members</h2>
        
        {teamMembers.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No team members yet. Invite someone to get started.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: member.is_primary ? '#fef3c7' : '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 'bold' }}>
                      {member.email || 'N/A'}
                    </p>
                    {member.is_primary && (
                      <span style={{
                        background: '#fbbf24',
                        color: '#92400e',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        PRIMARY
                      </span>
                    )}
                    <span style={{
                      background: member.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                      color: member.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {member.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Ordering: {member.can_order ? '✅ Authorized' : '❌ Not Authorized'}
                  </p>
                </div>
                
                {!member.is_primary && (
                  <button
                    onClick={() => toggleOrderPermission(member.id, member.can_order)}
                    style={{
                      padding: '8px 16px',
                      background: member.can_order ? '#ef4444' : '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    {member.can_order ? 'Revoke Ordering' : 'Allow Ordering'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => router.push('/dealer/dashboard')}
          style={{
            padding: '12px 24px',
            background: '#f3f4f6',
            color: '#000',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

