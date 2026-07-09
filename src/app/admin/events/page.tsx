import { createClient } from '@/lib/supabase/server';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminEventCard from '../components/events/AdminEventCard';
import { CirclePlus } from "lucide-react";

const PAGE_SIZE = 50;

export default async function EventsPage(props: { searchParams?: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*, organizers(name, instagram)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching events:', error);
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Event"
        buttonLabel="Tambah Event Baru"
        buttonHref="/admin/events/new"
        description='Halaman Event Admin'
        icon={CirclePlus}
      />
     
      {events && events.length > 0 ? (
        <div className="overflow-x-auto border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 w-16"></th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="hidden px-4 py-3 lg:table-cell">Organizer</th>
                <th className="hidden px-4 py-3 sm:table-cell">Batas</th>
                <th className="hidden px-4 py-3 sm:table-cell">Lokasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.map((event) => (
                <AdminEventCard key={event.id} event={event} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-400">Belum ada event.</p>
        </div>
      )}
    </div>
  );
}