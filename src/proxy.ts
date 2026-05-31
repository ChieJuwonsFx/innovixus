import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session: supabaseSession },
  } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
  const isProfilePage = req.nextUrl.pathname.startsWith('/profile')
  const isPartnershipSubmit = req.nextUrl.pathname.startsWith('/partnerships/submit') ||
                             req.nextUrl.pathname.startsWith('/partnerships/my-submissions') ||
                             req.nextUrl.pathname.startsWith('/partnerships/payment')

  if (isAuthPage && supabaseSession) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isProfilePage || isPartnershipSubmit || isAdminPage) {
    if (!supabaseSession) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isAdminPage) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', supabaseSession.user.id)
        .single()

      if (!userData || userData.role !== 'Admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/partnerships/submit/:path*',
    '/partnerships/my-submissions/:path*',
    '/partnerships/payment/:path*',
  ],
}