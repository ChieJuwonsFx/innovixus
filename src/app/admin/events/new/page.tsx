import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminPageHeader from '../../components/AdminPageHeader';
import EventForm from '../components/EventForm';
import { Database } from '@/types/database';
import { CircleArrowLeft } from "lucide-react";

export default async function NewEventPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: organizers } = await supabase.from('organizers').select('*');
  const { data: levels } = await supabase.from('levels').select('*');
  const { data: fields } = await supabase.from('fields').select('*');

  return (
    <div>
      <AdminPageHeader title="Tambah Event Baru" buttonLabel="Kembali ke Daftar" buttonHref="/admin/events" description='Silahkan Tambahkan Data Event Baru' icon={CircleArrowLeft}/>
      <EventForm 
        organizers={organizers || []} 
        levels={levels || []} 
        fields={fields || []} 
      />
    </div>
  );
}