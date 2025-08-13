// import { NextRequest, NextResponse } from 'next/server'
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })

//   await supabase.auth.getSession()

//   if (req.nextUrl.pathname.startsWith('/admin')) {
    
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return NextResponse.redirect(new URL('/unauthorized', req.url))
//     }

//     const { data: userProfile, error } = await supabase
//       .from('users')
//       .select('role')
//       .eq('id', user.id)
//       .single()

//     if (error || !userProfile) {
//       return NextResponse.redirect(new URL('/unauthorized', req.url))
//     }

//     if (userProfile.role !== 'Admin') {
//       return NextResponse.redirect(new URL('/unauthorized', req.url))
//     }
//   }

//   return res
// }

// export const config = {
//   matcher: [

//     '/((?!_next/static|_next/image|favicon.ico).*)',
//   ],
// }

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type UserWithRole = User & {
  role?: string;
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    const supabase = createMiddlewareClient({ req, res });

    const { data: { session } } = await supabase.auth.getSession();

    if (!req.nextUrl.pathname.startsWith('/admin')) {
      return res;
    }

    if (!session?.user) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    const user = session.user as UserWithRole;
    const userRole = user.role || null;

    if (userRole !== 'Admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return res;
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
