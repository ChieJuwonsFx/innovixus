'use client';

import Link from 'next/link';
import { 
  Calendar, MapPin, Tag, Clock, Users, GraduationCap, 
  Sparkles, FileText, AlertCircle, Globe, Instagram, DollarSign, Gift 
} from 'lucide-react';
import { Database } from '@/types/database';
import PosterCarousel from './PosterCarousel';

type Poster = {
  url: string;
};

type EventWithRelations = Database['public']['Tables']['events']['Row'] & {
  organizers: Database['public']['Tables']['organizers']['Row'] | null;
  levels?: Database['public']['Tables']['levels']['Row'][] | null;
  fields?: Database['public']['Tables']['fields']['Row'][] | null;
  prices?: Database['public']['Tables']['prices']['Row'][] | null;
  partnerships?: Database['public']['Tables']['partnerships']['Row'] | null;
};

type CategoryConfigType = {
  title: string;
  icon: React.ReactNode;
  color: string;
  showPricing: boolean;
  showLevels: boolean;
  showFields: boolean;
  registerText: string;
};

interface ContentProps {
  event: EventWithRelations;
  kategori: string;
  posterArray: Poster[] | null;
  categoryConfig: CategoryConfigType;
  onImageClick: (index: number) => void;
}

export default function Content({ 
  event, 
  kategori, 
  posterArray, 
  categoryConfig,
  onImageClick
}: ContentProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="relative">
          <PosterCarousel 
            posters={posterArray || []} 
            title={event.title} 
            onImageClick={onImageClick}
          />
          {kategori === 'info-lomba' && event.is_free === true && (
            <div className="absolute bottom-4 left-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gratis</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {event.title}
          </h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base whitespace-pre-line">
              {event.caption}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Detail {categoryConfig.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-1 flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">Pendaftaran Dibuka</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(event.open_date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg mt-1 flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">Batas Pendaftaran</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {formatDate(event.close_date)}
                  {!event.close_date && <span className="text-slate-400 italic">Pendaftaran dapat ditutup sewaktu-waktu</span>}
                </p>
              </div>
            </div>
            
            {event.extend_date && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg mt-1 flex-shrink-0">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Diperpanjang Hingga</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(event.extend_date)}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg mt-1 flex-shrink-0">
                {event.is_online === 'online' ? 
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : 
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                }
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {event.is_online === 'online' ? 'Format' : 'Lokasi'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {event.is_online === 'online' ? 'Online' : event.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg mt-1 flex-shrink-0">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">Penyelenggara</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {event.organizers?.name || 'Penyelenggara'}
                </p>
                {event.organizers?.instagram && (
                  <Link 
                    href={`https://instagram.com/${event.organizers.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 text-xs mt-1 transition-colors"
                  >
                    <Instagram className="w-3 h-3" />
                    <span>{event.organizers.instagram}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {(categoryConfig.showLevels || categoryConfig.showFields) && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryConfig.showLevels && event.levels && event.levels.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg mt-1 flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tingkatan</h3>
                    <div className="flex flex-wrap gap-1">
                      {event.levels.map((level) => (
                        <span 
                          key={level.id} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                        >
                          {level.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {categoryConfig.showFields && event.fields && event.fields.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg mt-1 flex-shrink-0">
                    <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Bidang</h3>
                    <div className="flex flex-wrap gap-1">
                      {event.fields.map((field) => (
                        <span 
                          key={field.id} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                        >
                          {field.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {categoryConfig.showPricing && event.prices && event.prices.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Biaya Pendaftaran
          </h2>
          <div className="grid gap-4">
            {event.prices.map((price) => (
              <div 
                key={price.id} 
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {price.wave_name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(price.start_date)} - {formatDate(price.end_date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {price.price === null || price.price === 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-semibold">
                      <Gift className="w-3 h-3" />
                      Gratis
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      Rp {price.price?.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}