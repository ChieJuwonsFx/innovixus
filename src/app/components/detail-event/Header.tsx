'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Share2, Heart } from 'lucide-react';

type CategoryConfigType = {
  title: string;
  icon: React.ReactNode;
  color: string;
  showPricing: boolean;
  showLevels: boolean;
  showFields: boolean;
  registerText: string;
};

interface EventDetailHeaderProps {
  kategori: string;
  categoryConfig: CategoryConfigType;
  onShareClick: () => void;
}

export default function Header({ 
  kategori, 
  categoryConfig, 
  onShareClick 
}: EventDetailHeaderProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href={`/${kategori}`} 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke {categoryConfig.title}</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all ${
                isLiked 
                  ? 'text-red-500 scale-110' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-105'
              }`}
              title={isLiked ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''} transition-all`} />
            </button>
            
            <button 
              onClick={onShareClick} 
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hover:scale-105"
              title="Bagikan event"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
  );
}