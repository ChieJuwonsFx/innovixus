'use client';

import { Database } from '@/types/database';
import EventForm, { EventWithRelations } from '@/app/admin/components/events/EventForm';

type Package = Database['public']['Tables']['packages']['Row'];
type Organizer = Database['public']['Tables']['organizers']['Row'];
type Level = Database['public']['Tables']['levels']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];

type KategoriEnum = Database['public']['Tables']['events']['Row']['kategori'];
type IsOnlineEnum = Database['public']['Tables']['events']['Row']['is_online'];

type EventData = Omit<Database['public']['Tables']['events']['Insert'], 'id' | 'organizer_id' | 'user_id' | 'status' | 'partnership_id'>;

interface Step2Props {
  onNext: (data: EventData) => void;
  onBack: () => void;
  selectedPackage: Package;
  initialData: EventData | null;
  organizers: Pick<Organizer, 'id' | 'name' | 'instagram'>[];
  levels: Level[];
  fields: Field[];
  preselectedOrganizerId: string;
}

export default function Step2_EventForm({ onNext, onBack, initialData, ...eventFormProps }: Step2Props) {
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get('title') as string;
    if (!title) {
        alert('Judul event wajib diisi.');
        return;
    }

    const isFreeRaw = formData.get('is_free');
    const isFreeVal = isFreeRaw !== null ? isFreeRaw === 'true' : null;

    const eventData: EventData = {
      title: title,
      caption: formData.get('caption') as string,
      guidelink: (formData.get('guidelink') as string) || null,
      registerlink: (formData.get('registerlink') as string) || null,
      open_date: (formData.get('open_date') as string) || null,
      close_date: (formData.get('close_date') as string) || null,
      kategori: formData.get('kategori') as KategoriEnum,
      is_online: formData.get('is_online') as IsOnlineEnum,
      location: formData.get('location') as string,
      is_free: isFreeVal,
      poster: JSON.parse(formData.get('poster_json') as string || '[]'),
    };
    
    onNext(eventData);
  };

  const prefillEvent = initialData ? {
    ...initialData,
    organizer_id: eventFormProps.preselectedOrganizerId
  } : {
    organizer_id: eventFormProps.preselectedOrganizerId
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Detail Event</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Isi semua informasi yang dibutuhkan untuk event Anda.
      </p>
      
      <form onSubmit={handleSubmit}>
        <EventForm
          {...eventFormProps}
          event={prefillEvent as EventWithRelations} 
          asChild 
        />
        
        <div className="flex justify-between mt-8">
          <button 
            type="button" 
            onClick={onBack} 
            className="bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Kembali
          </button>
          <button 
            type="submit" 
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lanjut ke Review
          </button>
        </div>
      </form>
    </div>
  );
}