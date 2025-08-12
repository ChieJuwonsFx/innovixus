import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, MapPin, Tag, Clock, Users, ExternalLink,
  Trophy, Briefcase, GraduationCap, Sparkles
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
  variant?: 'grid' | 'slider';
}

export default function Card({ event, kategori, variant = 'grid' }: CardProps) {
  const posterArray = event.poster as Poster[] | null;
  const posterUrl = posterArray?.[0]?.url || '/placeholder.png'; 

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
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
    if (!event.close_date) return 'text-slate-500';
    const closeDate = new Date(event.close_date);
    const now = new Date();
    const diffDays = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500';
    if (diffDays <= 3) return 'text-orange-500';
    if (diffDays <= 7) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getCategoryIcon = () => {
    switch (kategori) {
      case 'info-lomba': return <Trophy className="w-4 h-4" />;
      case 'info-magang': return <GraduationCap className="w-4 h-4" />;
      case 'info-loker': return <Briefcase className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getCategoryBadge = () => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm";
    switch (kategori) {
      case 'info-lomba': 
        return `${baseClasses} bg-gradient-to-r from-amber-50/95 to-yellow-50/95 text-amber-700 border-amber-200/50 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300 dark:border-amber-700/50`;
      case 'info-magang': 
        return `${baseClasses} bg-gradient-to-r from-blue-50/95 to-indigo-50/95 text-blue-700 border-blue-200/50 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 dark:border-blue-700/50`;
      case 'info-loker': 
        return `${baseClasses} bg-gradient-to-r from-emerald-50/95 to-green-50/95 text-emerald-700 border-emerald-200/50 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300 dark:border-emerald-700/50`;
      default: 
        return `${baseClasses} bg-gradient-to-r from-slate-50/95 to-gray-50/95 text-slate-700 border-slate-200/50 dark:from-slate-800/40 dark:to-gray-800/40 dark:text-slate-300 dark:border-slate-700/50`;
    }
  };

  const formatTitle = (title: string) => {
    const words = title.split(' ');
    const maxCharsPerLine = 24; 
    const maxLines = 2;
    
    const totalChars = title.length;
    if (totalChars > maxCharsPerLine * maxLines) {
      const truncated = title.slice(0, maxCharsPerLine * maxLines - 3);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 0 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
    }
    
    if (words.length >= 2 && words.length <= 4) {
      const firstLine = words.slice(0, -1).join(' ');
      const lastWord = words[words.length - 1];
      return `${firstLine}<br />${lastWord}`;
    }
    
    return `${title}<br />&nbsp;`;
  };

  const CardContent = (
    <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 h-full hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-slate-900/5 dark:from-white/2 dark:to-slate-900/10 pointer-events-none" />
      
      <div className="relative w-full h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
        <Image
          src={posterUrl}
          alt={event.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105 pointer-events-none"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <div className="absolute top-4 left-4 z-20">
          <span className={getCategoryBadge()}>
            {getCategoryIcon()}
            <span className="hidden sm:inline">
              {kategori === 'info-lomba' ? 'Lomba' : kategori === 'info-magang' ? 'Magang' : 'Loker'}
            </span>
          </span>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm ${getStatusColor()}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{formatDateWithTime(event.close_date)}</span>
            <span className="sm:hidden">{formatDateWithTime(event.close_date).split(' ')[0]}</span>
          </span>
        </div>
        
        {kategori === 'info-lomba' && event.is_free && (
          <div className="absolute bottom-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gratis</span>
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <h3
            className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight min-h-[3.5rem] max-h-[3.5rem] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: formatTitle(event.title) }}
          />
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate font-medium">
              {event.organizers?.name || 'Penyelenggara'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-slate-900 dark:text-white font-semibold truncate">
              {formatDate(event.close_date)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-slate-600 dark:text-slate-400 truncate">
              {event.location} 
            </span>
          </div>
          
          {event.levels && event.levels.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-slate-600 dark:text-slate-400 truncate">
                {event.levels.map(level => level.name).join(', ')}
              </span>
            </div>
          )}
          
          {event.fields && event.fields.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="p-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <Tag className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-slate-600 dark:text-slate-400 truncate">
                {event.fields.map(field => field.name).join(', ')}
              </span>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
            {new Date(event.created_at).toLocaleDateString('id-ID')}
          </span>
          {variant === 'slider' ? (
            <Link 
              href={`/${kategori}/${event.id}`} 
              className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <span>Detail</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
              <span>Detail</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return variant === 'grid' ? (
    <Link href={`/${kategori}/${event.id}`} className="block h-full">
      {CardContent}
    </Link>
  ) : (
    CardContent
  );
}