'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoreVertical, Eye, Edit, FileImage, 
  CalendarDays, Laptop, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';
import DeleteButton from '../DeleteButton';
import { deleteEvent } from '../../events/actions';

type EventRow = Database['public']['Tables']['events']['Row'];

type EventWithOrganizer = EventRow & {
  organizers: { name: string } | null;
};

type Poster = {
  url: string;
};

export default function AdminEventCard({ event }: { event: EventWithOrganizer }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const posterArray = event.poster as Poster[] | null;
  const mainPosterUrl = posterArray?.[0]?.url;
  const publicUrl = `/${(event.kategori ?? 'info-lomba').replace(/\s+/g, '-').toLowerCase()}/${event.id}`;
  const generatePostUrl = `/admin/generate-post?data=${encodeURIComponent(JSON.stringify({ title: event.title, category: event.kategori || 'Info Lomba', images: posterArray || [] }))}`;
  const handleDelete = async () => {
    await deleteEvent(event.id);
    setIsMenuOpen(false);
  };
  
  const formattedDate = event.close_date 
    ? new Date(event.close_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : null;
  const isEventOnline = event.is_online.toLowerCase() === 'online';

  const statusClass = event.status === 'Success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
    event.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';

  return (
    <tr className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50">
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
          {mainPosterUrl && !imageError ? (
            <Image 
              src={mainPosterUrl} 
              alt="" 
              width={40} 
              height={40} 
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <FileImage className="h-4 w-4 text-slate-300 dark:text-slate-500" />
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</span>
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 md:table-cell dark:text-slate-400">
        {event.kategori}
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 lg:table-cell dark:text-slate-400">
        {event.organizers?.name || '-'}
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 sm:table-cell dark:text-slate-400">
        {formattedDate || '-'}
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-sm sm:table-cell">
        {isEventOnline ? (
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Laptop className="h-3.5 w-3.5" /> Online
          </span>
        ) : event.location ? (
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> {event.location}
          </span>
        ) : '-'}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClass}`}>
          {event.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="relative">
          <button 
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Menu"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-8 z-50 w-44 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <Link href={publicUrl} target="_blank" className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMenuOpen(false)}>
                  <Eye className="h-3.5 w-3.5" /> Lihat Detail
                </Link>
                <Link href={`/admin/events/${event.id}`} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMenuOpen(false)}>
                  <Edit className="h-3.5 w-3.5" /> Edit Event
                </Link>
                <Link href={generatePostUrl} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMenuOpen(false)}>
                  <FileImage className="h-3.5 w-3.5" /> Buat Post IG
                </Link>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                <div className="px-1">
                  <DeleteButton action={handleDelete} itemLabel={event.title} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  );
}
