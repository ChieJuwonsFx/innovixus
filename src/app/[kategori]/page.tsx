import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EventFilters from './components/Filter';
import EventCard from './components/Card';
import EventSlider from './components/Slider';
import Pagination from './components/Pagination';
import { Search, Calendar, Trophy, Briefcase } from 'lucide-react';
import { Database } from '@/types/database';

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

const titleMap: { [key: string]: string } = {
  'info-lomba': 'Informasi Lomba',
  'info-magang': 'Informasi Magang',
  'info-loker': 'Informasi Lowongan Kerja',
};

const descriptionMap: { [key: string]: string } = {
  'info-lomba': 'Temukan berbagai lomba menarik untuk mengasah kemampuan dan memenangkan hadiah',
  'info-magang': 'Dapatkan pengalaman kerja berharga melalui program magang terpercaya',
  'info-loker': 'Jelajahi peluang karir terbaik dari berbagai perusahaan terkemuka',
};

const iconMap: { [key: string]: React.ReactNode } = {
  'info-lomba': <Trophy className="h-8 w-8" />,
  'info-magang': <Calendar className="h-8 w-8" />,
  'info-loker': <Briefcase className="h-8 w-8" />,
};

type EventRow = Database['public']['Tables']['events']['Row'];
type LevelRow = Database['public']['Tables']['levels']['Row'];
type FieldRow = Database['public']['Tables']['fields']['Row'];
type OrganizerRow = Database['public']['Tables']['organizers']['Row'];

type EventForSlider = EventRow & {
  organizers: Pick<OrganizerRow, 'name'> | null;
};

type EventWithRelations = EventRow & {
  organizers: Pick<OrganizerRow, 'name' | 'instagram'> | null;
  levels: Pick<LevelRow, 'id' | 'name'>[] | null;
  fields: Pick<FieldRow, 'id' | 'name'>[] | null;
};

export default async function KategoriPage({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const { kategori } = await params;
  const resolvedSearchParams = await searchParams;
  
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 12;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const dbCategory = categoryMap[kategori];
  if (!dbCategory) {
    notFound();
  }
  
  const isFiltered = !!(resolvedSearchParams.q || resolvedSearchParams.level || resolvedSearchParams.bidang || resolvedSearchParams.tipe || resolvedSearchParams.gratis);

  let query = supabase
    .from('events')
    .select(`
      *,
      organizers(name, instagram),
      levels(id, name),
      fields(id, name)
    `, { count: 'exact' })
    .eq('kategori', dbCategory)
    .eq('status', 'Success')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (resolvedSearchParams.q) {
    query = query.ilike('title', `%${resolvedSearchParams.q}%`);
  }
  if (resolvedSearchParams.level) {
    query = query.filter('levels.id', 'in', `(${resolvedSearchParams.level})`);
  }
  if (resolvedSearchParams.bidang) {
    query = query.filter('fields.id', 'in', `(${resolvedSearchParams.bidang})`);
  }
  if (resolvedSearchParams.tipe) {
    query = query.eq('is_online', resolvedSearchParams.tipe);
  }
  if (kategori === 'info-lomba' && resolvedSearchParams.gratis === 'true') {
    query = query.eq('is_free', true);
  }
  
  const { data: events, error, count } = await query;
  
  if (error) {
    console.error("Error fetching events:", error.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gagal memuat data. Silakan coba lagi nanti.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: levelsData }, { data: fieldsData }] = await Promise.all([
    supabase.from('levels').select('id, name').order('name'),
    supabase.from('fields').select('id, name').order('name')
  ]);

  const levels = (levelsData || []) as { id: string; name: string; }[];
  const fields = (fieldsData || []) as { id: string; name: string; }[];

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('kategori', dbCategory)
    .eq('status', 'Success');

  let latestEvents: EventForSlider[] = [];
  if (!isFiltered) {
    const { data: latestEventsData } = await supabase
      .from('events')
      .select('*, organizers(name)')
      .eq('kategori', dbCategory)
      .eq('status', 'Success')
      .order('created_at', { ascending: false })
      .limit(6);
      
    if (latestEventsData) {
      latestEvents = latestEventsData as EventForSlider[];
    }
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 pt-28">
        <header className="text-center mb-16 relative">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg">
              {iconMap[kategori]}
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {titleMap[kategori]}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            {descriptionMap[kategori]}
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-blue-700 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium">
              {totalEvents || 0} {kategori === 'info-lomba' ? 'lomba' : kategori === 'info-magang' ? 'magang' : 'lowongan'} tersedia
            </span>
          </div>
        </header>
        
        <div className="mb-12">
          <EventFilters 
            levels={levels} 
            fields={fields} 
            kategori={kategori} 
          />
        </div>
        
        {!isFiltered && latestEvents.length > 0 && (
          <div className="mb-16">
            <EventSlider events={latestEvents} kategori={kategori} />
          </div>
        )}

        <main className="mb-12">
          {isFiltered && (
            <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hasil Pencarian
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ditemukan {count || 0} hasil
                    {resolvedSearchParams.q && (
                      <span> untuk &ldquo;<span className="font-medium text-blue-600 dark:text-blue-400">{resolvedSearchParams.q}</span>&rdquo;</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event as EventWithRelations} 
                  kategori={kategori} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {isFiltered ? 'Tidak Ditemukan' : 'Belum Ada Data'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {isFiltered 
                  ? "Tidak ada data yang sesuai dengan filter yang dipilih. Coba ubah kriteria pencarian Anda."
                  : `Belum ada ${kategori === 'info-lomba' ? 'lomba' : kategori === 'info-magang' ? 'magang' : 'lowongan'} yang tersedia saat ini.`
                }
              </p>
              {isFiltered && (
                <a
                  href={`/${kategori}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Hapus Semua Filter
                </a>
              )}
            </div>
          )}
        </main>
        
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}