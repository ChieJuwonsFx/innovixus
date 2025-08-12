'use client';

import { useState, useEffect } from 'react';
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

  const hasActiveFilters = searchParams.get('q') || 
                         searchParams.get('level') || 
                         searchParams.get('bidang') || 
                         searchParams.get('tipe') || 
                         searchParams.get('gratis');

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

  if (!isMounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <div className="w-full h-12 pl-12 bg-gray-100 dark:bg-gray-700 rounded-xl" />
            </div>
            <div className="w-24 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
              type="button"
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
              type="button"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Filter</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFilterExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ${isFilterExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-6 space-y-4">
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
                autoComplete="off"
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
                autoComplete="off"
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
                  onChange={(e) => setSelectedGratis(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  autoComplete="off"
                >
                  <option value="">Semua</option>
                  <option value="true">Gratis</option>
                  <option value="false">Berbayar</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}