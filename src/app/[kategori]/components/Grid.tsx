import Card from './Card';
import NoResults from './NoResults';
import { EventWithRelations } from '../page';

type EventGridProps = {
  events: EventWithRelations[];
  count: number | null;
  isFiltered: boolean;
  kategori: string;
  searchQuery?: string;
};

export default function Grid({ events, count, isFiltered, kategori, searchQuery }: EventGridProps) {
  if (!events || events.length === 0) {
    return <NoResults isFiltered={isFiltered} kategori={kategori} />;
  }

  return (
    <>
      {isFiltered && (
        <div className="mb-8">
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Ditemukan {count || 0} hasil
            {searchQuery && (
              <span> untuk <span className="font-semibold text-blue-600 dark:text-blue-400">&ldquo;{searchQuery}&rdquo;</span></span>
            )}
          </p>
        </div>
      )}
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {events.map((event) => (
          <Card key={event.id} event={event} kategori={kategori} />
        ))}
      </div>
    </>
  );
}