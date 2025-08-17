import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Database } from '@/types/database';

import Header from './components/Header';
import EventFilters from './components/Filter';
import Slider from './components/Slider';
import Grid from './components/Grid';
import Pagination from './components/Pagination';

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

  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 12;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const isFiltered = !!(resolvedSearchParams.q || resolvedSearchParams.level || resolvedSearchParams.bidang || resolvedSearchParams.tipe || resolvedSearchParams.gratis);
  
  let query = supabase
    .from('events')
    .select('*, organizers(name, instagram), levels(id, name), fields(id, name)', { count: 'exact' })
    .eq('kategori', dbCategory)
    .eq('status', 'Success')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (resolvedSearchParams.q) query = query.ilike('title', `%${resolvedSearchParams.q}%`);
  if (resolvedSearchParams.level) query = query.filter('levels.id', 'in', `(${resolvedSearchParams.level})`);
  if (resolvedSearchParams.bidang) query = query.filter('fields.id', 'in', `(${resolvedSearchParams.bidang})`);
  if (resolvedSearchParams.tipe) query = query.eq('is_online', resolvedSearchParams.tipe); 
  if (kategori === 'info-lomba' && resolvedSearchParams.gratis === 'true') query = query.eq('is_free', true);
  
  const { data: events, error, count } = await query;
  
  const [
    { data: levelsData },
    { data: fieldsData },
    { count: totalEvents },
    { data: latestEventsData }
  ] = await Promise.all([
    supabase.from('levels').select('id, name').order('name'),
    supabase.from('fields').select('id, name').order('name'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('kategori', dbCategory).eq('status', 'Success'),
    isFiltered ? Promise.resolve({ data: [] }) : supabase.from('events').select('*, organizers(name)').eq('kategori', dbCategory).eq('status', 'Success').order('created_at', { ascending: false }).limit(6)
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="container mx-auto py-8 pt-28 md:pt-32">
        <div className='px-4'>
        <Header
          kategori={kategori}
          totalEvents={totalEvents || 0}
        />
        </div>

        
        <div className="my-12 px-4">
          <EventFilters levels={levels} fields={fields} kategori={kategori} />
        </div>
        
        {!isFiltered && latestEvents.length > 0 && (
          <div className="mb-16">
            <Slider events={latestEvents} kategori={kategori}  />
          </div>
        )}

        <main className='px-4'>
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