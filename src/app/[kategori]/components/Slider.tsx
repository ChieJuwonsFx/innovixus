'use client';

import { useEffect, useRef, useCallback } from 'react';
import EventCard from './Card';
import { Database } from '@/types/database';

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
  const isPausedRef = useRef(false);

  const dragInfoRef = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startTranslateX: 0,
  });

  const cardWidth = 280; 
  const gap = 20;
  const cardWithGap = cardWidth + gap;

  const convertToCardEvent = (event: EventWithOrganizer): EventForCard => {
    return {
      ...event,
      organizers: event.organizers ? { ...event.organizers, instagram: '' } : null,
      levels: [],
      fields: [],
    };
  };

  const createInfiniteEvents = (): EventWithOrganizer[] => {
    if (events.length === 0) return [];
    
    const multiplier = Math.max(4, Math.ceil(8 / events.length));
    let result: EventWithOrganizer[] = [];
    
    for (let i = 0; i < multiplier; i++) {
      result = [...result, ...events];
    }
    
    return result;
  };

  const infiniteEvents = createInfiniteEvents();
  const originalSetWidth = events.length * cardWithGap;

  const setTransform = useCallback((x: number, smooth = false) => {
    if (containerRef.current) {
      containerRef.current.style.transition = smooth ? 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)' : 'none';
      containerRef.current.style.transform = `translateX(${x}px)`;
      translateXRef.current = x;
    }
  }, []);

  const handleLooping = useCallback(() => {
    const currentTranslateX = translateXRef.current;
    
    if (currentTranslateX <= -originalSetWidth * 2) {
      setTransform(currentTranslateX + originalSetWidth);
    } else if (currentTranslateX > 0) {
      setTransform(currentTranslateX - originalSetWidth);
    }
  }, [originalSetWidth, setTransform]);

  const animate = useCallback(() => {
    if (isAnimatingRef.current && !isPausedRef.current) {
      setTransform(translateXRef.current - 0.5);
      handleLooping();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [setTransform, handleLooping]);
  
  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current || events.length === 0) return;
    isAnimatingRef.current = true;
    animate();
  }, [animate, events.length]);

  const stopAnimation = useCallback(() => {
    isAnimatingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const pauseAnimation = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resumeAnimation = useCallback(() => {
    isPausedRef.current = false;
    if (!isAnimatingRef.current) {
      startAnimation();
    }
  }, [startAnimation]);

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
    
    setTimeout(resumeAnimation, 1000);
  }, [handleLooping, resumeAnimation]);

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
  
  useEffect(() => {
    if (events.length > 0) {
      setTransform(-originalSetWidth);
      startAnimation();
    }

    const onMouseMove = (e: MouseEvent) => handleDragMove(e);
    const onTouchMove = (e: TouchEvent) => handleDragMove(e);
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      stopAnimation();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragEnd, handleDragMove, originalSetWidth, setTransform, startAnimation, stopAnimation, events.length]);

  if (!events || events.length === 0) return null;

  return (
    <section className="relative mb-12">
      <div className="py-6">

        <div 
          className="relative overflow-hidden"
        >
          <div
            ref={containerRef}
            className="flex gap-5 will-change-transform"
            style={{
              width: `${infiniteEvents.length * cardWithGap}px`,
              cursor: 'grab',
            }}
            onMouseEnter={pauseAnimation}
            onMouseLeave={resumeAnimation}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
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
                className="flex-shrink-0 w-70 py-1"
                style={{ width: `${cardWidth}px` }}
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