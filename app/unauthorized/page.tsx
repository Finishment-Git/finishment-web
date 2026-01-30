import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#ef4444'
      }}>
        403
      </h1>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '8px'
      }}>
        Access Denied
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '24px',
        maxWidth: '500px'
      }}>
        You don't have permission to access this resource. Please contact an administrator if you believe this is an error.
      </p>
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Link
          href="/admin/dashboard"
          style={{
            padding: '12px 24px',
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }}
        >
          Go to Dashboard
        </Link>
        <Link
          href="/admin/login"
          style={{
            padding: '12px 24px',
            background: '#f3f4f6',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            border: '1px solid #e5e7eb'
          }}
        >
          Login
        </Link>
      </div>
    </div>
  )
}
