import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/admin')) {
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !userProfile) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (userProfile.role !== 'Admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [

    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}