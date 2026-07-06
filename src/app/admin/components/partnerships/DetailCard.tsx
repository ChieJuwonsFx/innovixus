import Image from 'next/image';
import { Calendar, MapPin, Globe } from 'lucide-react';
import type { Event } from '../../partnerships/[id]/page';
import type { Json } from '@/types/database'; 

const getPosterUrl = (poster: Json | null): string | null => {
  if (!poster) return null;
  if (typeof poster === 'string') return poster;
  
  if (Array.isArray(poster) && poster.length > 0) {
    const firstItem = poster[0];
    if (typeof firstItem === 'string') return firstItem;
    if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem && typeof firstItem.url === 'string') {
      return firstItem.url;
    }
  }
  return null;
}

interface Props {
  event: Event;
}

export default function EventDetailsCard({ event }: Props) {
  const posterUrl = getPosterUrl(event.poster);

  const effectiveCloseDate = event.close_date || (() => {
    const base = event.open_date || event.created_at;
    if (!base) return null;
    const d = new Date(base);
    d.setDate(d.getDate() + 30);
    return d.toISOString();
  })();

  const getModeStyle = (mode: string | null) => {
    switch(mode) {
      case 'Online': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Offline': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border dark:border-slate-700 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Detail Event
        </h2>
      </div>

      {posterUrl && (
        <div>
          <h3 className="font-semibold text-lg mb-3 dark:text-white">Poster Event</h3>
          <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-md">
            <Image
              src={posterUrl}
              alt={`Poster ${event.title}`}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      )}

      <div className="border-t dark:border-slate-600 pt-6">
        <h3 className="font-semibold text-lg mb-4 dark:text-white">Informasi Kunci</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <DetailItem icon={<MapPin size={16} />} label="Lokasi" value={event.location || 'N/A'} />
          <DetailItem icon={<Globe size={16} />} label="Mode" value={<span className={`px-2 py-0.5 rounded text-sm font-medium ${getModeStyle(event.is_online)}`}>{event.is_online}</span>} />
          <DetailItem icon={<Calendar size={16} />} label="Tanggal Buka" value={event.open_date ? new Date(event.open_date).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'Tidak ditentukan'} />
          <DetailItem icon={<Calendar size={16} />} label="Tanggal Tutup" value={effectiveCloseDate ? new Date(effectiveCloseDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'Tidak ditentukan'} />
        </div>
      </div>

      <div className="border-t dark:border-slate-600 pt-6">
        <h3 className="font-semibold text-lg mb-4 dark:text-white">Tautan Penting</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <LinkButton href={event.guidelink} text="Panduan Event" />
          <LinkButton href={event.registerlink} text="Link Pendaftaran" variant="green" />
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="text-slate-400 mt-0.5">{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  </div>
);

const LinkButton = ({ href, text, variant = 'blue' }: { href: string | null, text: string, variant?: 'blue' | 'green' }) => {
  if (!href) return null;
  const styles = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700'
  };
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`w-full text-center ${styles[variant]} text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
    >
      <Globe size={18} />
      {text}
    </a>
  );
}