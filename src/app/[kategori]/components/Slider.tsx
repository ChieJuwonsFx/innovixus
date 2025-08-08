'use client';

import { useEffect, useRef, useState } from 'react';
import EventCard from './Card';
import { Database } from '@/types/database';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

type EventWithOrganizer = Database['public']['Tables']['events']['Row'] & {
  organizers: Pick<Database['public']['Tables']['organizers']['Row'], 'name'> | null;
};

type EventForCard = Database['public']['Tables']['events']['Row'] & {
  organizers: Pick<Database['public']['Tables']['organizers']['Row'], 'name' | 'instagram'> | null;
  levels?: Pick<Database['public']['Tables']['levels']['Row'], 'id' | 'name'>[] | null;
  fields?: Pick<Database['public']['Tables']['fields']['Row'], 'id' | 'name'>[] | null;
};

interface SliderProps {
  events: EventWithOrganizer[];
  kategori: string;
}

export default function EventSlider({ events, kategori }: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getSectionTitle = () => {
    switch (kategori) {
      case 'info-lomba':
        return 'Lomba Terbaru';
      case 'info-magang':
        return 'Program Magang Terbaru';
      case 'info-loker':
        return 'Lowongan Kerja Terbaru';
      default:
        return 'Terbaru Untukmu';
    }
  };

  const getSectionDescription = () => {
    switch (kategori) {
      case 'info-lomba':
        return 'Jangan lewatkan kesempatan untuk berkompetisi dan menunjukkan kemampuanmu';
      case 'info-magang':
        return 'Dapatkan pengalaman berharga dan kembangkan skill profesionalmu';
      case 'info-loker':
        return 'Temukan peluang karir yang sesuai dengan passion dan keahlianmu';
      default:
        return 'Peluang terbaik menanti untukmu';
    }
  };

  const convertToCardEvent = (event: EventWithOrganizer): EventForCard => {
    return {
      ...event,
      organizers: event.organizers ? {
        ...event.organizers,
        instagram: ''
      } : null,
      levels: [],
      fields: [],
    };
  };

  useEffect(() => {
    if (!events.length || isHovered || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, events.length - 1);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, [events.length, isHovered, isDragging]);

  useEffect(() => {
    if (sliderRef.current) {
      const cardWidth = 320; 
      const gap = 24; 
      const scrollPosition = currentIndex * (cardWidth + gap);
      
      sliderRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : events.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < events.length - 1 ? prev + 1 : 0);
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="relative mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {getSectionTitle()}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              {getSectionDescription()}
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              aria-label="Previous events"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={goToNext}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              aria-label="Next events"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            } as React.CSSProperties}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {events.map((event) => (
              <div key={event.id} className="flex-shrink-0 w-80">
                <EventCard 
                  event={convertToCardEvent(event)} 
                  kategori={kategori} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex md:hidden justify-center mt-6 gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}