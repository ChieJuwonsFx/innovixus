import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Database } from '@/types/database';

import {Sparkles, LayoutGrid, Search} from 'lucide-react';

import Header from '../components/event/Header';
import EventFilters from '../components/event/Filter';
import Slider from '../components/event/Slider';
import Grid from '../components/event/Grid';
import Pagination from '../components/event/Pagination';


type EventRow = Database['public']['Tables']['events']['Row'];
type LevelRow = Database['public']['Tables']['levels']['Row'];
type FieldRow = Database['public']['Tables']['fields']['Row'];
type OrganizerRow = Database['public']['Tables']['organizers']['Row'];

export type EventWithRelations = EventRow & {
  organizers: Pick<OrganizerRow, 'name' | 'instagram'> | null;
  levels: Pick<LevelRow, 'id' | 'name'>[] | null;
  fields: Pick<FieldRow, 'id' | 'name'>[] | null;
};

type EventForSlider = EventRow & {
  organizers: Pick<OrganizerRow, 'name'> | null;
};

type PageProps = {
  params: Promise<{ kategori: string }>;
  searchParams: Promise<{
    q?: string;
    level?: string;
    bidang?: string;
    tipe?: string;
    gratis?: string;
    page?: string;
  }>;
};

const categoryMap: { [key: string]: string } = {
  'info-lomba': 'Info Lomba',
  'info-magang': 'Info Magang',
  'info-event': 'Info Event',
  'info-loker': 'Info Loker',
};

export default async function KategoriPage({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const { kategori } = await params;
  const resolvedSearchParams = await searchParams;

  const dbCategory = categoryMap[kategori];
  if (!dbCategory) {
    notFound();
  }
  
  const now = new Date().toISOString();

  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 12;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const isFiltered = !!(resolvedSearchParams.q || resolvedSearchParams.level || resolvedSearchParams.bidang || resolvedSearchParams.tipe || resolvedSearchParams.gratis);
  
  let query = supabase
    .from('events')
    .select('*, organizers(name, instagram), event_levels(levels(id, name)), event_fields(fields(id, name))', { count: 'exact' })
    .eq('kategori', dbCategory)
    .eq('status', 'Success')
    .filter('open_date', 'lte', 'now()')
    .or(`close_date.gte.${now},close_date.is.null`)
    .order('created_at', { ascending: false });

  if (resolvedSearchParams.q) {
    query = query.ilike('title', `%${resolvedSearchParams.q}%`);
  }

  if (resolvedSearchParams.level) {
    query = query.eq('event_levels.level_id', resolvedSearchParams.level);
  }

  if (resolvedSearchParams.bidang) {
    query = query.eq('event_fields.field_id', resolvedSearchParams.bidang);
  }
  if (resolvedSearchParams.tipe) {
    switch (resolvedSearchParams.tipe) {
      case 'Online':
        query = query.eq('is_online', 'true');
        break;
      case 'Offline':
        query = query.eq('is_online', 'false');
        break;
      case 'Hybrid':
        query = query.eq('tipe_pelaksanaan', 'Hybrid');
        break;
    }
  }

  if (kategori === 'info-lomba' && resolvedSearchParams.gratis) {
    const isGratis = resolvedSearchParams.gratis === 'true';
    query = query.eq('is_free', isGratis);
  }

  query = query.range(start, end);
  
  const { data: events, error, count } = await query;
  
  const [
    { data: levelsData },
    { data: fieldsData },
    { count: totalEvents },
    { data: latestEventsData }
  ] = await Promise.all([
    supabase.from('levels').select('*').order('name'),
    supabase.from('fields').select('*').order('name'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('kategori', dbCategory).eq('status', 'Success').lte('open_date', now).or(`close_date.gte.${now},close_date.is.null`),
    isFiltered 
      ? Promise.resolve({ data: [] }) 
      : supabase.from('events').select('*, organizers(name)').eq('kategori', dbCategory).eq('status', 'Success').lte('open_date', now).or(`close_date.gte.${now},close_date.is.null`).order('created_at', { ascending: false }).limit(6)
  ]);
  
  if (error) {
    console.error("Error fetching events:", error.message);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h1>
          <p>Gagal memuat data. Silakan coba lagi nanti.</p>
        </div>
      </div>
    );
  }

  const levels = levelsData || [];
  const fields = fieldsData || [];
  const latestEvents = (latestEventsData as EventForSlider[]) || [];
  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="mx-auto py-8 pt-28">
        <section className='px-4'>
          <Header
            kategori={kategori}
            totalEvents={totalEvents || 0}
          />
        </section>

        <section className="my-12 px-4">
          <EventFilters levels={levels} fields={fields} kategori={kategori} />
        </section>
        
        {!isFiltered && latestEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="flex items-center gap-3 text-2xl font-bold px-6">
              <Sparkles className="h-6 w-6" />
              Event Terbaru
            </h2>
            <Slider events={latestEvents} kategori={kategori} />
          </section>
        )}

        <main className='px-4'>
          <h2 className="flex items-center gap-3 text-2xl font-bold mb-2">
            {isFiltered ? (
              <Search className="h-6 w-6" />
            ) : (
              <LayoutGrid className="h-6 w-6" />
            )}
            {isFiltered ? 'Hasil Pencarian' : 'Semua Event Aktif'}
          </h2>
          <Grid
            events={events as EventWithRelations[]}
            count={count}
            isFiltered={isFiltered}
            kategori={kategori}
            searchQuery={resolvedSearchParams.q}
          />
        </main>
        
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}