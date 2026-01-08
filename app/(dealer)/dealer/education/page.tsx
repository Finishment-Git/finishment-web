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
      <header className="max-w-5xl mx-auto bg-slate-900 text-white p-8 rounded-t-2xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finishment Dealer Education</h1>
            <p className="text-slate-400 mt-2">Elevating the Standard for Staircase Installation</p>
          </div>
          <div className="bg-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Dealer Sales Toolkit 2026
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto shadow-xl rounded-b-2xl overflow-hidden border-x border-b" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        
        {/* Status Banner for Active Dealers */}
        {profile?.status === 'ACTIVE' && (
          <div className="bg-green-50 border-b border-green-200 p-4 text-center">
            <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              Your organization is trained and able to order.
            </p>
          </div>
        )}

        <div className="p-6 md:p-10 space-y-12 text-gray-800">
          
          {/* 1. Understanding the Problem */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Understanding the Problem
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                <p className="font-semibold text-red-900 mb-3 text-lg">Standard stair nosings are:</p>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-center gap-2">• Hard to source.</li>
                  <li className="flex items-center gap-2">• Often brittle and overpriced.</li>
                  <li className="flex items-center gap-2">• Rarely match the flooring material.</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                <p className="font-semibold text-orange-900 mb-3 text-lg">These issues lead to:</p>
                <ul className="space-y-2 text-orange-800">
                  <li className="flex items-center gap-2">• Delays in project completion.</li>
                  <li className="flex items-center gap-2">• Increased costs.</li>
                  <li className="flex items-center gap-2">• Poor aesthetics and dissatisfied customers.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Finishment’s Solution */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Finishment’s Solution
            </h2>
            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-md">
              <h3 className="text-xl font-bold mb-4 italic">Custom Stair Nosings Made From YOUR Material</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-500/30 p-4 rounded-lg border border-blue-400/30">
                  <h4 className="font-bold mb-2">Perfect Color</h4>
                  <p className="text-sm">Same dye lot for perfect color consistency across the entire project.</p>
                </div>
                <div className="bg-blue-500/30 p-4 rounded-lg border border-blue-400/30">
                  <h4 className="font-bold mb-2">Superior Strength</h4>
                  <p className="text-sm">Same durable material for superior strength and longevity.</p>
                </div>
                <div className="bg-blue-500/30 p-4 rounded-lg border border-blue-400/30">
                  <h4 className="font-bold mb-2">Seamless Finish</h4>
                  <p className="text-sm">A seamless finish that elevates the entire project's aesthetic.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Why Choose Finishment? */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Why Choose Finishment?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-slate-200 p-5 rounded-xl hover:border-blue-500 transition-colors">
                <h3 className="font-bold text-blue-600 mb-2">Speed</h3>
                <p className="text-sm">Delivery within 24–72 hours.</p>
              </div>
              <div className="border border-slate-200 p-5 rounded-xl hover:border-blue-500 transition-colors">
                <h3 className="font-bold text-blue-600 mb-2">Logistics</h3>
                <p className="text-sm">Local drop-off/pick-up & shipping options.</p>
              </div>
              <div className="border border-slate-200 p-5 rounded-xl hover:border-blue-500 transition-colors">
                <h3 className="font-bold text-blue-600 mb-2">Pricing</h3>
                <p className="text-sm">Comparable or better than standard options.</p>
              </div>
              <div className="border border-slate-200 p-5 rounded-xl hover:border-blue-500 transition-colors">
                <h3 className="font-bold text-blue-600 mb-2">Prep Work</h3>
                <p className="text-sm">No need to restructure staircases.</p>
              </div>
            </div>
          </section>

          {/* 4 & 5. Key Selling Points & Positioning */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Key Selling Points</h2>
              <ul className="space-y-3">
                {['Perfect color match', 'Durable and long-lasting', 'Fast turnaround', 'Competitive pricing', 'Hassle-free process'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="text-green-500" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Positioning to Customers</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-sm text-blue-700 uppercase tracking-wider">Time Savings</p>
                  <p className="text-slate-700">Faster project completion.</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-blue-700 uppercase tracking-wider">Profitability</p>
                  <p className="text-slate-700">Reduced labor and material waste.</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-blue-700 uppercase tracking-wider">Quality</p>
                  <p className="text-slate-700">Seamless look that impresses clients.</p>
                </div>
              </div>
            </section>
          </div>

          {/* 6. Overcoming Common Objections */}
          <section className="bg-slate-900 text-white p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Overcoming Common Objections</h2>
            <div className="space-y-6">
              <div className="border-l-2 border-blue-500 pl-4">
                <p className="italic text-slate-400 mb-1">“Standard nosings are cheaper.”</p>
                <p className="font-semibold">Response: Finishment pricing is competitive and saves on labor costs.</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-4">
                <p className="italic text-slate-400 mb-1">“Custom sounds complicated.”</p>
                <p className="font-semibold">Response: Process is simple—just send material, and we handle the rest.</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-4">
                <p className="italic text-slate-400 mb-1">“Will it delay my project?”</p>
                <p className="font-semibold">Response: Delivery in 24–72 hours keeps projects on schedule.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer / CTA */}
        <footer className="p-6 border-t bg-slate-50 border-slate-200">
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
            {profile?.status === 'ACTIVE' ? (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Training Complete</h3>
                <p className="text-slate-600 mb-8">
                  You have already completed the dealer training and your account is active.
                </p>
                
                <button 
                  onClick={() => router.push('/dealer/ordering')}
                  className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Go to Ordering
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to start?</h3>
                <p className="text-slate-600 mb-8">
                  By clicking below, you confirm you've reviewed the training material and are ready to offer custom stair nosings to your clients.
                </p>
                
                <button 
                  onClick={handleCompleteTraining}
                  disabled={loading}
                  className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
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
