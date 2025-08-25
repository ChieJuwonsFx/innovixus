'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
      
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      } else {
        params.delete('q');
      }

      if (selectedLevel) {
        params.set('level', selectedLevel);
      } else {
        params.delete('level');
      }

      if (selectedBidang) {
        params.set('bidang', selectedBidang);
      } else {
        params.delete('bidang');
      }

      if (selectedTipe) {
        params.set('tipe', selectedTipe);
      } else {
        params.delete('tipe');
      }

      if (selectedGratis) {
        params.set('gratis', selectedGratis);
      } else {
        params.delete('gratis');
      }
      
      params.set('page', '1');
      
      const url = `${pathname}?${params.toString()}`;
      
      router.replace(url, { scroll: false });
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedLevel, selectedBidang, selectedTipe, selectedGratis, pathname, router, isLoading, searchParams]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSearch(true);
    }
  };

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    switch (filterType) {
      case 'level':
        setSelectedLevel(value);
        break;
      case 'bidang':
        setSelectedBidang(value);
        break;
      case 'tipe':
        setSelectedTipe(value);
        break;
      case 'gratis':
        setSelectedGratis(value);
        break;
    }
    
    setTimeout(() => handleSearch(true), 100);
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

  const selectClasses = `w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-no-repeat bg-[url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22currentColor%22%3e%3cpath%20fill-rule%3d%22evenodd%22%20d%3d%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3d%22evenodd%22%20/%3e%3c/svg%3e')] bg-[position:right_0.75rem_center] bg-[size:1.25em]`;

  if (!isMounted) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            <button
              onClick={() => handleSearch(true)}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
              type="button"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cari'}
            </button>
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

      <div className={`transition-all duration-300 ease-in-out ${
        isFilterExpanded ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
      } overflow-hidden`}>
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
              <select 
                value={selectedLevel} 
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className={selectClasses} 
                autoComplete="off"
              >
                <option value="">Semua {labels.level}</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {labels.bidang}
              </label>
              <select 
                value={selectedBidang} 
                onChange={(e) => handleFilterChange('bidang', e.target.value)}
                className={selectClasses} 
                autoComplete="off"
              >
                <option value="">Semua {labels.bidang}</option>
                {displayFields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
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
                <option value="Hybrid">Hybrid</option>
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
                    {labels.level}: {levels.find(l => l.id.toString() === searchParams.get('level'))?.name}
                    <button
                      onClick={() => handleFilterChange('level', '')}
                      className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {searchParams.get('bidang') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                    {labels.bidang}: {fields.find(f => f.id.toString() === searchParams.get('bidang'))?.name}
                    <button
                      onClick={() => handleFilterChange('bidang', '')}
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
                      onClick={() => handleFilterChange('tipe', '')}
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
                      onClick={() => handleFilterChange('gratis', '')}
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
    </div>
  );
}
