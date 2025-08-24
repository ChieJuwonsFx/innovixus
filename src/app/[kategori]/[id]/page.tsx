import { notFound } from 'next/navigation';
import { GraduationCap, Calendar, Users } from 'lucide-react';
import { getEventWithRelations } from '@/lib/supabase/event';
import DetailClient from './detail-event-client';

type Poster = {
  url: string;
};

interface EventDetailPageProps {
  params: {
    kategori: string;
    id: string;
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { kategori } = params;
  const event = await getEventWithRelations(params.id);

  if (!event) {
    notFound();
  }

  const posterArray = event.poster as Poster[] | null;

  const getStatusInfo = () => {
    if (!event.close_date) return { status: 'unknown', color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-800', text: 'Status tidak diketahui' };
    const closeDate = new Date(event.close_date);
    const now = new Date();
    const diffTime = closeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'closed', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/30', text: 'Pendaftaran ditutup' };
    if (diffDays === 0) return { status: 'today', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30', text: 'Terakhir hari ini' };
    if (diffDays <= 3) return { status: 'urgent', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30', text: `${diffDays} hari lagi` };
    if (diffDays <= 7) return { status: 'soon', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30', text: `${diffDays} hari lagi` };
    return { status: 'open', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', text: `${diffDays} hari lagi` };
  };

  const getCategoryConfig = () => {
    switch (kategori) {
      case 'info-lomba': return { title: 'Info Lomba', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-gradient-to-r from-purple-500 to-indigo-500', showPricing: true, showLevels: true, showFields: true, registerText: 'Daftar Lomba' };
      case 'info-event': return { title: 'Info Event', icon: <Calendar className="w-5 h-5" />, color: 'bg-gradient-to-r from-blue-500 to-cyan-500', showPricing: false, showLevels: false, showFields: true, registerText: 'Daftar Event' };
      case 'info-workshop': return { title: 'Info Workshop', icon: <Users className="w-5 h-5" />, color: 'bg-gradient-to-r from-green-500 to-emerald-500', showPricing: true, showLevels: false, showFields: true, registerText: 'Daftar Workshop' };
      default: return { title: 'Info Event', icon: <Calendar className="w-5 h-5" />, color: 'bg-gradient-to-r from-slate-500 to-slate-600', showPricing: false, showLevels: false, showFields: false, registerText: 'Daftar' };
    }
  };

  const statusInfo = getStatusInfo();
  const categoryConfig = getCategoryConfig();

  return (
    <DetailClient 
      event={event}
      kategori={kategori}
      posterArray={posterArray}
      statusInfo={statusInfo}
      categoryConfig={categoryConfig}
    />
  );
}