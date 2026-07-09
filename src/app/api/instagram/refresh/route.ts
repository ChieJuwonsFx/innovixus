import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST() {
  try {
    // Refresh token via Meta API
    const currentToken = process.env.IG_ACCESS_TOKEN?.trim();
    if (!currentToken) {
      return NextResponse.json({ error: 'IG_ACCESS_TOKEN not configured' }, { status: 400 });
    }

    const res = await fetch(
      `https://graph.instagram.com/v25.0/refresh_access_token` +
      `?grant_type=ig_refresh_token` +
      `&access_token=${encodeURIComponent(currentToken)}`
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if (!data.access_token) {
      throw new Error(data.error?.message || 'Refresh failed');
    }

    const newToken = data.access_token;

    // Save to Supabase
    await supabase.from('app_settings').upsert(
      { key: 'ig_access_token', value: newToken, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

    console.log('IG token refreshed successfully');

    return NextResponse.json({
      success: true,
      expires_in: data.expires_in,
    });
  } catch (e) {
    console.error('IG refresh error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Refresh failed' },
      { status: 500 }
    );
  }
}
