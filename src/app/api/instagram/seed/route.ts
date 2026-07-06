import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET() {
  try {
    const token = process.env.IG_ACCESS_TOKEN?.trim();
    if (!token) return NextResponse.json({ error: 'IG_ACCESS_TOKEN not in env' }, { status: 400 });

    const { error } = await supabase.from('app_settings').upsert(
      { key: 'ig_access_token', value: token, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Token seeded' });
  } catch (e) {
    console.error('Seed error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
