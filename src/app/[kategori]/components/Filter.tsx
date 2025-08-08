'use client';

import { useState } from 'react';
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
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [selectedBidang, setSelectedBidang] = useState(searchParams.get('bidang') || '');
  const [selectedTipe, setSelectedTipe] = useState(searchParams.get('tipe') || '');
  const [selectedGratis, setSelectedGratis] = useState(searchParams.get('gratis') || '');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedBidang) params.set('bidang', selectedBidang);
    if (selectedTipe) params.set('tipe', selectedTipe);
    if (selectedGratis) params.set('gratis', selectedGratis);
    
    params.set('page', '1');
    
    const url = `${pathname}?${params.toString()}`;
    
    try {
      router.push(url, { scroll: false });
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setSelectedBidang('');
    setSelectedTipe('');
    setSelectedGratis('');
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters = searchParams.get('q') || searchParams.get('level') || searchParams.get('bidang') || searchParams.get('tipe') || searchParams.get('gratis');

  const getLabelText = () => {
    switch (kategori) {
      case 'info-lomba':
        return {
          level: 'Jenjang',
          bidang: 'Bidang Lomba',
          placeholder: 'Cari nama lomba...'
        };
      case 'info-magang':
        return {
          level: 'Pendidikan',
          bidang: 'Bidang Pekerjaan',
          placeholder: 'Cari program magang...'
        };
      case 'info-loker':
        return {
          level: 'Pendidikan',
          bidang: 'Bidang Pekerjaan',
          placeholder: 'Cari lowongan kerja...'
        };
      default:
        return {
          level: 'Level',
          bidang: 'Bidang',
          placeholder: 'Cari...'
        };
    }
  };

  const labels = getLabelText();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
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
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Cari'
            )}
          </button>
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Filter</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFilterExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 ${isFilterExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Pencarian
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <X className="h-4 w-4" />
                Hapus Semua
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
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">Semua {labels.level}</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {labels.bidang}
              </label>
              <select
                value={selectedBidang}
                onChange={(e) => setSelectedBidang(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">Semua {labels.bidang}</option>
                {fields.map(field => (
                  <option key={field.id} value={field.id}>{field.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipe Pelaksanaan
              </label>
              <select
                value={selectedTipe}
                onChange={(e) => setSelectedTipe(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">Semua Tipe</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Online & Offline">Hybrid</option>
              </select>
            </div>

            {kategori === 'info-lomba' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Biaya Pendaftaran
                </label>
                <select
                  value={selectedGratis}
                  onChange={(e) => setSelectedGratis(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                >
                  <option value="">Semua</option>
                  <option value="true">Gratis</option>
                  <option value="false">Berbayar</option>
                </select>
              </div>
            ) : (
              <div></div> 
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                'Terapkan Filter'
              )}
            </button>
          </div>

          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filter aktif:</span>
                {searchParams.get('q') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    &ldquo;{searchParams.get('q')}&rdquo;
                  </span>
                )}
                {searchParams.get('level') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                    {levels.find(l => l.id === searchParams.get('level'))?.name}
                  </span>
                )}
                {searchParams.get('bidang') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                    {fields.find(f => f.id === searchParams.get('bidang'))?.name}
                  </span>
                )}
                {searchParams.get('tipe') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                    {searchParams.get('tipe')}
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