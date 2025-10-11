import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .eq('email', email)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
    const token = await new SignJWT({
      email: userData.email,
      name: userData.name,
      supabaseId: userData.id,
      role: userData.role,
      sub: userData.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret)

    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    
    cookieStore.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    if (!isProduction) {
      cookieStore.set('__Secure-next-auth.session-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Supabase sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}