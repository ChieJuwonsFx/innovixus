import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, MapPin, Tag, Clock, Users, ExternalLink, GraduationCap, Sparkles
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

  const effectiveCloseDate = event.close_date || (() => {
    const base = event.open_date || event.created_at;
    if (!base) return null;
    const d = new Date(base);
    d.setDate(d.getDate() + 30);
    return d.toISOString();
  })();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const formatDateWithTime = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} hari lagi`;
    
    return null;
  };

  const getStatusColor = () => {
    if (!effectiveCloseDate) return 'text-slate-500';
    const closeDate = new Date(effectiveCloseDate);
    const now = new Date();
    const diffDays = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) return 'text-orange-500';
    if (diffDays <= 7) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const formatTitle = (title: string) => {
    const maxCharsPerLine = 24; 
    const maxLines = 2;
    
    const totalChars = title.length;
    if (totalChars > maxCharsPerLine * maxLines) {
      const truncated = title.slice(0, maxCharsPerLine * maxLines - 3);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 0 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
    }
    
    const words = title.split(' ');
    if (words.length >= 2 && words.length <= 4) {
      const firstLine = words.slice(0, -1).join(' ');
      const lastWord = words[words.length - 1];
      return `${firstLine}<br />${lastWord}`;
    }
    
    return `${title}<br />&nbsp;`;
  };

  const closeDateText = formatDateWithTime(effectiveCloseDate);

  const SliderCardContent = (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 h-full hover:-translate-y-1">
      <div className="relative w-full h-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
        <Image
          src={posterUrl}
          alt={event.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105 pointer-events-none"
          sizes="(max-width: 768px) 100vw, 280px"
        />

        {closeDateText && (
          <div className="absolute top-3 left-3 z-20">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm ${getStatusColor()}`}>
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">{closeDateText}</span>
              <span className="sm:hidden">{closeDateText.split(' ')[0]}</span>
            </span>
          </div>
        )}
        
        {kategori === 'info-lomba' && event.is_free === true && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
              <Sparkles className="w-3 h-3" />
              <span>Gratis</span>
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <h3
            className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight min-h-[3rem] max-h-[3rem] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: formatTitle(event.title) }}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-xs truncate">
              {formatDate(effectiveCloseDate)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-slate-600 dark:text-slate-400 text-xs truncate">
              {event.location} 
            </span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Users className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {event.organizers?.name || 'Penyelenggara'}
            </span>
          </div>
          <Link 
            href={`/${kategori}/${event.id}`} 
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
          >
            <span>Detail</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  const GridCardContent = (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 h-full hover:-translate-y-1">
      <div className="relative w-full h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
        <Image
          src={posterUrl}
          alt={event.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105 pointer-events-none"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {closeDateText && (
          <div className="absolute top-4 left-4 z-20">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm ${getStatusColor()}`}>
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{closeDateText}</span>
              <span className="sm:hidden">{closeDateText.split(' ')[0]}</span>
            </span>
          </div>
        )}
        
        {kategori === 'info-lomba' && event.is_free === true && (
          <div className="absolute bottom-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
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
        </div>
        
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-slate-900 dark:text-white font-semibold truncate">
              {formatDate(effectiveCloseDate)}
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
        
        <div className="pt-4 mt-auto border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate">
                    {event.organizers?.name || 'Penyelenggara'}
                </span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex-shrink-0">
                <span>Detail</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
        </div>
      </div>
    </div>
  );

  const CardContent = variant === 'slider' ? SliderCardContent : GridCardContent;

  return variant === 'grid' ? (
    <Link href={`/${kategori}/${event.id}`} className="block h-full">
      {CardContent}
    </Link>
  ) : (
    CardContent
  );
}