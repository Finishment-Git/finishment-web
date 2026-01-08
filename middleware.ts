import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies for the current execution
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Create a new response to reflect the new cookies
          response = NextResponse.next({
            request,
          })
          
          // Set cookies on the response so they reach the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This line is critical: it triggers the refresh logic and catches session issues
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Protect dealer routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/dealer/') && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dealer-login'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Redirect authenticated users away from login/register pages
  if (user && (request.nextUrl.pathname === '/dealer-login' || request.nextUrl.pathname === '/dealer-register')) {
    return NextResponse.redirect(new URL('/dealer/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any image files (svg, png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
