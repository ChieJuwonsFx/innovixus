import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deleteMultipleCloudinaryImages } from '@/lib/cloudinary.action';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const nowStr = now.toISOString();
    const result = { closed: 0, closedNull: 0, deleted: 0, errors: [] as string[] };

    const { data: toClose } = await supabase
      .from('events')
      .select('id, close_date, extend_date')
      .not('close_date', 'is', null)
      .not('status', 'eq', 'Closed')
      .lte('close_date', nowStr);

    if (toClose?.length) {
      for (const ev of toClose) {
        const final = ev.extend_date || ev.close_date;
        if (final && new Date(final) <= now) {
          const { error } = await supabase.from('events').update({ status: 'Closed', updated_at: nowStr }).eq('id', ev.id);
          if (error) result.errors.push(`close ${ev.id}: ${error.message}`);
          else result.closed++;
        }
      }
    }

    const { data: toCloseNull } = await supabase
      .from('events')
      .select('id, open_date, created_at')
      .is('close_date', null)
      .not('status', 'eq', 'Closed')
      .not('open_date', 'is', null);

    if (toCloseNull?.length) {
      for (const ev of toCloseNull) {
        const base = ev.open_date || ev.created_at;
        if (!base) continue;
        const limit = new Date(base);
        limit.setDate(limit.getDate() + 30);
        if (limit <= now) {
          const { error } = await supabase.from('events').update({ status: 'Closed', updated_at: nowStr }).eq('id', ev.id);
          if (error) result.errors.push(`closeNull ${ev.id}: ${error.message}`);
          else result.closedNull++;
        }
      }
    }

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const { data: toDelete } = await supabase
      .from('events')
      .select('id, poster, kategori')
      .eq('status', 'Closed')
      .lte('updated_at', thirtyDaysAgoStr);

    if (toDelete?.length) {
      for (const ev of toDelete) {
        try {
          if (ev.poster && Array.isArray(ev.poster)) {
            const urls = ev.poster.map((p: { url: string }) => p.url).filter(Boolean);
            if (urls.length > 0) await deleteMultipleCloudinaryImages(urls);
          }
          const { error } = await supabase.from('events').delete().eq('id', ev.id);
          if (error) result.errors.push(`delete ${ev.id}: ${error.message}`);
          else result.deleted++;
        } catch (err) {
          result.errors.push(`delete ${ev.id}: ${String(err)}`);
        }
      }
    }

    console.log(`Cron done: closed=${result.closed}, closedNull=${result.closedNull}, deleted=${result.deleted}, errors=${result.errors.length}`);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
