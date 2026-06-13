import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
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
        remove(name: string, options: CookieOptions) {
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

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Protect Admin dashboard routes (role-based authentication check)
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()) as any

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect account routes
  if (path.startsWith('/account') || path.startsWith('/checkout')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, request.url))
    }
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard/homepage
  if (user && (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
