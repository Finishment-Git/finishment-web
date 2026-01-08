'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, AlertTriangle, ShieldCheck, Ruler, Package } from 'lucide-react';

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic';

export default function DealerEducation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pitch');

  // 1. Check if they are actually logged in and get profile
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
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
      }
    };
    getUser();
  }, [router]);

  // 2. The "Unlock" Logic
  const handleCompleteTraining = async () => {
    if (!user || !profile) return;
    setLoading(true);
    const supabase = createClient();

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
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', color: '#000000' }}>
        <p style={{ color: '#000000' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans" style={{ backgroundColor: '#ffffff' }}>
      {/* Header Section */}
      <header className="max-w-5xl mx-auto bg-white p-8 rounded-t-2xl border-t border-x border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#000000' }}>Finishment Dealer Education</h1>
            <p className="mt-2" style={{ color: '#333333' }}>Elevating the Standard for Staircase Installation</p>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto border-x border-b border-gray-200 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
        
        {/* Status Banner for Active Dealers */}
        {profile?.status === 'ACTIVE' && (
          <div className="bg-gray-50 border-b border-gray-200 p-4 text-center">
            <p className="font-semibold flex items-center justify-center gap-2" style={{ color: '#000000' }}>
              <CheckCircle size={20} style={{ color: '#000000' }} />
              Your organization is trained and able to order.
            </p>
          </div>
        )}

        <div className="p-6 md:p-10 space-y-12">
          
          {/* 1. Understanding the Problem */}
          <section className="p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#000000' }}>
              Understanding the Problem
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="font-bold mb-3 text-lg" style={{ color: '#000000' }}>Standard stair nosings are:</p>
                <ul className="space-y-2 list-none" style={{ color: '#000000', fontWeight: '500' }}>
                  <li>Hard to source.</li>
                  <li>Often brittle and overpriced.</li>
                  <li>Rarely match the flooring material.</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="font-bold mb-3 text-lg" style={{ color: '#000000' }}>These issues lead to:</p>
                <ul className="space-y-2 list-none" style={{ color: '#000000', fontWeight: '500' }}>
                  <li>Delays in project completion.</li>
                  <li>Increased costs.</li>
                  <li>Poor aesthetics and dissatisfied customers.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Finishment’s Solution */}
          <section className="p-8 rounded-2xl" style={{ backgroundColor: '#f8f9fa' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#000000' }}>
              Finishment’s Solution
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-4 italic" style={{ color: '#000000' }}>Custom Stair Nosings Made From YOUR Material</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-2" style={{ color: '#000000' }}>Perfect Color</h4>
                  <p className="text-sm" style={{ color: '#333333' }}>Same dye lot for perfect color consistency across the entire project.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-2" style={{ color: '#000000' }}>Superior Strength</h4>
                  <p className="text-sm" style={{ color: '#333333' }}>Same durable material for superior strength and longevity.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-2" style={{ color: '#000000' }}>Seamless Finish</h4>
                  <p className="text-sm" style={{ color: '#333333' }}>A seamless finish that elevates the entire project's aesthetic.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Why Choose Finishment? */}
          <section className="p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#000000' }}>
              Why Choose Finishment?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 p-5 rounded-xl hover:border-black transition-colors">
                <h3 className="font-bold mb-2" style={{ color: '#000000' }}>Speed</h3>
                <p className="text-sm" style={{ color: '#333333' }}>Delivery within 24–72 hours.</p>
              </div>
              <div className="bg-white border border-gray-200 p-5 rounded-xl hover:border-black transition-colors">
                <h3 className="font-bold mb-2" style={{ color: '#000000' }}>Logistics</h3>
                <p className="text-sm" style={{ color: '#333333' }}>Local drop-off/pick-up & shipping options.</p>
              </div>
              <div className="bg-white border border-gray-200 p-5 rounded-xl hover:border-black transition-colors">
                <h3 className="font-bold mb-2" style={{ color: '#000000' }}>Pricing</h3>
                <p className="text-sm" style={{ color: '#333333' }}>Comparable or better than standard options.</p>
              </div>
              <div className="bg-white border border-gray-200 p-5 rounded-xl hover:border-black transition-colors">
                <h3 className="font-bold mb-2" style={{ color: '#000000' }}>Prep Work</h3>
                <p className="text-sm" style={{ color: '#333333' }}>No need to restructure staircases.</p>
              </div>
            </div>
          </section>

          {/* 4 & 5. Key Selling Points & Positioning */}
          <div className="p-8 rounded-2xl space-y-8" style={{ backgroundColor: '#f8f9fa' }}>
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#000000' }}>
              Key Selling Points & Positioning
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <section className="bg-white p-6 rounded-2xl border border-gray-200">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Key Selling Points</h2>
                <ul className="space-y-3">
                  {['Perfect color match', 'Durable and long-lasting', 'Fast turnaround', 'Competitive pricing', 'Hassle-free process'].map((item) => (
                    <li key={item} className="flex items-center gap-2" style={{ color: '#000000' }}>
                      <CheckCircle style={{ color: '#000000' }} size={18} />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="bg-white p-6 rounded-2xl border border-gray-200">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Positioning to Customers</h2>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider border-b border-black inline-block mb-1" style={{ color: '#000000' }}>Time Savings</p>
                    <p style={{ color: '#333333' }}>Faster project completion.</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider border-b border-black inline-block mb-1" style={{ color: '#000000' }}>Profitability</p>
                    <p style={{ color: '#333333' }}>Reduced labor and material waste.</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider border-b border-black inline-block mb-1" style={{ color: '#000000' }}>Quality</p>
                    <p style={{ color: '#333333' }}>Seamless look that impresses clients.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* 6. Overcoming Common Objections */}
          <section className="p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#000000' }}>
              Overcoming Common Objections
            </h2>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="space-y-6">
                <div className="border-l-2 border-black pl-4">
                  <p className="italic mb-1" style={{ color: '#666666' }}>“Standard nosings are cheaper.”</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>Response: Finishment pricing is competitive and saves on labor costs.</p>
                </div>
                <div className="border-l-2 border-black pl-4">
                  <p className="italic mb-1" style={{ color: '#666666' }}>“Custom sounds complicated.”</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>Response: Process is simple—just send material, and we handle the rest.</p>
                </div>
                <div className="border-l-2 border-black pl-4">
                  <p className="italic mb-1" style={{ color: '#666666' }}>“Will it delay my project?”</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>Response: Delivery in 24–72 hours keeps projects on schedule.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer / CTA */}
        <footer className="p-6 border-t bg-gray-50 border-gray-200">
          <div className="bg-white p-8 rounded-2xl text-center border border-gray-200 max-w-2xl mx-auto">
            {profile?.status === 'ACTIVE' ? (
              <>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>Training Complete</h3>
                <p className="mb-8" style={{ color: '#333333' }}>
                  You have already completed the dealer training and your account is active.
                </p>
                
                <button 
                  onClick={() => router.push('/dealer/ordering')}
                  className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg bg-black hover:bg-gray-800 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Go to Ordering
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>Ready to start?</h3>
                <p className="mb-8" style={{ color: '#333333' }}>
                  By clicking below, you confirm you've reviewed the training material and are ready to offer custom stair nosings to your clients.
                </p>
                
                <button 
                  onClick={handleCompleteTraining}
                  disabled={loading}
                  className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  {loading ? "Activating Account..." : "I've Read the Training - Unlock My Account"}
                </button>
              </>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
