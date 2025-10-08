import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminEventCard from '../components/events/AdminEventCard';
import { CirclePlus } from "lucide-react";

export default async function EventsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerComponentClient<any>({ cookies });
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*, organizers(name)')
    .order('created_at', { ascending: false });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <AdminEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <p className="text-slate-500">Belum ada event yang ditambahkan.</p>
        </div>
      )}
    </div>
  );
}