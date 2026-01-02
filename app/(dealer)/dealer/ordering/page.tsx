// app/(dealer)/dealer-ordering/page.tsx
'use client'; 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function DealerOrderingPage() {
  const router = useRouter();
  const [cart, setCart] = useState({});
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check authorization on mount
  useEffect(() => {
    const checkAuthorization = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/dealer-login');
        return;
      }

      // Get user profile with permissions
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('status, is_primary, can_order')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        alert("Error loading profile. Please contact support.");
        router.push('/dealer-login');
        return;
      }

      setUserProfile(profile);

      // Check if user can order: must be ACTIVE and (primary OR can_order)
      if (profile.status === 'ACTIVE' && (profile.is_primary || profile.can_order)) {
        setAuthorized(true);
      } else {
        // Not authorized - redirect to dashboard
        router.push('/dealer/dashboard');
      }
      
      setLoading(false);
    };

    checkAuthorization();
  }, [router]);

  // Mock Data
  const products = [
    { id: 1, name: 'Pro 500 Finish', sku: 'FM-500', msrp: 100, dealerPrice: 70 },
    { id: 2, name: 'Matte Coat', sku: 'FM-MAT', msrp: 50, dealerPrice: 35 },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Wholesale Order Form</h1>
      
      {userProfile && !userProfile.is_primary && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fbbf24', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          color: '#92400e'
        }}>
          ℹ️ You have ordering permissions granted by the primary account holder.
        </div>
      )}
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="p-2">Product</th>
            <th className="p-2">SKU</th>
            <th className="p-2">MSRP</th>
            <th className="p-2">Dealer Price</th>
            <th className="p-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className="border-b border-gray-200">
              <td className="p-2">{product.name}</td>
              <td className="p-2">{product.sku}</td>
              <td className="p-2 line-through text-gray-400">${product.msrp}</td>
              <td className="p-2 font-bold text-green-600">${product.dealerPrice}</td>
              <td className="p-2">
                <input type="number" className="border p-1 w-16" min="0" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}