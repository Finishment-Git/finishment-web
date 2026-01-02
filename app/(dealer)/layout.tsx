// app/(dealer)/layout.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from 'react';

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_primary')
          .eq('id', user.id)
          .single();
        setIsPrimary(profile?.is_primary || false);
      }
    };
    checkUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/dealer-login');
  };

  return (
    <div className="dealer-portal">
      {/* --- THE SPECIAL DEALER HEADER --- */}
      <header style={{ background: '#222', color: '#fff', paddingTop: '0.25rem', paddingBottom: '0.25rem', paddingLeft: '1rem', paddingRight: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dealer/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', margin: 0, padding: 0 }}>
          <Image 
            src="/logo2.png" 
            alt="Finishment Logo" 
            width={480} 
            height={160} 
            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', margin: 0, padding: 0, display: 'block' }}
            priority
          />
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/dealer/dashboard" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-gray-300">Dashboard</Link>
          <Link href="/dealer/ordering" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-gray-300">Ordering</Link>
          <Link href="/dealer/education" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-gray-300">Training</Link>
          {isPrimary && (
            <Link href="/dealer/team" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-gray-300">Team</Link>
          )}
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
          >
            Log Out
          </button>
        </nav>
      </header>

      {/* This renders the specific page content */}
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}