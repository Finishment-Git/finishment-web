import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If env vars are missing, just continue without auth checks
    console.error('Missing Supabase environment variables in middleware')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if expired
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      // If there's an auth error, continue without blocking
      console.error('Middleware auth error:', error.message)
    }

    // Protect dealer routes - redirect to login if not authenticated
    if (request.nextUrl.pathname.startsWith('/dealer/') && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dealer-login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users away from login/register pages
    if (user && (request.nextUrl.pathname === '/dealer-login' || request.nextUrl.pathname === '/dealer-register')) {
      return NextResponse.redirect(new URL('/dealer/dashboard', request.url))
    }

    return response
  } catch (error) {
    // If middleware fails, don't block the request
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/dealer/:path*',
    '/dealer-login',
    '/dealer-register',
    '/dealer-join',
  ],
}

