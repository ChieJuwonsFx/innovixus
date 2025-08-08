import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  Clock, 
  Users, 
  ExternalLink,
  Trophy,
  Briefcase,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import { Database } from '@/types/database';

type Poster = {
  url: string;
};

type EventWithRelations = Database['public']['Tables']['events']['Row'] & {
  organizers: Pick<Database['public']['Tables']['organizers']['Row'], 'name' | 'instagram'> | null;
  levels?: Pick<Database['public']['Tables']['levels']['Row'], 'id' | 'name'>[] | null;
  fields?: Pick<Database['public']['Tables']['fields']['Row'], 'id' | 'name'>[] | null;
};

interface CardProps {
  event: EventWithRelations;
  kategori: string;
}

export default function EventCard({ event, kategori }: CardProps) {
  const posterArray = event.poster as Poster[] | null;
  const posterUrl = posterArray?.[0]?.url || '/placeholder.png'; 

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateWithTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Berakhir';
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    if (diffDays <= 7) return `${diffDays} hari lagi`;
    
    return formatDate(dateString);
  };

  const getStatusColor = () => {
    if (!event.close_date) return 'text-gray-500';
    const closeDate = new Date(event.close_date);
    const now = new Date();
    const diffDays = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500';
    if (diffDays <= 3) return 'text-orange-500';
    if (diffDays <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getCategoryIcon = () => {
    switch (kategori) {
      case 'info-lomba':
        return <Trophy className="w-4 h-4" />;
      case 'info-magang':
        return <GraduationCap className="w-4 h-4" />;
      case 'info-loker':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getCategoryBadge = () => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";
    
    switch (kategori) {
      case 'info-lomba':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case 'info-magang':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      case 'info-loker':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`;
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      <Link href={`/${kategori}/${event.id}`} className="block">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={posterUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          <div className="absolute top-3 left-3">
            <span className={getCategoryBadge()}>
              {getCategoryIcon()}
              {kategori === 'info-lomba' ? 'Lomba' : kategori === 'info-magang' ? 'Magang' : 'Loker'}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${getStatusColor()}`}>
              <Clock className="w-3 h-3" />
              {formatDateWithTime(event.close_date)}
            </span>
          </div>

          {kategori === 'info-lomba' && event.is_free && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                <DollarSign className="w-3 h-3" />
                Gratis
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {event.organizers?.name || 'Penyelenggara'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-gray-900 dark:text-white font-medium truncate">
                {formatDate(event.close_date)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {event.location} • {event.is_online}
              </span>
            </div>

            {event.levels && event.levels.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {event.levels.map(level => level.name).join(', ')}
                </span>
              </div>
            )}

            {event.fields && event.fields.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {event.fields.map(field => field.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(event.created_at).toLocaleDateString('id-ID')}
            </span>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <span>Detail</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}