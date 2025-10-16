'use client';

import { useState, useRef, useEffect } from 'react';
import { Database } from '@/types/database';
import { Search, ChevronDown, Check } from 'lucide-react';

type Organizer = Database['public']['Tables']['organizers']['Row'];

interface EventDetailsSectionProps {
  event?: {
    organizer_id?: string | null;
    is_online?: string | null;
    location?: string | null;
    is_free?: boolean | null;
  };
  organizers: Pick<Organizer, 'id' | 'instagram'>[];
  formInputStyle: string;
}

export default function EventDetailsSection({ event, organizers, formInputStyle }: EventDetailsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>(event?.organizer_id ?? '');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOrganizers = organizers.filter(org =>
    org.instagram.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOrgName = organizers.find(org => org.id === selectedOrganizer)?.instagram || 'Pilih Penyelenggara';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectOrganizer = (orgId: string) => {
    setSelectedOrganizer(orgId);
    setIsOpen(false);
    setSearchQuery('');
  };

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
          
          <input
            type="hidden"
            name="organizer_id"
            id="organizer_id"
            value={selectedOrganizer}
            required
          />

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`${formInputStyle} w-full px-4 py-3 text-base text-left flex items-center justify-between ${
                !selectedOrganizer ? 'text-gray-400 dark:text-gray-500' : ''
              }`}
            >
              <span className="truncate">{selectedOrgName}</span>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari penyelenggara..."
                      className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                </div>

                <div className="overflow-y-auto max-h-64">
                  {filteredOrganizers.length > 0 ? (
                    filteredOrganizers.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => handleSelectOrganizer(org.id)}
                        className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedOrganizer === org.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <span className="truncate">{org.instagram}</span>
                        {selectedOrganizer === org.id && (
                          <Check className="w-5 h-5 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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