'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

type Poster = {
  url: string;
};

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  posters: Poster[];
  initialIndex: number;
  title: string;
}

export default function ImageViewerModal({ 
  isOpen, 
  onClose, 
  posters, 
  initialIndex, 
  title 
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [currentIndex]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posters.length);
  }, [posters.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
  }, [posters.length]);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.1, 3));
  }, []);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(scale / 1.1, 0.8);
    setScale(newScale);
    
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Escape', 'ArrowLeft', 'ArrowRight', '+', '=', '-', '0'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextImage, onClose, prevImage, resetZoom, zoomIn, zoomOut]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const calculateDragBounds = useCallback((containerRect: DOMRect, imageRect: DOMRect) => {
    const scaledImageWidth = imageRect.width * scale;
    const scaledImageHeight = imageRect.height * scale;
    
    const maxX = Math.max(0, (scaledImageWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledImageHeight - containerRect.height) / 2);
    
    return { maxX, maxY };
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (container && image) {
      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const scaledImageWidth = imageRect.width * scale;
      const scaledImageHeight = imageRect.height * scale;
      
      const maxX = Math.max(0, (scaledImageWidth - containerRect.width) / 2);
      const maxY = Math.max(0, (scaledImageHeight - containerRect.height) / 2);
      
      setPosition({ 
        x: Math.max(-maxX, Math.min(maxX, newX)), 
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDragging || scale <= 1) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        const container = containerRef.current;
        const image = imageRef.current;
        
        if (container && image) {
          const containerRect = container.getBoundingClientRect();
          const imageRect = image.getBoundingClientRect();
          const { maxX, maxY } = calculateDragBounds(containerRect, imageRect);
          
          setPosition({ 
            x: Math.max(-maxX, Math.min(maxX, newX)), 
            y: Math.max(-maxY, Math.min(maxY, newY))
          });
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
      }, [isDragging, dragStart, calculateDragBounds, scale]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (container && image) {
      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const scaledImageWidth = imageRect.width * scale;
      const scaledImageHeight = imageRect.height * scale;
      
      const maxX = Math.max(0, (scaledImageWidth - containerRect.width) / 2);
      const maxY = Math.max(0, (scaledImageHeight - containerRect.height) / 2);
      
      setPosition({ 
        x: Math.max(-maxX, Math.min(maxX, newX)), 
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (scale === 1) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        setScale(1.5);
        setPosition({
          x: (centerX - clickX) * 0.3,
          y: (centerY - clickY) * 0.3
        });
      }
    } else {
      resetZoom();
    }
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const getCursor = () => {
    if (scale <= 1) return 'zoom-in';
    if (isDragging) return 'grabbing';
    return 'grab';
  };

  if (!isOpen || !posters || posters.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="flex-shrink-0 z-20">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-3 py-3 sm:px-6 sm:py-2">
          <div className="text-white min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold truncate">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">{currentIndex + 1} dari {posters.length} gambar</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 ml-3 sm:ml-6">
            <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 sm:p-1.5 border border-white/10 shadow-lg">
              <button
                onClick={zoomOut}
                className="p-1.5 sm:p-2.5 text-white hover:bg-white/10 rounded-md sm:rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                title="Zoom Out (-)"
                disabled={scale <= 0.8}
              >
                <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              
              <div className="text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 min-w-[50px] sm:min-w-[70px] text-center font-semibold bg-white/10 rounded-md sm:rounded-lg mx-1 sm:mx-1.5 border border-white/5">
                {Math.round(scale * 100)}%
              </div>
              
              <button
                onClick={zoomIn}
                className="p-1.5 sm:p-2.5 text-white hover:bg-white/10 rounded-md sm:rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                title="Zoom In (+)"
                disabled={scale >= 3}
              >
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              
              <div className="w-px h-4 sm:h-6 bg-white/20 mx-0.5 sm:mx-1"></div>
              
              <button
                onClick={resetZoom}
                className="p-1.5 sm:p-2.5 text-white hover:bg-white/10 rounded-md sm:rounded-lg transition-all duration-200 hover:scale-105"
                title="Reset Zoom (0)"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            
            {scale > 1 && (
              <div className="hidden sm:flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm rounded-lg px-3 py-2 text-blue-200 text-sm font-medium border border-blue-400/20">
                <Move className="w-4 h-4" />
                <span>Drag untuk geser</span>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2.5 text-white hover:bg-red-500/20 hover:text-red-300 rounded-md sm:rounded-lg transition-all duration-200 hover:scale-105"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div 
          ref={containerRef}
          className="relative min-h-full flex items-center justify-center p-2 sm:p-2"
          style={{ cursor: getCursor() }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-3 border-gray-600 border-t-white shadow-lg"></div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Memuat gambar...</p>
              </div>
            </div>
          )}
          
          <div
            ref={imageRef}
            className="relative transition-all duration-300 ease-out select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
              opacity: imageLoaded ? 1 : 0,
              filter: imageLoaded ? 'none' : 'blur(4px)'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={posters[currentIndex]?.url || '/placeholder.png'}
              alt={`${title} - Gambar ${currentIndex + 1}`}
              width={900}
              height={1350}
              className="object-contain max-w-none h-auto shadow-lg sm:shadow-2xl rounded-md sm:rounded-lg"
              priority
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              style={{
                maxHeight: scale <= 1 ? '90vh' : 'none',
                maxWidth: scale <= 1 ? '95vw' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {posters.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg border border-white/20 hover:scale-110 z-30 active:scale-95"
            title="Previous Image (←)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg border border-white/20 hover:scale-110 z-30 active:scale-95"
            title="Next Image (→)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {posters.length > 1 && (
        <div className="flex-shrink-0 sm:px-2 sm:pb-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex gap-2 sm:gap-3 bg-black/50 backdrop-blur-sm p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl overflow-x-auto scrollbar-hide border border-white/10 justify-start sm:justify-center max-w-full sm:max-w-5xl mx-auto">
            {posters.map((poster, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative w-14 h-10 sm:w-20 sm:h-14 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  index === currentIndex 
                    ? 'border-blue-400 scale-110 shadow-lg ring-1 sm:ring-2 ring-blue-400/50' 
                    : 'border-white/30 hover:border-white/50 shadow-md'
                }`}
              >
                <Image
                  src={poster.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover transition-all duration-300"
                />
                <div className={`absolute inset-0 transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-transparent' 
                    : 'bg-black/30 hover:bg-black/10'
                }`} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hidden md:block absolute bottom-6 right-6 text-gray-300 text-sm bg-black/60 backdrop-blur-sm p-4 rounded-xl shadow-xl max-w-xs border border-white/20 z-10">
        <div className="font-bold text-white mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          Kontrol
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Scroll:</span>
            <span className="text-blue-200 font-medium">Lihat gambar penuh</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Zoom:</span>
            <span className="text-blue-200 font-medium">Button / Double-click</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Geser:</span>
            <span className="text-blue-200 font-medium">Drag saat zoom</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Navigasi:</span>
            <span className="text-blue-200 font-medium">← / → / Thumbnail</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Reset:</span>
            <span className="text-blue-200 font-medium">0 / Double-click</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Tutup:</span>
            <span className="text-blue-200 font-medium">Esc</span>
          </div>
        </div>
      </div>
    </div>
  );
}