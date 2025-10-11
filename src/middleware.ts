import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                       req.nextUrl.pathname.startsWith('/register')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (isAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      if (token?.role !== 'Admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                          req.nextUrl.pathname.startsWith('/register')
        const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
        const isProfilePage = req.nextUrl.pathname.startsWith('/profile')
        const isPartnershipSubmit = req.nextUrl.pathname.startsWith('/partnerships/submit') ||
                                   req.nextUrl.pathname.startsWith('/partnerships/my-submissions') ||
                                   req.nextUrl.pathname.startsWith('/partnerships/payment')

        if (isAuthPage) return true

        if (isAdminPage) {
          const hasAccess = !!token && token.role === 'Admin'
          return hasAccess
        }

        if (isProfilePage || isPartnershipSubmit) {
          return !!token
        }

        return true
      },
    },
  }
)

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