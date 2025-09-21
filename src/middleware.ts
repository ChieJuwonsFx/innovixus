import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  const protectedRoutes = [
    '/partnerships/my-submissions',
    '/partnerships/payment',
    '/profile',
    '/dashboard'
  ];

  const authPages = ['/login', '/register'];

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.redirect(new URL('/error', req.url));
      }

      if (userProfile?.role !== 'Admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    } catch (error) {
      console.error('Error in admin route check:', error);
      return NextResponse.redirect(new URL('/error', req.url));
    }
  }

  const needsAuth = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (needsAuth && !user) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && authPages.includes(req.nextUrl.pathname)) {
    const redirectTo = req.nextUrl.searchParams.get('redirectTo');
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register',
    '/partnerships/my-submissions',
    '/partnerships/payment/:path*',
    '/profile',
    '/dashboard'
  ],
};