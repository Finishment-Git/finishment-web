'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function TeamManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
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
      await loadTeamMembers(profileData.dealer_id, supabase);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const loadTeamMembers = async (dealerId: string, supabaseClient: ReturnType<typeof createClient>) => {
    const { data, error } = await supabaseClient
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
      const { data: { user: currentUser } } = await supabaseClient.auth.getUser();
      
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
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ can_order: !currentValue })
      .eq('id', memberId);

    if (error) {
      alert("Error updating permission: " + error.message);
    } else {
      // Reload team members
      if (profile?.dealer_id) {
        await loadTeamMembers(profile.dealer_id, supabase);
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

    const supabase = createClient();
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
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}>
        <p style={{ fontSize: '16px', color: '#000000' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px', 
      fontFamily: 'sans-serif',
      backgroundColor: '#ffffff',
      color: '#000000',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        marginBottom: '30px',
        color: '#000000'
      }}>
        Team Management
      </h1>

      {/* Invite Section */}
      <div style={{ 
        background: '#ffffff', 
        padding: '24px', 
        borderRadius: '8px', 
        border: '2px solid #000000', 
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          color: '#000000'
        }}>
          Invite Team Member
        </h2>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="email"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #000000',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          />
          <button
            type="submit"
            disabled={inviting}
            style={{
              padding: '12px 24px',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: inviting ? 'not-allowed' : 'pointer',
              opacity: inviting ? 0.7 : 1,
              fontSize: '14px'
            }}
          >
            {inviting ? 'Sending...' : 'Get Invite Link'}
          </button>
        </form>
        {error && (
          <p style={{ 
            color: '#dc2626', 
            fontSize: '14px', 
            marginTop: '12px',
            fontWeight: '500',
            backgroundColor: '#fef2f2',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </p>
        )}
      </div>

      {/* Team Members List */}
      <div style={{ 
        background: '#ffffff', 
        padding: '24px', 
        borderRadius: '8px', 
        border: '2px solid #000000',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#000000'
        }}>
          Team Members
        </h2>
        
        {teamMembers.length === 0 ? (
          <p style={{ 
            color: '#374151', 
            fontSize: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            No team members yet. Invite someone to get started.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  background: member.is_primary ? '#fffbeb' : '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #000000',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <p style={{ 
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#000000',
                      margin: 0
                    }}>
                      {member.email || 'N/A'}
                    </p>
                    {member.is_primary && (
                      <span style={{
                        background: '#f59e0b',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        PRIMARY
                      </span>
                    )}
                    <span style={{
                      background: member.status === 'ACTIVE' ? '#10b981' : '#f59e0b',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {member.status}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#374151',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    Ordering: <span style={{ 
                      color: member.can_order ? '#059669' : '#dc2626',
                      fontWeight: '600'
                    }}>
                      {member.can_order ? '✅ Authorized' : '❌ Not Authorized'}
                    </span>
                  </p>
                </div>
                
                {!member.is_primary && (
                  <button
                    onClick={() => toggleOrderPermission(member.id, member.can_order)}
                    style={{
                      padding: '10px 20px',
                      background: member.can_order ? '#dc2626' : '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      marginLeft: '16px'
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

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => router.push('/dealer/dashboard')}
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

