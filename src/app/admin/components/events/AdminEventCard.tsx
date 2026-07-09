'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoreVertical, Eye, Edit, FileImage, 
  CalendarDays, Laptop, MapPin, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Database } from '@/types/database';
import DeleteButton from '../DeleteButton';
import { deleteEvent } from '../../events/actions';

type EventRow = Database['public']['Tables']['events']['Row'];

type EventWithOrganizer = EventRow & {
  organizers: { name: string; instagram?: string | null } | null;
};

type Poster = {
  url: string;
};

export default function AdminEventCard({ event }: { event: EventWithOrganizer }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 176 });
    }
    setIsMenuOpen(!isMenuOpen);
  };

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

  const handlePostToInstagram = async () => {
    const posterArray = event.poster as Poster[] | null;
    const images = posterArray?.map(p => p.url) || [];
    const orgIg = event.organizers?.instagram;
    const mention = orgIg ? `\n\n@${orgIg} untuk info lebih lanjut` : '';

    let caption = `${event.title}\n\n${event.caption || ''}`;
    try {
      const aiRes = await fetch('/api/ai/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: `Judul: ${event.title}\nKategori: ${event.kategori}\nDeskripsi: ${event.caption}\n\nBuat caption IG dengan hashtag wajib: #kralokainfo #melangkahbarengkraloka #${(event.kategori || '').replace(/\s+/g, '')} dan hashtag relevan dari teks.` }),
      });
      if (!aiRes.ok) throw new Error(await aiRes.text());
      const aiJson = await aiRes.json();
      if (aiJson.success && aiJson.data?.caption) {
        caption = aiJson.data.caption;
      }
    } catch {}
    caption += mention;
    if (!caption.includes('#')) caption += `\n\n#kralokainfo #melangkahbarengkraloka #${(event.kategori || '').replace(/\s+/g, '')} #kraloka`;

    const userTags = orgIg ? [{ username: orgIg, x: 0.5, y: 0.9 }] : [];

    setIsPosting(true);
    setIsMenuOpen(false);
    try {
      const { generatePostImages } = await import('@/lib/imageGenerator');
      const urlsToFiles = async (urls: string[]) =>
        Promise.all(urls.map(async (url, i) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return new File([blob], `poster-${i}.jpg`, { type: blob.type });
        }));

      const fileImages = images.length > 0 ? await urlsToFiles(images) : [];

      const generated = await generatePostImages({
        title: event.title,
        category: event.kategori || 'Info Lomba',
        images: fileImages,
        template: 'blue',
      });

      if (!generated.length) throw new Error('Gagal generate gambar');

      const res = await fetch('/api/instagram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrls: generated.map(g => g.url), caption, userTags }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Berhasil dipost ke Instagram!');
    } catch (e) {
      toast.error('Gagal post: ' + (e instanceof Error ? e.message : 'Unknown'));
    } finally {
      setIsPosting(false);
    }
  };

  return (<>
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
          <span className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">{event.title}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
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
        <button 
          ref={buttonRef}
          onClick={toggleMenu} 
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          aria-label="Menu"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    </tr>

      {mounted && isMenuOpen && createPortal(
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
          className="w-44 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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
          <button onClick={handlePostToInstagram} disabled={isPosting} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50">
            <Send className="h-3.5 w-3.5" /> {isPosting ? 'Posting...' : 'Post ke IG'}
          </button>
          <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
          <div className="px-1">
            <DeleteButton action={handleDelete} itemLabel={event.title} />
          </div>
        </motion.div>,
        document.body
      )}
    </>
  );
}
