'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setErrorMsg("Invalid email or password");
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setErrorMsg("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 3. Check if user exists in admin_users table
      // Use the user ID directly from auth response
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role, email')
        .eq('id', authData.user.id)
        .single();

      if (adminError) {
        console.error('Admin user lookup error:', adminError);
        // User is authenticated but not an admin user or RLS blocked the query
        await supabase.auth.signOut(); // Sign them out
        setErrorMsg(`Access denied: ${adminError.message || 'Admin user not found'}`);
        setLoading(false);
        return;
      }

      if (!adminUser) {
        // User is authenticated but not an admin user
        await supabase.auth.signOut(); // Sign them out
        setErrorMsg("Access denied. This account is not authorized for admin access.");
        setLoading(false);
        return;
      }

      // 4. Update last login timestamp
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      // 5. Redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMsg("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Admin Login
          </h1>
          <p style={{ color: '#6b7280' }}>
            Access the admin dashboard
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontSize: '16px'
              }}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '16px'
                }}
                placeholder="••••••••"
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
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
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
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing In..." : "Log In"}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Forgot your password? Contact a system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
