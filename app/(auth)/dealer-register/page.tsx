'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

const DealerRegister = () => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    email: '',
    password: '',
    businessType: 'Retailer', 
    phone: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const supabase = createClient();
    // 1. Create the User (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert("Error creating account: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      try {
        // 2. Create the Dealer Account (Company-level)
        const { data: dealerData, error: dealerError } = await supabase
          .from('dealers')
          .insert([
            {
              company_name: formData.companyName,
              tax_id: formData.taxId,
              business_type: formData.businessType,
              status: 'PENDING'
            },
          ])
          .select()
          .single();

        if (dealerError) {
          // Check if it's a duplicate tax_id error
          if (dealerError.code === '23505') {
            alert("A dealer account with this Tax ID already exists. Please contact support or use the invite system to join.");
          } else {
            alert("Error creating dealer account: " + dealerError.message);
          }
          setLoading(false);
          return;
        }

        // 3. Create the User Profile linked to the dealer
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id, 
              dealer_id: dealerData.id,
              company_name: formData.companyName,
              tax_id: formData.taxId,
              business_type: formData.businessType,
              status: 'PENDING',
              is_primary: true,  // First user is always primary
              can_order: true     // Primary user can always order
            },
          ]);

        if (profileError) {
          // If profile creation fails, try to clean up the dealer record
          await supabase
            .from('dealers')
            .delete()
            .eq('id', dealerData.id);
          
          alert("Error creating profile: " + profileError.message + "\n\nPlease try again or contact support.");
          setLoading(false);
          return;
        }

        // Success! Redirect to login
        alert("Application Received! You are the primary account holder. Please log in to complete the dealer training.");
        router.push("/dealer-login?registered=true&redirect=education"); 
      } catch (error: any) {
        alert("Error during registration: " + (error.message || "Unknown error"));
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  // 3. Render the Form
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* --- NEW SECTION: INSTRUCTIONS --- */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
          Become a Registered Dealer
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Join our network to unlock exclusive pricing and products.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
          Register as a Fishment Dealer to get special pricing and sales tools
        </h3>
      </div>
      {/* ---------------------------------- */}
      
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
        Dealer Details
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Company Name */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Company Legal Name</label>
          <input 
            type="text" 
            placeholder="e.g. Acme Interiors LLC" 
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Tax ID */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tax ID / Reseller #</label>
          <input 
            type="text" 
            placeholder="e.g. 12-3456789" 
            value={formData.taxId}
            onChange={(e) => setFormData({...formData, taxId: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Business Type Dropdown */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Business Type</label>
          <select 
            value={formData.businessType}
            onChange={(e) => setFormData({...formData, businessType: e.target.value})}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="Retailer">Retail Store</option>
            <option value="Contractor">Contractor/Installer</option>
            <option value="Designer">Interior Designer</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
          <input 
            type="email" 
            placeholder="name@company.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Create Password</label>
          <input 
            type="password" 
            placeholder="********" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Submit Button */}
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
          {loading ? "Submitting..." : "Submit Application"}
        </button>

      </form>
    </div>
  );
};

export default DealerRegister;