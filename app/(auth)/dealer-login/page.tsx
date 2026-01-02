'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import Link from "next/link";

const DealerLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  // Show a success message if they just registered
  const justRegistered = searchParams.get('registered') === 'true';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // 1. Log the user in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setErrorMsg("Invalid email or password");
      setLoading(false);
      return;
    }

    // 2. Check their Dealer Status and Permissions
    if (authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, is_primary, can_order')
        .eq('id', authData.user.id)
        .single();

      if (!profile) {
        setErrorMsg("Profile not found. Please contact support.");
        setLoading(false);
        return;
      }

      // 3. Route them based on Status
      if (profile.status === 'PENDING') {
        // They need training -> Send to Education Page
        router.push("/dealer/education");
      } else if (profile.status === 'ACTIVE') {
        // Check if they can order (primary always can, others need permission)
        if (profile.is_primary || profile.can_order) {
          router.push("/dealer/ordering");
        } else {
          // Active but not authorized to order
          router.push("/dealer/dashboard");
        }
      } else {
        setErrorMsg("Your account status is pending review.");
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>Dealer Login</h1>
        <p style={{ color: '#666' }}>Access your portal</p>
      </div>

      {/* Success Message from Registration */}
      {justRegistered && (
        <div style={{ background: '#ecfdf5', color: '#047857', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #a7f3d0' }}>
          ✅ Application received! Please log in to continue.
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
          <input 
            type="password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '10px',
            padding: '14px', 
            background: '#000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Signing In..." : "Log In"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
          <Link href="/dealer-register" style={{ color: '#666', textDecoration: 'underline' }}>
            Need an account? Apply here.
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DealerLogin;