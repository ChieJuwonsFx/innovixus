'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Database } from '@/types/database';
import { createEvent, updateEvent } from '../actions';
import SubmitButton from '../../components/SubmitButton';
import ImageUploader from './ImageUploader';
import { FormMessage } from '@/app/components/auth/FormMessage';

type Organizer = Database['public']['Tables']['organizers']['Row'];
type Level = Database['public']['Tables']['levels']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];

type EventWithRelations = Database['public']['Tables']['events']['Row'] & {
  event_levels?: { level_id: string }[];
  event_fields?: { field_id: string }[];
};

// Define proper type for poster images
interface PosterImage {
  id?: string;
  url: string;
  file?: File;
}

// Type guard to check if the poster data is valid
function isPosterImageArray(poster: unknown): poster is PosterImage[] {
  if (!Array.isArray(poster)) return false;
  return poster.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'url' in item && 
    typeof item.url === 'string'
  );
}

interface EventFormProps {
  event?: EventWithRelations;
  organizers: Pick<Organizer, 'id' | 'name'>[];
  levels: Level[];
  fields: Field[];
}

export default function EventForm({ event, organizers, levels, fields }: EventFormProps) {
  const router = useRouter();
  
  // Safely handle poster data conversion
  const getInitialPosterImages = (): PosterImage[] => {
    if (!event?.poster) return [];
    if (isPosterImageArray(event.poster)) return event.poster;
    return [];
  };
  
  const [posterImages, setPosterImages] = useState<PosterImage[]>(getInitialPosterImages());
  
  const action = event ? updateEvent.bind(null, event.id) : createEvent;
  
  const [state, formAction] = useActionState(action, null);
  
  useEffect(() => {
    if (state?.success) {
      alert(state.message);
      router.push('/admin/events');
    }
  }, [state, router]);

  const defaultLevelIds = new Set(event?.event_levels?.map(l => l.level_id));
  const defaultFieldIds = new Set(event?.event_fields?.map(f => f.field_id));

  const handleUploadSuccess = (images: PosterImage[]) => {
    setPosterImages(images);
  };

  return (
    <form action={formAction} className="space-y-8 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
      
      {state && !state.success && (
        <FormMessage type="error" message={state.message} />
      )}
      
      {event && <input type="hidden" name="id" value={event.id} />}
      
      {/* Hidden input for poster JSON */}
      <input type="hidden" name="poster_json" value={JSON.stringify(posterImages)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Judul Event</label>
          <input type="text" name="title" id="title" defaultValue={event?.title ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"/>
        </div>
        <div>
          <label htmlFor="kategori" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
          <select name="kategori" id="kategori" defaultValue={event?.kategori ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600">
            <option value="" disabled>Pilih Kategori</option>
            <option value="Info Lomba">Info Lomba</option>
            <option value="Info Magang">Info Magang</option>
            <option value="Info Loker">Info Loker</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi/Caption</label>
        <textarea name="caption" id="caption" rows={5} defaultValue={event?.caption ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="guidelink" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Link Panduan</label>
          <input type="url" name="guidelink" id="guidelink" defaultValue={event?.guidelink ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"/>
        </div>
        <div>
          <label htmlFor="registerlink" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Link Pendaftaran</label>
          <input type="url" name="registerlink" id="registerlink" defaultValue={event?.registerlink ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"/>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="open_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Buka</label>
            <input type="date" name="open_date" id="open_date" defaultValue={event?.open_date?.substring(0, 10) ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"/>
          </div>
          <div>
            <label htmlFor="close_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Tutup (Opsional)</label>
            <input type="date" name="close_date" id="close_date" defaultValue={event?.close_date?.substring(0, 10) ?? ''} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"/>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label htmlFor="organizer_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Penyelenggara</label>
          <select name="organizer_id" id="organizer_id" defaultValue={event?.organizer_id ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600">
            <option value="" disabled>Pilih Penyelenggara</option>
            {organizers.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="is_online" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipe</label>
          <select name="is_online" id="is_online" defaultValue={event?.is_online ?? 'Online'} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600">
             <option value="Online">Online</option>
             <option value="Offline">Offline</option>
             <option value="Online & Offline">Online & Offline</option>
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lokasi</label>
          <input type="text" name="location" id="location" defaultValue={event?.location ?? ''} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"/>
        </div>
        <div>
          <label htmlFor="is_free" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Biaya</label>
          <select name="is_free" id="is_free" defaultValue={event?.is_free?.toString() ?? 'false'} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600">
             <option value="false">Berbayar</option>
             <option value="true">Gratis</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status Publikasi</label>
        <select name="status" id="status" defaultValue={event?.status ?? 'Success'} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600">
           <option value="Success">Publikasikan (Success)</option>
           <option value="Pending">Simpan sebagai Draft (Pending)</option>
           <option value="Canceled">Batalkan (Canceled)</option>
        </select>
      </div>
      
      <ImageUploader 
        existingImages={posterImages} 
        onUploadSuccess={handleUploadSuccess}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bidang</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-slate-600">
            {fields.map(field => (
              <label key={field.id} className="flex items-center gap-2">
                <input type="checkbox" name="field_ids" value={field.id} defaultChecked={defaultFieldIds.has(field.id)} className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-600 dark:border-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{field.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenjang/Pendidikan</h3>
           <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-slate-600">
            {levels.map(level => (
              <label key={level.id} className="flex items-center gap-2">
                <input type="checkbox" name="level_ids" value={level.id} defaultChecked={defaultLevelIds.has(level.id)} className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-600 dark:border-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{level.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
        <SubmitButton label={event ? "Perbarui Event" : "Simpan Event"} loadingLabel="Menyimpan..." />
      </div>
    </form>
  );
}