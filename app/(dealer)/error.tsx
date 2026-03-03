'use client'

export default function DealerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#b91c1c' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '20px', textAlign: 'center', maxWidth: '400px' }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button onClick={reset}
        style={{
          padding: '10px 24px', background: '#222', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
        }}>
        Try again
      </button>
    </div>
  )
}
