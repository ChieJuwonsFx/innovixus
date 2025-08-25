'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import React from 'react';

import { Database } from '@/types/database';
import { createEvent, updateEvent } from '../../events/actions';
import ImageUploader from './ImageUploader';
import { FormMessage } from '@/app/components/auth/FormMessage';

type Organizer = Database['public']['Tables']['organizers']['Row'];
type Level = Database['public']['Tables']['levels']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];

type EventWithRelations = Database['public']['Tables']['events']['Row'] & {
  event_levels?: { level_id: string }[];
  event_fields?: { field_id: string }[];
};

interface PosterImage {
  id?: string;
  url: string;
  file?: File;
}

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

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

const formInputStyle = "block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";

export default function EventForm({ event, organizers, levels, fields }: EventFormProps) {
  const router = useRouter();
  const [openDate, setOpenDate] = useState(event?.open_date?.substring(0, 10) ?? '');
  const [closeDate, setCloseDate] = useState(event?.close_date?.substring(0, 10) ?? '');
  const [dateError, setDateError] = useState('');
  const [showExtendDate, setShowExtendDate] = useState(false);
  const [extendDate, setExtendDate] = useState(event?.extend_date?.substring(0, 10) ?? '');
  
  const [selectedKategori, setSelectedKategori] = useState(event?.kategori ?? '');
  const [filteredFields, setFilteredFields] = useState<Field[]>(fields);

  useEffect(() => {
    if (selectedKategori === 'Info Lomba') {
      setFilteredFields(fields);
    } else if (selectedKategori) {
      setFilteredFields(fields.filter(field => !field.only_lomba));
    } else {
      setFilteredFields(fields);
    }
  }, [selectedKategori, fields]);

  useEffect(() => {
    if (event?.extend_date) {
      setShowExtendDate(true);
    }
  }, [event]);

  React.useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.setAttribute('lang', 'id-ID');
    });
  }, []);
 
  const getInitialPosterImages = (): PosterImage[] => {
    if (!event?.poster) return [];
    if (isPosterImageArray(event.poster)) return event.poster;
    return [];
  };
 
  const [posterImages, setPosterImages] = useState<PosterImage[]>(getInitialPosterImages());
 
  const action = event ? updateEvent.bind(null, event.id) : createEvent;
 
  const [state, formAction] = useActionState(action, null);

  const validateDates = (openDateValue: string, closeDateValue: string) => {
    if (!openDateValue || !closeDateValue) {
      setDateError('');
      return true;
    }
    const openDateTime = new Date(openDateValue);
    const closeDateTime = new Date(closeDateValue);
    if (closeDateTime < openDateTime) {
      setDateError('Tanggal tutup tidak boleh lebih awal dari tanggal buka');
      return false;
    }
    setDateError('');
    return true;
  };

  const handleOpenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpenDate = e.target.value;
    setOpenDate(newOpenDate);
    validateDates(newOpenDate, closeDate);
  };

  const handleCloseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCloseDate = e.target.value;
    setCloseDate(newCloseDate);
    validateDates(openDate, newCloseDate);
  };

  const handleExtendDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExtendDate = e.target.value;
    setExtendDate(newExtendDate);
  };
 
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
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
      <form action={formAction} className="p-8 space-y-8">
        
        {state && !state.success && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <FormMessage type="error" message={state.message} />
          </div>
        )}

        {dateError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{dateError}</p>
          </div>
        )}
        
        {event && <input type="hidden" name="id" value={event.id} />}
        
        <input type="hidden" name="poster_json" value={JSON.stringify(posterImages)} />

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Informasi Dasar
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Judul Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={event?.title ?? ''}
                required
                className={`${formInputStyle} px-4 py-3 text-base`}
                placeholder="Masukkan judul event"
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="kategori" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="kategori"
                id="kategori"
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                required
                className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
              >
                <option value="" disabled>Pilih Kategori</option>
                <option value="Info Lomba">Info Lomba</option>
                <option value="Info Magang">Info Magang</option>
                <option value="Info Loker">Info Loker</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <label htmlFor="caption" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Deskripsi/Caption <span className="text-red-500">*</span>
            </label>
            <textarea
              name="caption"
              id="caption"
              rows={6}
              defaultValue={event?.caption ?? ''}
              required
              className={`${formInputStyle} px-4 py-3 resize-y text-base`}
              placeholder="Deskripsikan event secara detail..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="guidelink" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Link Panduan <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="guidelink"
                id="guidelink"
                defaultValue={event?.guidelink ?? ''}
                required
                className={`${formInputStyle} px-4 py-3 text-base`}
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="registerlink" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Link Pendaftaran <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="registerlink"
                id="registerlink"
                defaultValue={event?.registerlink ?? ''}
                required
                className={`${formInputStyle} px-4 py-3 text-base`}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Informasi Tanggal
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="open_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Buka <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="open_date"
                id="open_date"
                value={openDate}
                onChange={handleOpenDateChange}
                max={closeDate || undefined}
                required
                lang="id-ID"
                className={`${formInputStyle} px-4 py-3 text-base [color-scheme:light] dark:[color-scheme:dark] ${!openDate ? 'text-gray-400 dark:text-gray-500' : ''}`}
                placeholder="dd/mm/yyyy"
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="close_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Tutup <span className="text-gray-400 text-xs">(Opsional)</span>
              </label>
              <input
                type="date"
                name="close_date"
                id="close_date"
                value={closeDate}
                onChange={handleCloseDateChange}
                min={openDate || undefined}
                lang="id-ID"
                className={`${formInputStyle} px-4 py-3 text-base [color-scheme:light] dark:[color-scheme:dark] ${!closeDate ? 'text-gray-400 dark:text-gray-500' : ''}`}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Perpanjangan Tanggal
              </h3>
              <button
                type="button"
                onClick={() => setShowExtendDate(!showExtendDate)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showExtendDate 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                }`}
              >
                {showExtendDate ? 'Tutup Extend' : 'Tambah Extend'}
              </button>
            </div>
            
            {showExtendDate && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="space-y-3">
                  <label htmlFor="extend_date" className="block text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Tanggal Perpanjangan
                  </label>
                  <input
                    type="date"
                    name="extend_date"
                    id="extend_date"
                    value={extendDate}
                    onChange={handleExtendDateChange}
                    min={closeDate || openDate || undefined}
                    lang="id-ID"
                    className={`${formInputStyle} px-4 py-3 text-base [color-scheme:light] dark:[color-scheme:dark] ${!extendDate ? 'text-gray-400 dark:text-gray-500' : ''}`}
                    placeholder="dd/mm/yyyy"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Tanggal perpanjangan harus setelah tanggal tutup atau tanggal buka. Kosongkan jika tidak ada.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Detail Event
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="space-y-3">
              <label htmlFor="organizer_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Penyelenggara <span className="text-red-500">*</span>
              </label>
              <select
                name="organizer_id"
                id="organizer_id"
                defaultValue={event?.organizer_id ?? ''}
                required
                className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
              >
                <option value="" disabled>Pilih Penyelenggara</option>
                {organizers.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="is_online" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tipe Event <span className="text-red-500">*</span>
              </label>
              <select
                name="is_online"
                id="is_online"
                defaultValue={event?.is_online ?? 'Online'}
                required
                className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Online & Offline">Hybrid</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                id="location"
                defaultValue={event?.location ?? ''}
                required
                className={`${formInputStyle} px-4 py-3 text-base`}
                placeholder="Nama tempat/kota"
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="is_free" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Biaya <span className="text-red-500">*</span>
              </label>
              <select
                name="is_free"
                id="is_free"
                defaultValue={event?.is_free?.toString() ?? 'false'}
                required
                className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
              >
                <option value="false">Berbayar</option>
                <option value="true">Gratis</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Status Publikasi
          </h2>
          
          <div className="space-y-3 max-w-md">
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              id="status"
              defaultValue={event?.status ?? 'Success'}
              required
              className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
            >
              <option value="Success">Publikasikan (Success)</option>
              <option value="Pending">Simpan sebagai Draft (Pending)</option>
              <option value="Canceled">Batalkan (Canceled)</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Media Event
          </h2>
          
          <ImageUploader
            existingImages={posterImages}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Target Peserta
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Bidang
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-h-80 overflow-y-auto border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="space-y-3">
                  {filteredFields.map(field => (
                    <label key={field.id} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="field_ids"
                          value={field.id}
                          defaultChecked={defaultFieldIds.has(field.id)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </div>
                      <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {field.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Level
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-h-80 overflow-y-auto border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="space-y-3">
                  {levels.map(level => (
                    <label key={level.id} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="level_ids"
                          value={level.id}
                          defaultChecked={defaultLevelIds.has(level.id)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </div>
                      <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {level.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <SubmitButton 
            label={event ? 'Perbarui Event' : 'Buat Event'}
            loadingLabel={event ? 'Memperbarui...' : 'Membuat...'} 
          />
        </div>
      </form>
    </div>
  );
}
