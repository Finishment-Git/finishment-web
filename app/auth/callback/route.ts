import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Auth callback for password reset and email confirmation.
 * Handles both PKCE (code) and token_hash flows.
 * Add to Supabase Redirect URLs: http://localhost:3000/auth/callback (dev) and your production URL.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dealer-login'

  if (code || (tokenHash && type === 'recovery')) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore in Server Components
            }
          },
        },
      }
    )

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const redirectUrl = next.startsWith('/') ? `${origin}${next}` : next
        const url = new URL(redirectUrl)
        if (url.pathname === '/dealer-login') {
          url.searchParams.set('recovery', 'true')
        }
        return NextResponse.redirect(url.toString())
      }
      console.error('Auth callback code exchange error:', error)
    } else if (tokenHash && type === 'recovery') {
      const { error } = await supabase.auth.verifyOtp({
        type: 'recovery',
        token_hash: tokenHash,
      })
      if (!error) {
        const redirectUrl = next.startsWith('/') ? `${origin}${next}` : next
        const url = new URL(redirectUrl)
        if (url.pathname === '/dealer-login') {
          url.searchParams.set('recovery', 'true')
        }
        return NextResponse.redirect(url.toString())
      }
      console.error('Auth callback verifyOtp error:', error)
    }
  }

  return NextResponse.redirect(`${origin}/dealer-login?error=auth_callback_failed`)
}
