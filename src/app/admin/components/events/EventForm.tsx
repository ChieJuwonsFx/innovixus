'use client';

import { useActionState, useEffect, useState, useTransition, useRef, useCallback } from 'react';
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
  const formRef = useRef<HTMLFormElement>(null);
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  
  const [existingImages, setExistingImages] = useState<PosterImage[]>(() => {
    if (event?.poster && isPosterImageArray(event.poster)) return event.poster;
    return [];
  });
  
  const [selectedKategori, setSelectedKategori] = useState(event?.kategori ?? '');
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [autofillFieldIds, setAutofillFieldIds] = useState<string[]>([]);
  const [autofillLevelIds, setAutofillLevelIds] = useState<string[]>([]);
  const [autofillOrganizerId, setAutofillOrganizerId] = useState<string | null>(null);
  const [extraOrganizers, setExtraOrganizers] = useState<Array<Pick<Organizer, 'id' | 'name' | 'instagram'>>>([]);

  const handleAutofill = useCallback(async (caption: string) => {
    if (!caption.trim()) return;
    setIsAiLoading(true);
    setAutofillFieldIds([]);
    setAutofillLevelIds([]);
    try {
      const res = await fetch('/api/ai/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption })
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const d = json.data;
      const el = formRef.current?.elements as unknown as Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
      const set = (name: string, val: string | null) => {
        const input = el[name];
        if (input && val != null) {
          if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
            input.value = val;
          } else if ('value' in input) {
            (input as HTMLSelectElement).value = val;
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      d.title && set('title', d.title);
      d.kategori && set('kategori', d.kategori);
      if (d.kategori) setSelectedKategori(d.kategori);
      d.caption && set('caption', d.caption);
      d.guidelink && set('guidelink', d.guidelink);
      d.registerlink && set('registerlink', d.registerlink);
      d.open_date && set('open_date', d.open_date);
      d.close_date && set('close_date', d.close_date);
      d.is_online && set('is_online', d.is_online);
      d.location && set('location', d.location);
      if (d.is_free != null) set('is_free', String(d.is_free));

      if (d.organizer_id) {
        if (typeof d.organizer_id === 'string') {
          el['organizer_id'].value = d.organizer_id;
          el['organizer_id'].dispatchEvent(new Event('change', { bubbles: true }));
          setAutofillOrganizerId(d.organizer_id);
          if (!organizers.find(o => o.id === d.organizer_id)) {
            const { getOrganizer } = await import('@/app/admin/organizers/actions');
            const org = await getOrganizer(d.organizer_id);
            if (org) setExtraOrganizers(prev => [...prev, { id: org.id, name: org.name, instagram: org.instagram }]);
          }
        }
      } else if (d.organizer_name) {
        const match = organizers.find(o => o.name?.toLowerCase() === d.organizer_name.toLowerCase() || o.instagram?.toLowerCase() === d.organizer_name.toLowerCase());
        let orgId: string;
        if (match) {
          orgId = match.id;
        } else {
          const result = await (await import('@/app/admin/organizers/actions')).quickCreateOrganizer(d.organizer_name, d.organizer_instagram || null);
          orgId = result.id;
          setExtraOrganizers(prev => [...prev, { id: result.id, name: result.name, instagram: result.instagram }]);
        }
        el['organizer_id'].value = orgId;
        el['organizer_id'].dispatchEvent(new Event('change', { bubbles: true }));
        setAutofillOrganizerId(orgId);
      }

      if (d.field_ids?.length) {
        setAutofillFieldIds(d.field_ids.filter((id: string) => fields.some(f => f.id === id)));
      } else if (d.field_names?.length) {
        const newIds: string[] = [];
        for (const name of d.field_names) {
          const existing = fields.find(f => f.name.toLowerCase() === name.toLowerCase());
          if (existing) {
            newIds.push(existing.id);
          } else {
            try {
              const { createField } = await import('@/app/admin/fields/actions');
              const formData = new FormData();
              formData.append('name', name);
              formData.append('only_lomba', String(d.kategori === 'Info Lomba'));
              await createField(formData);
              await new Promise(r => setTimeout(r, 200));
              const { getFields } = await import('@/app/admin/fields/actions');
              const updated = await getFields();
              const created = updated.find((f: { name: string }) => f.name.toLowerCase() === name.toLowerCase());
              if (created) newIds.push(created.id);
            } catch {}
          }
        }
        if (newIds.length) setAutofillFieldIds(newIds);
      }

      if (d.level_ids?.length) {
        setAutofillLevelIds(d.level_ids.filter((id: string) => levels.some(l => l.id === id)));
      } else if (d.level_names?.length) {
        const newIds: string[] = [];
        for (const name of d.level_names) {
          const existing = levels.find(l => l.name.toLowerCase() === name.toLowerCase());
          if (existing) {
            newIds.push(existing.id);
          } else {
            try {
              const { createLevel } = await import('@/app/admin/levels/actions');
              const formData = new FormData();
              formData.append('name', name);
              await createLevel(formData);
              await new Promise(r => setTimeout(r, 200));
              const { getLevels } = await import('@/app/admin/levels/actions');
              const updated = await getLevels();
              const created = updated.find((l: { name: string }) => l.name.toLowerCase() === name.toLowerCase());
              if (created) newIds.push(created.id);
            } catch {}
          }
        }
        if (newIds.length) setAutofillLevelIds(newIds);
      }

      toast.success('Form terisi otomatis!');
    } catch (e) {
      toast.error('Gagal auto-fill: ' + (e instanceof Error ? e.message : 'Unknown'));
    } finally {
      setIsAiLoading(false);
    }
  }, [organizers, fields, levels]);
  
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
              throw new Error(await response.text());
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
        onAutofill={handleAutofill}
        isAiLoading={isAiLoading}
      />
      <DateInfoSection 
        event={event} 
        onDateError={setDateError} 
        formInputStyle={formInputStyle} 
      />
      <EventDetailsSection 
        event={event} 
        organizers={[...organizers, ...extraOrganizers]} 
        formInputStyle={formInputStyle}
        selectedKategori={selectedKategori}
        autofillOrganizerId={autofillOrganizerId}
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
          onExistingImagesChange={useCallback((imgs: { url: string; id?: string }[]) => setExistingImages(imgs.map(img => ({ url: img.url, id: img.id }))), [])}
        />
      </div>
      <TargetAudienceSection 
        event={event}
        initialFields={fields}
        initialLevels={levels}
        selectedKategori={selectedKategori}
        autofillFieldIds={autofillFieldIds}
        autofillLevelIds={autofillLevelIds}
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
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >
        {FormContent}
      </form>
    </div>
  );
}