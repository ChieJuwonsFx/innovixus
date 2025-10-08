'use client';

import { Database } from '@/types/database';

type Organizer = Database['public']['Tables']['organizers']['Row'];

interface EventDetailsSectionProps {
  event?: {
    organizer_id?: string | null;
    is_online?: string | null;
    location?: string | null;
    is_free?: boolean | null;
  };
  organizers: Pick<Organizer, 'id' | 'name'>[];
  formInputStyle: string;
}

export default function EventDetailsSection({ event, organizers, formInputStyle }: EventDetailsSectionProps) {
  return (
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
  );
}