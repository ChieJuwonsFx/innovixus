import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(requestUrl.origin);
  }

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(requestUrl.origin);
      }

      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            const name = data.user.user_metadata?.name || 
                         data.user.user_metadata?.full_name || 
                         data.user.email?.split('@')[0] || 'User';

            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                name: name,
                email: data.user.email!,
                role: 'User'
              });
            
            if (insertError && insertError.code !== '23505') { 
              console.error('Error creating user profile:', insertError);
            }
          }
        } catch (profileCheckError) {
          console.error('Error checking/creating user profile:', profileCheckError);
        }
      }

      return NextResponse.redirect(requestUrl.origin);

    } catch (unexpectedError) {
      console.error('Unexpected error in auth callback:', unexpectedError);
      return NextResponse.redirect(requestUrl.origin);
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}