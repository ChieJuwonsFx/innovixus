'use client';

import { useEffect, useRef, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  const dragInfoRef = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startTranslateX: 0,
  });

  const cardWidth = 320;
  const gap = 24;
  const cardWithGap = cardWidth + gap;

  const getSectionTitle = () => {
    switch (kategori) {
      case 'info-lomba': return 'Lomba Terbaru';
      case 'info-magang': return 'Program Magang Terbaru';
      case 'info-loker': return 'Lowongan Kerja Terbaru';
      default: return 'Terbaru Untukmu';
    }
  };

  const getSectionDescription = () => {
    switch (kategori) {
      case 'info-lomba': return 'Jangan lewatkan kesempatan untuk berkompetisi dan menunjukkan kemampuanmu';
      case 'info-magang': return 'Dapatkan pengalaman berharga dan kembangkan skill profesionalmu';
      case 'info-loker': return 'Temukan peluang karir yang sesuai dengan passion dan keahlianmu';
      default: return 'Peluang terbaik menanti untukmu';
    }
  };

  const convertToCardEvent = (event: EventWithOrganizer): EventForCard => {
    return {
      ...event,
      organizers: event.organizers ? { ...event.organizers, instagram: '' } : null,
      levels: [],
      fields: [],
    };
  };

  const infiniteEvents = events.length > 0 ? [...events, ...events, ...events] : [];
  const originalEventsWidth = events.length * cardWithGap;

  const setTransform = useCallback((x: number, smooth = false) => {
    if (containerRef.current) {
      containerRef.current.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
      containerRef.current.style.transform = `translateX(${x}px)`;
      translateXRef.current = x;
    }
  }, []);

  const handleLooping = useCallback(() => {
    const currentTranslateX = translateXRef.current;
    if (currentTranslateX <= -originalEventsWidth * 2) {
      setTransform(currentTranslateX + originalEventsWidth);
    } else if (currentTranslateX > -originalEventsWidth) {
      setTransform(currentTranslateX - originalEventsWidth);
    }
  }, [originalEventsWidth, setTransform]);

  const animate = useCallback(() => {
    if (isAnimatingRef.current) {
      setTransform(translateXRef.current - 0.8);
      handleLooping();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [setTransform, handleLooping]);
  
  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current || events.length === 0 || dragInfoRef.current.isDown) return;
    isAnimatingRef.current = true;
    animate();
  }, [animate, events.length]);

  const stopAnimation = useCallback(() => {
    isAnimatingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragInfoRef.current.isDown) return;
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
      containerRef.current.style.userSelect = 'auto';
    }
    
    if (dragInfoRef.current.isDragging) {
      handleLooping();
    }
    
    dragInfoRef.current.isDown = false;
    dragInfoRef.current.isDragging = false;
    startAnimation();
  }, [handleLooping, startAnimation]);

  const handleDragStart = useCallback((clientX: number) => {
    stopAnimation();
    dragInfoRef.current = {
      isDown: true,
      isDragging: false,
      startX: clientX,
      startTranslateX: translateXRef.current,
    };
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
      containerRef.current.style.userSelect = 'none';
    }
  }, [stopAnimation]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragInfoRef.current.isDown) return;

    if (e instanceof MouseEvent && e.buttons === 0) {
      handleDragEnd();
      return;
    }

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const deltaX = clientX - dragInfoRef.current.startX;
    
    if (!dragInfoRef.current.isDragging && Math.abs(deltaX) > 10) {
      dragInfoRef.current.isDragging = true;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    }

    if (dragInfoRef.current.isDragging) {
      setTransform(dragInfoRef.current.startTranslateX + deltaX);
    }
  }, [setTransform, handleDragEnd]);
  
  const scrollToNext = useCallback(() => {
    stopAnimation();
    const nextSnapPoint = Math.ceil(translateXRef.current / cardWithGap) * cardWithGap - cardWithGap;
    setTransform(nextSnapPoint, true);
    setTimeout(() => { handleLooping(); startAnimation(); }, 500);
  }, [stopAnimation, cardWithGap, setTransform, handleLooping, startAnimation]);

  const scrollToPrev = useCallback(() => {
    stopAnimation();
    const prevSnapPoint = Math.floor(translateXRef.current / cardWithGap) * cardWithGap + cardWithGap;
    setTransform(Math.min(prevSnapPoint, -originalEventsWidth), true);
    setTimeout(() => { handleLooping(); startAnimation(); }, 500);
  }, [stopAnimation, cardWithGap, setTransform, handleLooping, startAnimation, originalEventsWidth]);

  useEffect(() => {
    setTransform(-originalEventsWidth);
    startAnimation();

    const onMouseMove = (e: MouseEvent) => handleDragMove(e);
    const onTouchMove = (e: TouchEvent) => handleDragMove(e);
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      stopAnimation();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  if (!events || events.length === 0) return null;

  return (
    <section className="relative mb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {getSectionTitle()}
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg leading-relaxed">
              {getSectionDescription()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToPrev}
              className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-600 hover:scale-105 hover:shadow-lg group"
              aria-label="Previous events"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
            <button
              onClick={scrollToNext}
              className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-600 hover:scale-105 hover:shadow-lg group"
              aria-label="Next events"
            >
              <ChevronRight className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        </div>

        <div 
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4"
          onMouseEnter={stopAnimation}
          onMouseLeave={() => { if (!dragInfoRef.current.isDown) startAnimation()}}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        >
          <div
            ref={containerRef}
            className="flex gap-6 will-change-transform"
            style={{
              width: `${infiniteEvents.length * cardWithGap}px`,
              cursor: 'grab',
            }}
            onClick={(e) => {
                if (dragInfoRef.current.isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
          >
            {infiniteEvents.map((event, index) => (
              <div 
                key={`${event.id}-${index}`}
                className="flex-shrink-0 w-80"
              >
              <EventCard 
                event={convertToCardEvent(event)} 
                kategori={kategori} 
                variant="slider"
              />
              </div>
            ))}
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10"></div>
        </div>
      </div>
    </section>
  );
}