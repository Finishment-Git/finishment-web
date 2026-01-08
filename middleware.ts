import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Create the initial response
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
    // 2. Initialize Supabase with the modernized cookie pattern
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Update request cookies so the rest of the middleware can see them
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            
            // Create a new response to carry the new cookies
            response = NextResponse.next({
              request,
            })
            
            // Set the cookies on the response so they reach the browser
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 3. Refresh session if expired - this triggers the cookie logic above
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      // If there's an auth error, continue without blocking
      console.error('Middleware auth error:', error.message)
    }

    // 4. Protect dealer routes - redirect to login if not authenticated
    if (request.nextUrl.pathname.startsWith('/dealer/') && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dealer-login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 5. Redirect authenticated users away from login/register pages
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any image extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
