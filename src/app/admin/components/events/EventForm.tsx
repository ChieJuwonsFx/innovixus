'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; 
import { Database } from '@/types/database';
import { createEvent, updateEvent } from '../../events/actions';
import { FormMessage } from '@/app/components/auth/FormMessage';
import ImageUploader from './ImageUploader';

import SubmitButton from './form/SubmitButton';
import BasicInfoSection from './form/BasicInfoSection';
import DateInfoSection from './form/DateInfoSection';
import EventDetailsSection from './form/EventDetailsSection';
import PublicationStatusSection from './form/PublicationStatusSection';
import TargetAudienceSection from './form/TargetAudienceSection';

type Organizer = Database['public']['Tables']['organizers']['Row'];
type Level = Database['public']['Tables']['levels']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];
type EventStatus = 'Pending' | 'Success' | 'Canceled';
type EventRow = Database['public']['Tables']['events']['Row'];
export type EventWithRelations = Omit<EventRow, 'status'> & {
  status: EventStatus | null; 
  event_levels?: { level_id: string }[];
  event_fields?: { field_id: string }[];
};
interface PosterImage { id?: string; url: string; file?: File; }

interface EventFormProps {
  event?: EventWithRelations;
  organizers: Pick<Organizer, 'id' | 'name' | 'instagram'>[];
  levels: Level[];
  fields: Field[];
  asChild?: boolean;
}

function isPosterImageArray(poster: unknown): poster is PosterImage[] {
  if (!Array.isArray(poster)) return false;
  return poster.every(item => typeof item === 'object' && item !== null && 'url' in item && typeof item.url === 'string');
}

const formInputStyle = "block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors px-3 py-2.5 text-sm";

export default function EventForm({ event, organizers, levels, fields, asChild = false }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  
  const [existingImages, setExistingImages] = useState<PosterImage[]>(() => {
    if (event?.poster && isPosterImageArray(event.poster)) return event.poster;
    return [];
  });
  
  const [selectedKategori, setSelectedKategori] = useState(event?.kategori ?? '');
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [state, formAction] = useActionState(event ? updateEvent.bind(null, event.id) : createEvent, null);

  useEffect(() => {
    if (state && state.message) {
      setIsSubmitting(false);
      
      if (state.success) {
        toast.success(state.message);
        
        if (!asChild) {
          router.push('/admin/events');
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router, asChild]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const uploadedUrls: string[] = [];
      
      if (newImageFiles.length > 0) {
        const uploadToast = toast.loading('Menyimpan data...');
        
        try {
          const uploadPromises = newImageFiles.map(async (file) => {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('folder', 'event-posters');
            
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              body: uploadFormData,
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Gagal mengupload ${file.name}`);
            }
            
            const data = await response.json();
            return data.url;
          });
          
          const urls = await Promise.all(uploadPromises);
          uploadedUrls.push(...urls);
          
          toast.dismiss(uploadToast);
        } catch (error) {
          toast.dismiss(uploadToast);
          throw error;
        }
      }
      
      const allImages = [
        ...existingImages.map(img => ({ url: img.url })),
        ...uploadedUrls.map(url => ({ url }))
      ];
      
      formData.set('poster_json', JSON.stringify(allImages));
      
      startTransition(() => {
        formAction(formData);
      });
      
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan event');
    }
  };

  const FormContent = (
    <>
      {state && !state.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <FormMessage type="error" message={state.message} />
        </div>
      )}
      {dateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400 text-sm">{dateError}</p>
        </div>
      )}
      
      {event && <input type="hidden" name="id" value={event.id} />}

      <BasicInfoSection 
        event={event} 
        selectedKategori={selectedKategori} 
        onKategoriChange={setSelectedKategori} 
        formInputStyle={formInputStyle} 
      />
      <DateInfoSection 
        event={event} 
        onDateError={setDateError} 
        formInputStyle={formInputStyle} 
      />
      <EventDetailsSection 
        event={event} 
        organizers={organizers} 
        formInputStyle={formInputStyle}
        selectedKategori={selectedKategori}
      />
      {!asChild && (
        <PublicationStatusSection 
          event={event} 
          formInputStyle={formInputStyle} 
        />
      )}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-brand">
          Media Event
        </h2>
        <ImageUploader 
          existingImages={existingImages}
          onFilesChange={setNewImageFiles}
          onExistingImagesChange={setExistingImages}
        />
      </div>
      <TargetAudienceSection 
        event={event}
        initialFields={fields}
        initialLevels={levels}
        selectedKategori={selectedKategori}
      />
      {!asChild && (
        <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
          <SubmitButton 
            label={event ? 'Perbarui Event' : 'Buat Event'}
            loadingLabel={event ? 'Memperbarui...' : 'Membuat...'} 
            disabled={isSubmitting || isPending}
          />
        </div>
      )}
    </>
  );

  if (asChild) {
    return FormContent;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <form 
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >
        {FormContent}
      </form>
    </div>
  );
}