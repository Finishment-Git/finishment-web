import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/admin', '/dealer/', '/dealer-login', '/dealer-register']

function needsAuth(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname

  if (!needsAuth(pathname)) {
    return response
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error && !error.message?.toLowerCase().includes('session')) {
      console.error('Middleware auth error:', error.message)
    }

    if (pathname.startsWith('/admin')) {
      if (pathname === '/admin/login') {
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

      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (adminError || !adminUser) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      const adminOnlyRoutes = ['/admin/users', '/admin/settings', '/admin/dealers', '/admin/dealer-users']
      const adminOnlyRoutes = ['/admin/users', '/admin/settings']
      if (adminOnlyRoutes.some(route => pathname.startsWith(route)) && adminUser.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    if (pathname.startsWith('/dealer/') && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dealer-login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (user && (pathname === '/dealer-login' || pathname === '/dealer-register')) {
      // Allow password reset flow: user landed from recovery link and needs to set new password
      if (pathname === '/dealer-login' && request.nextUrl.searchParams.get('recovery') === 'true') {
        return response
      }
      // Platform Admins go to admin; dealers go to dealer dashboard
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (adminUser) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/dealer/dashboard', request.url))
    }

    return response
  } catch (err) {
    console.error('Middleware error:', err)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
