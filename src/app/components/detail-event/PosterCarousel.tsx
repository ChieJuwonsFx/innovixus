'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Poster = {
  url: string;
};

interface PosterCarouselProps {
  posters: Poster[];
  title: string;
  onImageClick: (index: number) => void;
}

export default function PosterCarousel({ posters, title, onImageClick }: PosterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!posters || posters.length === 0) {
    return (
      <div className="relative h-64 md:h-80 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-600 text-center">
          <div className="w-16 h-16 bg-slate-300 dark:bg-slate-700 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm">Gambar tidak tersedia</p>
        </div>
      </div>
    );
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % posters.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);

  return (
    <div className="relative group">
      <div 
        className="relative h-64 md:h-80 overflow-hidden rounded-lg cursor-pointer bg-slate-100 dark:bg-slate-800"
        onClick={() => onImageClick(currentIndex)}
      >
        <Image 
          src={posters[currentIndex]?.url || '/placeholder.png'} 
          alt={`${title} - Gambar ${currentIndex + 1}`} 
          fill 
          className="object-cover transition-all duration-300 hover:scale-105" 
          priority 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm transform scale-95 group-hover:scale-100 transition-transform duration-200">
            <span className="text-sm font-medium">Klik untuk melihat gambar penuh</span>
          </div>
        </div>
      </div>
      
      {posters.length > 1 && (
        <>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }} 
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm shadow-lg"
            title="Gambar sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }} 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm shadow-lg"
            title="Gambar selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {posters.map((_, index) => (
              <button 
                key={index} 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }} 
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                }`}
                title={`Gambar ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm shadow-lg">
            {currentIndex + 1} / {posters.length}
          </div>
        </>
      )}
    </div>
  );
}