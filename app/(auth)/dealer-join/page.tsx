'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

const DealerJoinContent = () => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<'search' | 'register'>('search');
  const [dealerInfo, setDealerInfo] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    taxId: '',
    email: '',
    password: '',
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    // Search for dealer by Tax ID
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select('id, company_name, tax_id, status')
      .eq('tax_id', formData.taxId)
      .single();

    if (error || !dealer) {
      setErrorMsg("Dealer account not found. Please check the Tax ID or contact the primary account holder.");
      setLoading(false);
      return;
    }

    if (dealer.status !== 'ACTIVE') {
      setErrorMsg("This dealer account is not yet active. The primary account holder must complete the dealer training first. Please contact them to complete the registration process.");
      setLoading(false);
      return;
    }

    setDealerInfo(dealer);
    setStep('register');
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    // 1. Create the User (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setErrorMsg("Error creating account: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user && dealerInfo) {
      // 2. Create the User Profile linked to existing dealer
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            dealer_id: dealerInfo.id,
            company_name: dealerInfo.company_name,
            tax_id: dealerInfo.tax_id,
            business_type: 'Retailer', // Default, can be updated later
            status: 'PENDING',
            is_primary: false,  // Not primary user
            can_order: false    // Default: no ordering permission
          },
        ]);

      if (profileError) {
        if (profileError.code === '23505') {
          setErrorMsg("An account with this email already exists. Please log in instead.");
        } else {
          setErrorMsg("Error creating profile: " + profileError.message);
        }
        setLoading(false);
        return;
      }

      alert("Account created! The primary account holder will need to approve your access. Redirecting to login...");
      router.push("/dealer-login?registered=true");
    }
    setLoading(false);
  };

  if (step === 'search') {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>Join Existing Dealer Account</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Enter the Tax ID provided by your primary account holder
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tax ID / Reseller #</label>
            <input
              type="text"
              placeholder="e.g. 12-3456789"
              value={formData.taxId}
              onChange={(e) => setFormData({...formData, taxId: e.target.value})}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Ask your primary account holder for the Tax ID
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '14px',
              background: loading ? '#ccc' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loading ? "Searching..." : "Find Dealer Account"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          <Link href="/dealer-register" style={{ color: '#666', textDecoration: 'underline' }}>
            Register a new dealer account instead
          </Link>
        </div>
      </div>
    );
  }

  // Registration step
  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>Create Your Account</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Joining: <strong>{dealerInfo?.company_name}</strong>
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Create Password</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              style={{ width: '100%', padding: '12px', paddingRight: '45px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                height: '100%'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '14px',
            background: loading ? '#ccc' : '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
        <button
          onClick={() => {
            setStep('search');
            setErrorMsg('');
            setFormData({ taxId: formData.taxId, email: '', password: '' });
          }}
          style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Back to search
        </button>
      </div>
    </div>
  );
};

const DealerJoin = () => {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    }>
      <DealerJoinContent />
    </Suspense>
  );
};

export default DealerJoin;

