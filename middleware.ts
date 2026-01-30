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

    // Note: "Auth session missing" is expected when no user is logged in - not a real error
    // Only log unexpected auth errors (not session-related ones)
    if (error && !error.message?.toLowerCase().includes('session')) {
      console.error('Middleware auth error:', error.message)
    }

    // 4. Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Allow access to login page
      if (request.nextUrl.pathname === '/admin/login') {
        // If already authenticated as admin, redirect to dashboard
        if (user) {
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .single()
          
          if (adminUser) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          }
        }
        return response
      }
      
      // For all other admin routes, require authentication
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      // Check if user exists in admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (adminError || !adminUser) {
        // User is authenticated but not an admin user
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      
      // Check role-based access for admin-only routes
      const adminOnlyRoutes = ['/admin/users', '/admin/settings']
      const isAdminOnlyRoute = adminOnlyRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
      )
      
      if (isAdminOnlyRoute && adminUser.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    // 5. Protect dealer routes - redirect to login if not authenticated
    if (request.nextUrl.pathname.startsWith('/dealer/') && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dealer-login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 6. Redirect authenticated users away from login/register pages
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
