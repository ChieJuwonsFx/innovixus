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

// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Daftar path publik yang tidak perlu dicek autentikasinya
const PUBLIC_PATHS: string[] = [
  '/login',
  '/register',
  '/unauthorized',
  '/forgot-password',
  '/reset-password',
  '/',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const pathname = req.nextUrl.pathname;

  // Lewati semua public paths agar tidak kena redirect loop
  if (PUBLIC_PATHS.includes(pathname)) {
    return res;
  }

  // Hanya cek untuk route /admin
  if (pathname.startsWith('/admin')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Kalau belum login → redirect ke unauthorized
    if (!user) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Cek role user di tabel users
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Kalau gagal ambil data atau bukan Admin → redirect
    if (error || !userProfile || userProfile.role !== 'Admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Semua path kecuali _next, favicon, dan assets statis
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
