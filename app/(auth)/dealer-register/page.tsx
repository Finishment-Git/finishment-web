'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import Navbar from "@/components/navbar";

export const dynamic = 'force-dynamic';

const DealerRegister = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: 'Retailer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Create the Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Dealer via Database Function (RPC)
        const { data: dealerId, error: dealerError } = await supabase
          .rpc('create_dealer_for_registration', {
            p_company_name: formData.companyName,
            p_tax_id: formData.taxId,
            p_business_type: formData.businessType
          });

        if (dealerError) throw dealerError;

        // 3. Upsert User Profile to avoid "duplicate key" errors
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: authData.user.id, 
              dealer_id: dealerId,
              company_name: formData.companyName,
              tax_id: formData.taxId,
              business_type: formData.businessType,
              status: 'PENDING',
              is_primary: true,
              can_order: true
            },
          ], { onConflict: 'id' });

        if (profileError) throw profileError;

        alert("Application Received! Please log in to complete your dealer training.");
        router.push("/dealer-login?registered=true&redirect=education");
      }
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.message?.includes('unique constraint') || err.code === '23505') {
        alert("A dealer with this Tax ID or Email already exists.");
      } else {
        alert("Registration Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: '1px solid #333' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Dealer Registration</h1>
        <p style={{ color: '#aaa', fontSize: '14px' }}>Register as a Fishment Dealer to access special pricing.</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Company Legal Name</label>
          <input type="text" required value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tax ID / Reseller #</label>
          <input type="text" required value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Business Type</label>
          <select value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '4px', color: '#fff' }}>
            <option value="Retailer">Flooring Dealer</option>
            <option value="Contractor">Contractor/Installer</option>
            <option value="Designer">Interior Designer</option>
          </select>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #333', margin: '10px 0' }} />

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email Address</label>
          <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
          <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Confirm Password</label>
          <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '15px', background: loading ? '#444' : '#fff', color: '#000', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          {loading ? "Processing..." : "Submit Application"}
        </button>
      </form>
    </div>
    </>
  );
};

export default DealerRegister;