'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { LogOut, Menu, X } from 'lucide-react'

const navLinkStyle = {
  color: '#e5e7eb',
  textDecoration: 'none' as const,
  fontSize: '15px',
  fontWeight: 500,
  padding: '8px 12px',
  borderRadius: '6px',
  transition: 'color 0.2s, background 0.2s',
}

export function DealerShell({
  isPrimary,
  children,
}: {
  isPrimary: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isOrderPage = pathname === '/dealer/ordering'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/dealer-login')
  }

  const isActive = (path: string) => pathname === path
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="dealer-portal" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <header className="dealer-header" style={{
        background: 'linear-gradient(180deg, #1a1a1e 0%, #0f0f12 100%)',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        {isOrderPage ? (
          <div
            onClick={(e) => {
              e.preventDefault()
              if (window.confirm('Order not submitted. You will lose your work if you exit now. Are you sure you want to leave?')) {
                router.push('/')
              }
            }}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0, padding: 0 }}
          >
            <Image
              src="/logo2.png"
              alt="Finishment Logo"
              width={160}
              height={52}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', margin: 0, padding: 0, display: 'block', opacity: 0.95 }}
              priority
            />
          </div>
        ) : (
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', margin: 0, padding: 0 }}>
            <Image
              src="/logo2.png"
              alt="Finishment Logo"
              width={160}
              height={52}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', margin: 0, padding: 0, display: 'block', opacity: 0.95 }}
              priority
            />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setMobileNavOpen((o) => !o)}
          className="dealer-mobile-menu-btn"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            color: '#e5e7eb',
            cursor: 'pointer',
          }}
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`dealer-nav ${mobileNavOpen ? 'dealer-nav-open' : ''}`} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link
            href="/dealer/dashboard"
            style={{
              ...navLinkStyle,
              color: isActive('/dealer/dashboard') ? '#ea580c' : '#e5e7eb',
              background: isActive('/dealer/dashboard') ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
            }}
            className="dealer-nav-link"
          >
            Dashboard
          </Link>
          <Link
            href="/dealer/ordering"
            style={{
              ...navLinkStyle,
              color: isActive('/dealer/ordering') ? '#ea580c' : '#e5e7eb',
              background: isActive('/dealer/ordering') ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
            }}
            className="dealer-nav-link"
          >
            Ordering
          </Link>
          <Link
            href="/dealer/education"
            style={{
              ...navLinkStyle,
              color: isActive('/dealer/education') ? '#ea580c' : '#e5e7eb',
              background: isActive('/dealer/education') ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
            }}
            className="dealer-nav-link"
          >
            Training
          </Link>
          {isPrimary && (
            <Link
              href="/dealer/team"
              style={{
                ...navLinkStyle,
                color: isActive('/dealer/team') ? '#ea580c' : '#e5e7eb',
                background: isActive('/dealer/team') ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
              }}
              className="dealer-nav-link"
            >
              Manage Users
            </Link>
          )}
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#f87171',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
            className="dealer-logout-btn"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </nav>
      </header>

      <style jsx>{`
        .dealer-nav-link:hover {
          color: #ea580c !important;
          background: rgba(234, 88, 12, 0.1) !important;
        }
        .dealer-logout-btn:hover {
          background: rgba(239, 68, 68, 0.15) !important;
          border-color: #f87171 !important;
          color: #fca5a5 !important;
        }
        @media (max-width: 640px) {
          .dealer-header {
            flex-wrap: wrap;
          }
          .dealer-mobile-menu-btn {
            display: flex !important;
          }
          .dealer-nav {
            display: none !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: #1a1a1e;
            padding: 16px;
            gap: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 50;
          }
          .dealer-nav-open {
            display: flex !important;
          }
        }
      `}</style>

      <main className="px-6 py-4" style={{ backgroundColor: '#ffffff' }}>
        {children}
      </main>
    </div>
  )
}
