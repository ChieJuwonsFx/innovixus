import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';


export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      console.log('MIDDLEWARE: No user found, redirecting to unauthorized.');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
        console.error('MIDDLEWARE: Error fetching user profile:', error.message);
        return NextResponse.redirect(new URL('/error', req.url));
    }

    if (userProfile?.role !== 'Admin') {
      console.log(`MIDDLEWARE: User ${user.email} with role '${userProfile?.role}' tried to access admin area.`);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  if (user && ['/login', '/register'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register',
  ],
};