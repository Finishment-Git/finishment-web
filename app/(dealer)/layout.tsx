// app/(dealer)/layout.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from 'react';

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPrimary, setIsPrimary] = useState(false);
  const isOrderPage = pathname === '/dealer/ordering';

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
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
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/dealer-login');
  };

  return (
    <div className="dealer-portal" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* --- THE SPECIAL DEALER HEADER --- */}
      <header style={{ background: '#222', color: '#fff', paddingTop: '0.25rem', paddingBottom: '0.25rem', paddingLeft: '1rem', paddingRight: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isOrderPage ? (
          <div 
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm('Order not submitted. You will lose your work if you exit now. Are you sure you want to leave?')) {
                router.push('/');
              }
            }}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0, padding: 0 }}
          >
            <Image 
              src="/logo2.png" 
              alt="Finishment Logo" 
              width={480} 
              height={160} 
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', margin: 0, padding: 0, display: 'block' }}
              priority
            />
          </div>
        ) : (
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', margin: 0, padding: 0 }}>
            <Image 
              src="/logo2.png" 
              alt="Finishment Logo" 
              width={480} 
              height={160} 
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', margin: 0, padding: 0, display: 'block' }}
              priority
            />
          </Link>
        )}
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/dealer/dashboard" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-gray-300">Dashboard</Link>
          <Link href="/dealer/ordering" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-gray-300">Ordering</Link>
          <Link href="/dealer/education" style={{ color: '#fff', textDecoration: 'none' }} className="hover:text-gray-300">Training</Link>
          {isPrimary && (
            <Link href="/dealer/team" style={{ color: '#fff', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} className="hover:text-gray-300">
              <span>Manage</span>
              <span>Users</span>
            </Link>
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
      <main className="p-8" style={{ backgroundColor: '#ffffff' }}>
        {children}
      </main>
    </div>
  );
}