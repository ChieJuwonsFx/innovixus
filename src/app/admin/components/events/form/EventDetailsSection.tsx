'use client';

import { useState, useRef, useEffect } from 'react';
import { Database } from '@/types/database';
import { Search, ChevronDown, Check, Plus, Loader2 } from 'lucide-react';
import { quickCreateOrganizer } from '@/app/admin/organizers/actions';

type Organizer = Database['public']['Tables']['organizers']['Row'];

interface EventDetailsSectionProps {
  event?: {
    organizer_id?: string | null;
    is_online?: string | null;
    location?: string | null;
    is_free?: boolean | null;
  };
  organizers: Pick<Organizer, 'id' | 'name' | 'instagram'>[];
  formInputStyle: string;
  selectedKategori?: string;
  autofillOrganizerId?: string | null;
}

export default function EventDetailsSection({ event, organizers: initialOrganizers, formInputStyle, selectedKategori, autofillOrganizerId }: EventDetailsSectionProps) {
  const [organizers, setOrganizers] = useState(initialOrganizers);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>(event?.organizer_id ?? '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIg, setNewIg] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const filteredOrganizers = organizers.filter(org => {
    const q = searchQuery.toLowerCase();
    return (org.name?.toLowerCase() || '').includes(q) || (org.instagram?.toLowerCase() || '').includes(q);
  });

  const selectedOrg = organizers.find(org => org.id === selectedOrganizer);
  const selectedOrgName = selectedOrg?.name || selectedOrg?.instagram || 'Pilih Penyelenggara';

  useEffect(() => {
    setOrganizers(initialOrganizers);
  }, [initialOrganizers]);

  useEffect(() => {
    if (autofillOrganizerId) setSelectedOrganizer(autofillOrganizerId);
  }, [autofillOrganizerId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current && !showAddForm) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showAddForm]);

  useEffect(() => {
    if (showAddForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showAddForm]);

  const handleSelectOrganizer = (orgId: string) => {
    setSelectedOrganizer(orgId);
    setIsOpen(false);
    setSearchQuery('');
    setShowAddForm(false);
  };

  const handleQuickCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const result = await quickCreateOrganizer(newName.trim(), newIg.trim() || null);
      const newOrg = { id: result.id, name: result.name, instagram: result.instagram };
      setOrganizers(prev => [...prev, newOrg]);
      setSelectedOrganizer(result.id);
      setIsOpen(false);
      setShowAddForm(false);
      setNewName('');
      setNewIg('');
    } catch {
      // error handled by server action throw
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-brand">
        Detail Event
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-3">
          <label htmlFor="organizer_id" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
              className={`${formInputStyle} text-left flex items-center justify-between ${
                !selectedOrganizer ? 'text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              <span className="truncate">{selectedOrgName}</span>
              <ChevronDown 
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isOpen && !showAddForm && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-80 overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari penyelenggara..."
                      className="w-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                </div>

                <div className="overflow-y-auto max-h-48">
                  {filteredOrganizers.length > 0 ? (
                    filteredOrganizers.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => handleSelectOrganizer(org.id)}
                        className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedOrganizer === org.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <span className="truncate">{org.name || org.instagram}</span>
                        {selectedOrganizer === org.id && (
                          <Check className="w-5 h-5 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Tidak ada hasil</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 p-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowAddForm(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Penyelenggara
                  </button>
                </div>
              </div>
            )}

            {isOpen && showAddForm && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Tambah Penyelenggara Baru</h4>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama *"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                  <input
                    type="text"
                    value={newIg}
                    onChange={(e) => setNewIg(e.target.value)}
                    placeholder="Instagram (opsional)"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setNewName(''); setNewIg(''); }}
                    className="flex-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickCreate}
                    disabled={!newName.trim() || isCreating}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <label htmlFor="is_online" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
          <label htmlFor="location" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Lokasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            id="location"
            defaultValue={event?.location ?? ''}
            required
            className={formInputStyle}
            placeholder="Nama tempat/kota"
          />
        </div>
        
        {selectedKategori === 'Info Lomba' && (
        <div className="space-y-3">
          <label htmlFor="is_free" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Biaya
          </label>
          <select
            name="is_free"
            id="is_free"
            defaultValue={event?.is_free?.toString() ?? 'false'}
            className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
          >
            <option value="false">Berbayar</option>
            <option value="true">Gratis</option>
          </select>
        </div>
        )}
      </div>
    </div>
  );
}