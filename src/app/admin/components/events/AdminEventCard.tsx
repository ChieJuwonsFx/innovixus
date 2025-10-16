'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoreVertical, Eye, Edit, FileImage, 
  CalendarDays, MapPin, Laptop 
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
  const generatePostData = {
    title: event.title,
    category: event.kategori || 'Info Lomba',
    images: posterArray || []
  };
  const generatePostUrl = `/admin/generate-post?data=${encodeURIComponent(JSON.stringify(generatePostData))}`;
  const handleDelete = async () => {
    await deleteEvent(event.id);
    setIsMenuOpen(false);
  };
  
  const formattedDate = event.close_date 
    ? new Date(event.close_date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric' 
      }) 
    : null;
  const isEventOnline = event.is_online.toLowerCase() === 'online';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden relative transform transition-all duration-300 ease-in-out hover:shadow-2xl group border border-gray-100 dark:border-gray-700 flex flex-col">
      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {mainPosterUrl && !imageError ? (
          <Image 
            src={mainPosterUrl} 
            alt={event.title ?? 'Event Poster'} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500">
            <FileImage className="w-20 h-20 opacity-60" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {event.kategori && (
          <p className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full px-3 py-1 text-xs font-semibold mb-3 w-fit">
            {event.kategori}
          </p>
        )}
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-tight">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
          oleh {event.organizers?.name || 'No Organizer'}
        </p>
        
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          {formattedDate && (
            <li className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>{formattedDate}</span>
            </li>
          )}
          
          {isEventOnline ? (
            <li className="flex items-center gap-3">
              <Laptop className="w-4 h-4 text-gray-400" />
              <span>Online Event</span>
            </li>
          ) : event.location && ( 
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{event.location}</span>
            </li>
          )}
        </ul>
        
        <div className="mt-auto pt-4">
          <span className={`inline-block w-full text-center px-4 py-1.5 text-sm font-bold rounded-lg 
            ${event.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
              event.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}
          `}>{event.status}</span>
        </div>
      </div>
      
      <button 
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className="absolute top-4 right-4 p-2 rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Buka menu opsi"
      >
        <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-14 right-4 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-20 border border-gray-200 dark:border-gray-700 py-1.5 origin-top-right"
          >
            <Link 
              href={publicUrl} 
              target="_blank" 
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Eye className="w-4 h-4 text-blue-500" /> Lihat Detail
            </Link>
            <Link 
              href={`/admin/events/${event.id}`} 
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Edit className="w-4 h-4 text-yellow-500" /> Edit Event
            </Link>
            <Link 
              href={generatePostUrl} 
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <FileImage className="w-4 h-4 text-purple-500" /> Buat Post IG
            </Link>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <DeleteButton action={handleDelete} itemLabel={event.title} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}