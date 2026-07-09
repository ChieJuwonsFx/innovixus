'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Combobox } from '@headlessui/react';
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react';
import { Database } from '@/types/database';

type Level = Database['public']['Tables']['levels']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];

interface FilterProps {
  levels: Level[];
  fields: Field[];
  kategori: string;
}

export default function EventFilters({ levels, fields, kategori }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedBidang, setSelectedBidang] = useState('');
  const [selectedTipe, setSelectedTipe] = useState('');
  const [selectedGratis, setSelectedGratis] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [levelQuery, setLevelQuery] = useState('');
  const [bidangQuery, setBidangQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setSearchTerm(searchParams.get('q') || '');
    setSelectedLevel(searchParams.get('level') || '');
    setSelectedBidang(searchParams.get('bidang') || '');
    setSelectedTipe(searchParams.get('tipe') || '');
    setSelectedGratis(searchParams.get('gratis') || '');
  }, [searchParams]);

  const handleSearch = useCallback(async (immediate = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (!immediate) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      const params = new URLSearchParams();
      
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      }

      if (selectedLevel) {
        params.set('level', selectedLevel);
      }

      if (selectedBidang) {
        params.set('bidang', selectedBidang);
      }

      if (selectedTipe) {
        params.set('tipe', selectedTipe);
      }

      if (selectedGratis) {
        params.set('gratis', selectedGratis);
      }
      
      params.set('page', '1');
      
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      
      router.replace(url, { scroll: false });
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedLevel, selectedBidang, selectedTipe, selectedGratis, pathname, router, isLoading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSearch(true);
    }
  };

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    switch (filterType) {
      case 'level': setSelectedLevel(value); break;
      case 'bidang': setSelectedBidang(value); break;
      case 'tipe': setSelectedTipe(value); break;
      case 'gratis': setSelectedGratis(value); break;
    }
  }, []);

  const applyFilters = useCallback(() => {
    handleSearch(true);
  }, [handleSearch]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedLevel('');
    setSelectedBidang('');
    setSelectedTipe('');
    setSelectedGratis('');
    
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters = !!(
    searchParams.get('q') || 
    searchParams.get('level') || 
    searchParams.get('bidang') || 
    searchParams.get('tipe') || 
    searchParams.get('gratis')
  );

  const getLabelText = () => {
    switch (kategori) {
      case 'info-lomba':
        return { 
          level: 'Jenjang', 
          bidang: 'Bidang Lomba', 
          placeholder: 'Cari nama lomba...', 
          title: 'Filter Lomba' 
        };
      case 'info-magang':
        return { 
          level: 'Pendidikan', 
          bidang: 'Bidang Pekerjaan', 
          placeholder: 'Cari program magang...', 
          title: 'Filter Magang' 
        };
      case 'info-loker':
        return { 
          level: 'Pendidikan', 
          bidang: 'Bidang Pekerjaan', 
          placeholder: 'Cari lowongan kerja...', 
          title: 'Filter Lowongan' 
        };
      default:
        return { 
          level: 'Level', 
          bidang: 'Bidang', 
          placeholder: 'Cari...', 
          title: 'Filter' 
        };
    }
  };

  const labels = getLabelText();

  const displayFields = kategori !== 'info-lomba' ? fields.filter(f => f.only_lomba === false) : fields;

  const filteredLevels = useMemo(() =>
    levelQuery ? levels.filter(l => l.name.toLowerCase().includes(levelQuery.toLowerCase())) : levels
  , [levels, levelQuery]);

  const filteredBidang = useMemo(() =>
    bidangQuery ? displayFields.filter(f => f.name.toLowerCase().includes(bidangQuery.toLowerCase())) : displayFields
  , [displayFields, bidangQuery]);

  const selectClasses = `w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-no-repeat bg-[url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22currentColor%22%3e%3cpath%20fill-rule%3d%22evenodd%22%20d%3d%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3d%22evenodd%22%20/%3e%3c/svg%3e')] bg-[position:right_0.75rem_center] bg-[size:1.25em]`;

  if (!isMounted) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1"></div>
            <div className="flex gap-3">
              <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-12 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm disabled:opacity-50"
              autoComplete="off"
              data-form-type="other"
            />
          </div>
            <div className="flex gap-3">
              {isFilterExpanded ? (
                <button
                  onClick={() => applyFilters()}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
                  type="button"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terapkan'}
                </button>
              ) : (
                <button
                  onClick={() => handleSearch(true)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
                  type="button"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cari'}
                </button>
              )}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
              type="button"
            >
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              <span className="hidden sm:inline text-sm">Filter</span>
              <ChevronDown 
                className={`h-4 w-4 text-gray-500 dark:text-gray-300 transition-transform duration-200 ${
                  isFilterExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {isFilterExpanded && (
        <div>
          <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {labels.title}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
                Hapus Semua Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {labels.level}
              </label>
              <Combobox
                value={selectedLevel}
                onChange={(v: string | null) => { setLevelQuery(''); setSelectedLevel(v || ''); }}
                nullable
              >
                <div className="relative z-20">
                  <Combobox.Input
                    onChange={(e) => { setLevelQuery(e.target.value); if (e.target.value) setSelectedLevel(''); }}
                    displayValue={(id: string) => id ? (levels.find(l => l.id === id)?.name || '') : ''}
                    placeholder={'Semua ' + labels.level}
                    className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    autoComplete="off"
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg text-sm" data-options="level">
                    <Combobox.Option
                      value=""
                      className={({ active }) => `cursor-pointer select-none px-3 py-2 ${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      Semua {labels.level}
                    </Combobox.Option>
                    {filteredLevels.map(level => (
                      <Combobox.Option
                        key={level.id}
                        value={level.id}
                        className={({ active, selected }) => `cursor-pointer select-none px-3 py-2 ${selected ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {level.name}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {labels.bidang}
              </label>
              <Combobox
                value={selectedBidang}
                onChange={(v: string | null) => { setBidangQuery(''); setSelectedBidang(v || ''); }}
                nullable
              >
                <div className="relative z-20">
                  <Combobox.Input
                    onChange={(e) => { setBidangQuery(e.target.value); if (e.target.value) setSelectedBidang(''); }}
                    displayValue={(id: string) => id ? (displayFields.find(f => f.id === id)?.name || '') : ''}
                    placeholder={'Semua ' + labels.bidang}
                    className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    autoComplete="off"
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg text-sm" data-options="bidang">
                    <Combobox.Option
                      value=""
                      className={({ active }) => `cursor-pointer select-none px-3 py-2 ${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      Semua {labels.bidang}
                    </Combobox.Option>
                    {filteredBidang.map(field => (
                      <Combobox.Option
                        key={field.id}
                        value={field.id}
                        className={({ active, selected }) => `cursor-pointer select-none px-3 py-2 ${selected ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {field.name}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipe Pelaksanaan
              </label>
              <select 
                value={selectedTipe} 
                onChange={(e) => handleFilterChange('tipe', e.target.value)}
                className={selectClasses} 
                autoComplete="off"
              >
                <option value="">Semua Tipe</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Online & Offline">Hybrid</option>
              </select>
            </div>

            {kategori === 'info-lomba' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Biaya Pendaftaran
                </label>
                <select 
                  value={selectedGratis} 
                  onChange={(e) => handleFilterChange('gratis', e.target.value)}
                  className={selectClasses} 
                  autoComplete="off"
                >
                  <option value="">Semua</option>
                  <option value="true">Gratis</option>
                  <option value="false">Berbayar</option>
                </select>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                  Filter aktif:
                </span>
                
                {searchParams.get('q') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    Pencarian: {searchParams.get('q')}
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setTimeout(() => handleSearch(true), 100);
                      }}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {searchParams.get('level') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    {labels.level}: {levels.find(l => l.id === searchParams.get('level'))?.name}
                    <button
                      onClick={() => {
                        const p = new URLSearchParams(window.location.search);
                        p.delete('level'); p.set('page', '1');
                        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
                      }}
                      className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {searchParams.get('bidang') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                    {labels.bidang}: {fields.find(f => f.id === searchParams.get('bidang'))?.name}
                    <button
                      onClick={() => {
                        const p = new URLSearchParams(window.location.search);
                        p.delete('bidang'); p.set('page', '1');
                        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
                      }}
                      className="ml-1 hover:text-purple-600 dark:hover:text-purple-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {searchParams.get('tipe') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                    Tipe: {searchParams.get('tipe')}
                    <button
                      onClick={() => {
                        const p = new URLSearchParams(window.location.search);
                        p.delete('tipe'); p.set('page', '1');
                        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
                      }}
                      className="ml-1 hover:text-orange-600 dark:hover:text-orange-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {searchParams.get('gratis') && kategori === 'info-lomba' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                    {searchParams.get('gratis') === 'true' ? 'Gratis' : 'Berbayar'}
                    <button
                      onClick={() => {
                        const p = new URLSearchParams(window.location.search);
                        p.delete('gratis'); p.set('page', '1');
                        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
                      }}
                      className="ml-1 hover:text-yellow-600 dark:hover:text-yellow-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}