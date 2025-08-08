'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoreVertical, Eye, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';
import DeleteButton from '../../components/DeleteButton';
import { deleteEvent } from '../actions';

type EventWithOrganizer = Database['public']['Tables']['events']['Row'] & {
  organizers: { name: string } | null;
};

type Poster = {
  url: string;
};

export default function AdminEventCard({ event }: { event: EventWithOrganizer }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const posterArray = event.poster as Poster[] | null;
  const posterUrl = posterArray?.[0]?.url || '/placeholder.png'; 
  
  const publicUrl = `/${(event.kategori ?? 'info-lomba').replace(/\s+/g, '-').toLowerCase()}/${event.id}`;

  const handleDelete = async () => {
    await deleteEvent(event.id);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden relative">
      <div className="relative w-full h-48 bg-slate-200 dark:bg-slate-700">
        <Image 
          src={posterUrl} 
          alt={event.title} 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-md text-slate-900 dark:text-white truncate">{event.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {event.organizers?.name || 'No Organizer'}
        </p>
        <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
            event.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
            event.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        }`}>{event.status}</span>
      </div>
      
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className="absolute top-2 right-2 p-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80"
      >
        <MoreVertical className="w-5 h-5 text-slate-800 dark:text-slate-100" />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-12 right-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-10 border border-slate-200 dark:border-slate-700"
          >
            <Link href={publicUrl} target="_blank" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Eye className="w-4 h-4" /> Lihat
            </Link>
            <Link href={`/admin/events/${event.id}`} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Edit className="w-4 h-4" /> Edit
            </Link>
            <DeleteButton action={handleDelete} itemLabel={event.title} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}