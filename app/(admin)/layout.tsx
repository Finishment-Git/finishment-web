'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from 'react';
import type { AdminUser } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Don't check auth for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const { data: adminUserData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!adminUserData) {
        router.push('/admin/login');
        return;
      }

      setAdminUser(adminUserData as AdminUser);
      setLoading(false);
    };

    checkUser();
  }, [router, isLoginPage]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // For login page, just render children without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  const isAdmin = adminUser.role === 'admin';
  const canManageOrders = ['admin', 'production_manager', 'customer_service', 'viewer'].includes(adminUser.role);
  const canManagePayments = ['admin', 'customer_service'].includes(adminUser.role);

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: '#1f2937',
        color: '#fff',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #374151'
      }}>
        <Link href="/admin/dashboard" style={{ textDecoration: 'none', color: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Admin Portal
          </h1>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              {adminUser.full_name || adminUser.email}
            </div>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#374151',
              textTransform: 'capitalize'
            }}>
              {adminUser.role.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid #4b5563',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px',
          background: '#fff',
          borderRight: '1px solid #e5e7eb',
          padding: '1.5rem 0'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <NavLink href="/admin/dashboard" pathname={pathname}>
              Dashboard
            </NavLink>
            
            {canManageOrders && (
              <NavLink href="/admin/orders" pathname={pathname}>
                Orders
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink href="/admin/users" pathname={pathname}>
                  Users
                </NavLink>
                <NavLink href="/admin/settings" pathname={pathname}>
                  Settings
                </NavLink>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#f9fafb'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, pathname, children }: { href: string; pathname: string; children: React.ReactNode }) {
  const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
  
  return (
    <Link
      href={href}
      style={{
        padding: '12px 24px',
        textDecoration: 'none',
        color: isActive ? '#000' : '#6b7280',
        fontWeight: isActive ? '600' : '400',
        backgroundColor: isActive ? '#f3f4f6' : 'transparent',
        borderLeft: isActive ? '3px solid #000' : '3px solid transparent',
        display: 'block',
        fontSize: '14px'
      }}
    >
      {children}
    </Link>
  );
}
