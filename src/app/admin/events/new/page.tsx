import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminPageHeader from '../../components/AdminPageHeader';
import EventForm from '../components/EventForm';
import { Database } from '@/types/database';

export default async function NewEventPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  // FIX: Mengambil semua kolom ('*') agar tipe data sesuai dengan yang diharapkan EventForm
  const { data: organizers } = await supabase.from('organizers').select('*');
  const { data: levels } = await supabase.from('levels').select('*');
  const { data: fields } = await supabase.from('fields').select('*');

  return (
    <div>
      <AdminPageHeader title="Tambah Event Baru" buttonLabel="Kembali ke Daftar" buttonHref="/admin/events" />
      <EventForm 
        organizers={organizers || []} 
        levels={levels || []} 
        fields={fields || []} 
      />
    </div>
  );
}