import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminPageHeader from '../../components/AdminPageHeader';
import EventForm from '../components/EventForm';
import { Database } from '@/types/database';
import { notFound } from 'next/navigation';

type EditEventPageProps = {
  params: Promise<{ id: string }>
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params; // karena params adalah Promise

  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: event } = await supabase
    .from('events')
    .select('*, event_levels(level_id), event_fields(field_id)')
    .eq('id', id)
    .single();

  if (!event) {
    notFound();
  }

  const { data: organizers } = await supabase.from('organizers').select('*');
  const { data: levels } = await supabase.from('levels').select('*');
  const { data: fields } = await supabase.from('fields').select('*');

  return (
    <div>
      <AdminPageHeader
        title="Edit Event"
        buttonLabel="Kembali ke Daftar"
        buttonHref="/admin/events"
      />
      <EventForm
        event={event}
        organizers={organizers || []}
        levels={levels || []}
        fields={fields || []}
      />
    </div>
  );
}
