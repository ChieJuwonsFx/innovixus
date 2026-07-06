'use client';

import { Database, Json } from '@/types/database';
import { 
  Loader2, ExternalLink, User, Instagram, Ticket, Calendar, Clock, Tag, 
  Globe, MapPin, DollarSign, Image as ImageIcon 
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import clsx from 'clsx';

type Organizer = Database['public']['Tables']['organizers']['Row'];
type EventData = Omit<Database['public']['Tables']['events']['Insert'], 'id' | 'organizer_id' | 'user_id' | 'status'>;

interface Step3Props {
  organizer: Organizer;
  event: EventData;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

const InfoRow = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-start justify-between py-4">
    <dt className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
      {icon}
      <span>{label}</span>
    </dt>
    <dd className="text-sm text-slate-800 dark:text-slate-200 text-right font-medium">
      {children}
    </dd>
  </div>
);

const Badge = ({ text, color }: { text: string; color: 'green' | 'blue' | 'purple' }) => (
  <span className={clsx('px-2.5 py-1 text-xs font-semibold rounded-full', {
    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': color === 'green',
    'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': color === 'blue',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300': color === 'purple',
  })}>
    {text}
  </span>
);

export default function Step3_Review({ organizer, event, onBack, onSubmit, isLoading, error }: Step3Props) {
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return <span className="text-slate-400 dark:text-slate-500">Tidak Ditentukan</span>;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const getPosterUrl = (posterData: Json): string | null => {
    if (Array.isArray(posterData) && posterData.length > 0 && posterData[0] && typeof posterData[0] === 'object' && 'url' in posterData[0] && typeof posterData[0].url === 'string') {
      return posterData[0].url;
    }
    return null;
  };

  const posterUrl = getPosterUrl(event.poster);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Review & Kirim</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Mohon periksa kembali semua data sebelum mengajukan.</p>
      
      <div className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <dl className="divide-y divide-slate-200 dark:divide-slate-700">
            <InfoRow icon={<User size={16} />} label="Nama Penyelenggara">{organizer.name}</InfoRow>
            <InfoRow icon={<Instagram size={16} />} label="Instagram">@{organizer.instagram}</InfoRow>
          </dl>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <dl className="divide-y divide-slate-200 dark:divide-slate-700">
            <InfoRow icon={<Ticket size={16} />} label="Judul Event">{event.title}</InfoRow>
            <InfoRow icon={<Tag size={16} />} label="Kategori"><Badge text={event.kategori} color="purple" /></InfoRow>
            <InfoRow icon={<DollarSign size={16} />} label="Biaya">{event.is_free === null ? '-' : event.is_free ? <Badge text="Gratis" color="green" /> : 'Berbayar'}</InfoRow>
            <InfoRow icon={<Globe size={16} />} label="Platform"><Badge text={event.is_online} color="blue" /></InfoRow>
            <InfoRow icon={<MapPin size={16} />} label="Lokasi">{event.location || '-'}</InfoRow>
            <InfoRow icon={<Calendar size={16} />} label="Buka Pendaftaran">{formatDate(event.open_date)}</InfoRow>
            <InfoRow icon={<Clock size={16} />} label="Tutup Pendaftaran">{formatDate(event.close_date)}</InfoRow>
            <InfoRow icon={<ExternalLink size={16} />} label="Link Pendaftaran">
              {event.registerlink ? <a href={event.registerlink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat Link</a> : '-'}
            </InfoRow>
            <InfoRow icon={<ExternalLink size={16} />} label="Link Panduan">
              {event.guidelink ? <a href={event.guidelink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat Link</a> : '-'}
            </InfoRow>
             <InfoRow icon={<ImageIcon size={16} />} label="Poster">
              {posterUrl ? (
                <Image src={posterUrl} alt="Poster Event" width={80} height={120} className="rounded-md object-cover shadow-md border border-slate-200 dark:border-slate-700"/>
              ) : 'Tidak ada'}
            </InfoRow>
          </dl>
        </div>
      </div>
      
      {error && <p className="text-red-500 text-center font-semibold my-6">{error}</p>}

      <div className="flex justify-between mt-8">
        <button type="button" onClick={onBack} disabled={isLoading} className="bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
          Kembali
        </button>
        <button type="button" onClick={onSubmit} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors">
          {isLoading ? <Loader2 className="animate-spin" /> : 'Ajukan Partnership'}
        </button>
      </div>
    </div>
  );
}