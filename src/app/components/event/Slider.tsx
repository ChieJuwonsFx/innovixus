'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
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

const CARD_WIDTH = 280;
const CARD_GAP = 20;
const CARD_WITH_GAP = CARD_WIDTH + CARD_GAP;
const ANIMATION_SPEED = 0.5;
const DRAG_THRESHOLD = 10;
const ANIMATION_RESUME_DELAY = 1000;

export default function EventSlider({ events, kategori }: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isHoveredRef = useRef(false);

  const dragStateRef = useRef({
    isActive: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
  });

  const infiniteEvents = useMemo((): EventWithOrganizer[] => {
    if (events.length === 0) return [];
    
    const multiplier = Math.max(4, Math.ceil(8 / events.length));
    const result: EventWithOrganizer[] = [];
    
    for (let i = 0; i < multiplier; i++) {
      result.push(...events);
    }
    
    return result;
  }, [events]);

  const originalSetWidth = useMemo(() => events.length * CARD_WITH_GAP, [events.length]);

  const convertToCardEvent = useCallback((event: EventWithOrganizer): EventForCard => ({
    ...event,
    organizers: event.organizers ? { ...event.organizers, instagram: '' } : null,
    levels: [],
    fields: [],
  }), []);

  const setTransform = useCallback((x: number, smooth = false) => {
    const container = containerRef.current;
    if (!container) return;

    container.style.transition = smooth ? 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)' : 'none';
    container.style.transform = `translateX(${x}px)`;
    translateXRef.current = x;
  }, []);

  const handleInfiniteLoop = useCallback(() => {
    const currentX = translateXRef.current;
    
    if (currentX <= -originalSetWidth * 2) {
      setTransform(currentX + originalSetWidth);
    } else if (currentX > 0) {
      setTransform(currentX - originalSetWidth);
    }
  }, [originalSetWidth, setTransform]);

  const animate = useCallback(() => {
    if (isAnimatingRef.current && !isPausedRef.current && !isHoveredRef.current) {
      setTransform(translateXRef.current - ANIMATION_SPEED);
      handleInfiniteLoop();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (isAnimatingRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [setTransform, handleInfiniteLoop]);

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current || events.length === 0) return;
    
    isAnimatingRef.current = true;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate, events.length]);

  const stopAnimation = useCallback(() => {
    isAnimatingRef.current = false;
    isPausedRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    
    if (!isAnimatingRef.current && events.length > 0) {
      startAnimation();
    }
  }, [startAnimation, events.length]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    stopAnimation();
    
    dragStateRef.current = {
      isActive: true,
      isDragging: false,
      startX: clientX,
      startY: clientY,
      startTranslateX: translateXRef.current,
    };

    const container = containerRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = 'none';
    }
  }, [stopAnimation]);

  const handleDragEnd = useCallback(() => {
    if (!dragStateRef.current.isActive) return;

    const container = containerRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    }

    if (dragStateRef.current.isDragging) {
      handleInfiniteLoop();
    }

    dragStateRef.current.isActive = false;
    dragStateRef.current.isDragging = false;

    setTimeout(() => {
      if (!isHoveredRef.current && events.length > 0) {
        startAnimation();
      }
    }, ANIMATION_RESUME_DELAY);
  }, [handleInfiniteLoop, startAnimation, events.length]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragStateRef.current.isActive) return;

    if (e instanceof MouseEvent && e.buttons === 0) {
      handleDragEnd();
      return;
    }

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    
    const deltaX = clientX - dragStateRef.current.startX;
    const deltaY = clientY - dragStateRef.current.startY;

    if (!dragStateRef.current.isDragging && Math.abs(deltaX) > DRAG_THRESHOLD) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        dragStateRef.current.isDragging = true;
        
        const container = containerRef.current;
        if (container) {
          container.style.cursor = 'grabbing';
        }
      } else {
        dragStateRef.current.isActive = false;
        return;
      }
    }

    if (dragStateRef.current.isDragging) {
      e.preventDefault(); 
      setTransform(dragStateRef.current.startTranslateX + deltaX);
    }
  }, [setTransform, handleDragEnd]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (dragStateRef.current.isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleDragStart]);

  useEffect(() => {
    if (events.length > 0) {
      setTransform(-originalSetWidth);
      startAnimation();
    }

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleTouchMove = (e: TouchEvent) => {
      if (dragStateRef.current.isDragging) {
        e.preventDefault();
      }
      handleDragMove(e);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      stopAnimation();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [
    events.length,
    originalSetWidth,
    setTransform,
    startAnimation,
    stopAnimation,
    handleDragMove,
    handleDragEnd,
  ]);

  if (!events || events.length === 0) return null;

  return (
    <section className="relative mb-12">
      <div className="py-6">
        <div className="relative overflow-hidden">
          <div
            ref={containerRef}
            className="flex gap-5 will-change-transform cursor-grab active:cursor-grabbing"
            style={{
              width: `${infiniteEvents.length * CARD_WITH_GAP}px`,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
          >
            {infiniteEvents.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className="flex-shrink-0 py-1"
                style={{ width: `${CARD_WIDTH}px` }}
              >
                <EventCard
                  event={convertToCardEvent(event)}
                  kategori={kategori}
                  variant="slider"
                />
              </div>
            ))}
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}