'use client';

import Link from 'next/link';
import { CheckCircle, ExternalLink, Download, Share2 } from 'lucide-react';
import { Database } from '@/types/database';

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

type StatusInfoType = {
  status: string;
  color: string;
  bgColor: string;
  text: string;
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

interface SidebarProps {
  event: EventWithRelations;
  kategori: string;
  posterArray: Poster[] | null;
  statusInfo: StatusInfoType;
  categoryConfig: CategoryConfigType;
  onShareClick: () => void;
}

export default function Sidebar({ 
  event, 
  kategori, 
  statusInfo, 
  categoryConfig,
  onShareClick
}: SidebarProps) {
  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mx-auto">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Siap untuk bergabung?</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {statusInfo.status === 'closed' ? 'Pendaftaran telah ditutup' : 'Jangan sampai terlewat!'}
            </p>
          </div>
          
          {statusInfo.status !== 'closed' && event.registerlink ? (
            <Link 
              href={event.registerlink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 w-full bg-blue-600  hover:blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
            >
              <span>{categoryConfig.registerText}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          ) : (
            <div className="w-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold py-3 px-6 rounded-lg">
              Pendaftaran Ditutup
            </div>
          )}
          
          {event.guidelink && (
            <Link 
              href={event.guidelink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Panduan</span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Ringkasan</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Status</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Format</span>
            <span className="text-slate-900 dark:text-white text-sm font-medium">
              {event.is_online === 'online' ? 'Online' : event.is_online === 'offline' ? 'Offline' : 'Hybrid'}
            </span>
          </div>
          {kategori === 'info-lomba' && event.is_free !== null && (
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm">Biaya</span>
              <span className="text-slate-900 dark:text-white text-sm font-medium">
                {event.is_free ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Gratis</span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">Berbayar</span>
                )}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Kategori</span>
            <span className="text-slate-900 dark:text-white text-sm font-medium">
              {event.kategori || categoryConfig.title}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Bagikan</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          Bagikan informasi ini kepada teman-temanmu!
        </p>
        <button 
          onClick={onShareClick} 
          className="inline-flex items-center justify-center gap-2 w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan Event</span>
        </button>
      </div>
    </div>
  );
}