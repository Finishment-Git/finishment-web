'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, AlertTriangle, ShieldCheck, Ruler, Package } from 'lucide-react';

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function DealerEducation() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pitch');

  // 1. Check if they are actually logged in and get profile
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/dealer-login');
        return;
      }
      
      setUser(user);
      
      // Get user profile to check if they're primary
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, dealer_id, is_primary, status')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        
        // If already active, redirect to ordering
        if (profileData.status === 'ACTIVE') {
          router.push('/dealer/ordering');
        }
      }
    };
    getUser();
  }, [router, supabase]);

  // 2. The "Unlock" Logic
  const handleCompleteTraining = async () => {
    if (!user || !profile) return;
    setLoading(true);

    // Update user profile status to ACTIVE
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('id', user.id);

    if (profileError) {
      alert("Error updating status: " + profileError.message);
      setLoading(false);
      return;
    }

    // If user is primary, also update dealer status to ACTIVE
    if (profile.is_primary && profile.dealer_id) {
      const { error: dealerError } = await supabase
        .from('dealers')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.dealer_id);

      if (dealerError) {
        alert("Error updating dealer status: " + dealerError.message);
        setLoading(false);
        return;
      }
    }

    // Success! Send them to the Ordering Page
    alert("🎉 Congratulations! You are now an authorized dealer.");
    router.push("/dealer/ordering");
  };

  if (!user || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      {/* Header Section */}
      <header className="max-w-5xl mx-auto bg-slate-900 text-white p-8 rounded-t-2xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finishment Dealer Portal</h1>
            <p className="text-slate-400 mt-2">Elevating the Standard for Staircase Installation</p>
          </div>
          <div className="bg-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Retail Sales Toolkit 2026
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto bg-white shadow-xl rounded-b-2xl overflow-hidden border-x border-b">
        
        {/* Navigation Tabs */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('pitch')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'pitch' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            The Sales Pitch
          </button>
          <button 
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'compare' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Comparison Guide
          </button>
          <button 
            onClick={() => setActiveTab('process')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'process' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Dealer Checklist
          </button>
        </div>

        <div className="p-6 md:p-10">
          
          {/* TAB 1: THE PITCH */}
          {activeTab === 'pitch' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <section className="bg-blue-50 border-l-4 border-blue-500 p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-2">The "Invisible" Solution</h2>
                <p className="text-blue-800 leading-relaxed">
                  Stop settling for "close enough." With Finishment, we use the customer's <strong>actual flooring planks</strong> to create a custom stair nose that is 100% color-matched and sits perfectly flush.
                </p>
              </section>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                  <ShieldCheck className="text-blue-600 mb-3" size={32} />
                  <h3 className="font-bold text-lg mb-2">Safety First</h3>
                  <p className="text-sm text-gray-600">Zero-trip hazard. Flush mount means no raised edges for heels to catch on.</p>
                </div>
                <div className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                  <Ruler className="text-blue-600 mb-3" size={32} />
                  <h3 className="font-bold text-lg mb-2">Perfect Grain</h3>
                  <p className="text-sm text-gray-600">Continuous visual flow from the landing over the step. No plastic transitions.</p>
                </div>
                <div className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                  <Package className="text-blue-600 mb-3" size={32} />
                  <h3 className="font-bold text-lg mb-2">System Based</h3>
                  <p className="text-sm text-gray-600">Compatible with LVP, Laminate, and Engineered Wood from any manufacturer.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPARISON */}
          {activeTab === 'compare' && (
            <div className="overflow-x-auto animate-in slide-in-from-right duration-500">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-left border">Feature</th>
                    <th className="p-4 text-left border">Standard Overlap</th>
                    <th className="p-4 text-left border bg-blue-50">Finishment Flush-Mount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border font-semibold">Visual Profile</td>
                    <td className="p-4 border text-red-600 flex items-center gap-2"><AlertTriangle size={16}/> Bulky 1/4" Bump</td>
                    <td className="p-4 border bg-blue-50 text-green-700 font-bold flex items-center gap-2"><CheckCircle size={16}/> Seamless & Level</td>
                  </tr>
                  <tr>
                    <td className="p-4 border font-semibold">Color Match</td>
                    <td className="p-4 border text-gray-600">"Coordinated" Wrap</td>
                    <td className="p-4 border bg-blue-50 text-green-700 font-bold">100% Identical</td>
                  </tr>
                  <tr>
                    <td className="p-4 border font-semibold">Durability</td>
                    <td className="p-4 border text-gray-600">Glue/Track Dependent</td>
                    <td className="p-4 border bg-blue-50 text-green-700 font-bold">Structurally Bonded</td>
                  </tr>
                  <tr>
                    <td className="p-4 border font-semibold">Home Value</td>
                    <td className="p-4 border text-gray-600">Builder Grade</td>
                    <td className="p-4 border bg-blue-50 text-green-700 font-bold">Architectural Grade</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: DEALER CHECKLIST */}
          {activeTab === 'process' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold">Success Checklist</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="mt-1.5 h-5 w-5 rounded border-gray-300 text-blue-600" />
                  <div>
                    <p className="font-bold">The "One Extra Box" Rule</p>
                    <p className="text-sm text-gray-600">Did you add one full box of flooring to the order for fabrication material?</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="mt-1.5 h-5 w-5 rounded border-gray-300 text-blue-600" />
                  <div>
                    <p className="font-bold">Lead Time Alignment</p>
                    <p className="text-sm text-gray-600">Did you inform the customer of the 10-14 day custom fabrication window?</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="mt-1.5 h-5 w-5 rounded border-gray-300 text-blue-600" />
                  <div>
                    <p className="font-bold">Subfloor Check</p>
                    <p className="text-sm text-gray-600">Confirm the installer knows this is a flush-mount system requiring a clean stair subfloor.</p>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer / CTA */}
        <footer className="bg-gray-100 p-6 border-t">
          <div style={{ background: '#f3f4f6', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              Ready to order?
            </h3>
            <p style={{ marginBottom: '20px', color: '#4b5563' }}>
              By clicking the button below, you acknowledge that you have viewed the training material.
            </p>
            
            <button 
              onClick={handleCompleteTraining}
              disabled={loading}
              style={{ 
                padding: '16px 32px', 
                background: '#059669',
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Unlocking Account..." : "Complete Training & Unlock Pricing"}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
