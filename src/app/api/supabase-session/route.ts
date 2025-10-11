import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!,
 {
  auth: {
   autoRefreshToken: false,
   persistSession: false
  }
 }
)

export async function POST(req: Request) {
 try {
  const nextAuthSession = await getServerSession(authOptions)
    
    const { idToken } = await req.json(); 

  console.log("🔵 /api/supabase-session POST called for:", nextAuthSession?.user?.email)

  if (!nextAuthSession?.user?.email || !idToken) {
   return NextResponse.json({ error: 'Unauthorized or missing ID Token' }, { status: 401 })
  }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
    });

  if (sessionError || !sessionData.session) {
   return NextResponse.json({ error: 'Failed to exchange ID Token for Supabase session' }, { status: 500 })
  }


  return NextResponse.json({
   access_token: sessionData.session.access_token,
   refresh_token: sessionData.session.refresh_token,
   user_id: sessionData.user.id,
  })
 } catch (error) {
  return NextResponse.json({ 
   error: 'Internal server error',
   details: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 500 })
 }
}