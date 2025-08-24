'use client';

import { useState } from 'react';
import { Database } from '@/types/database';
import Header from '@/app/components/detail-event/Header';
import Content from '@/app/components/detail-event/Content';
import Sidebar from '@/app/components/detail-event/Sidebar';
import ShareModal from '@/app/components/detail-event/ShareModal';
import ImageViewerModal from '@/app/components/detail-event/ImageViewerModal';

type Poster = {
  url: string;
};

type EventWithRelations = Database['public']['Tables']['events']['Row'] & {
  organizers: Database['public']['Tables']['organizers']['Row'] | null;
  levels?: Database['public']['Tables']['levels']['Row'][] | null;
  fields?: Database['public']['Tables']['fields']['Row'][] | null;
  prices?: Database['public']['Tables']['prices']['Row'][] | null;
  partnerships?: Database['public']['Tables']['partnerships']['Row'] | null;
};

type StatusInfoType = {
  status: string;
  color: string;
  bgColor: string;
  text: string;
};

type CategoryConfigType = {
  title: string;
  icon: React.ReactNode;
  color: string;
  showPricing: boolean;
  showLevels: boolean;
  showFields: boolean;
  registerText: string;
};

interface EventDetailPageClientProps {
  event: EventWithRelations;
  kategori: string;
  posterArray: Poster[] | null;
  statusInfo: StatusInfoType;
  categoryConfig: CategoryConfigType;
}

export default function EventDetailPageClient({ 
  event, 
  kategori, 
  posterArray, 
  statusInfo, 
  categoryConfig,
}: EventDetailPageClientProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const openImageViewer = (index: number) => {
    setImageViewerIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-4 bg-slate-50 dark:bg-slate-950">
      <Header
        kategori={kategori}
        categoryConfig={categoryConfig}
        onShareClick={handleShareClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Content
              event={event}
              kategori={kategori}
              posterArray={posterArray}
              categoryConfig={categoryConfig}
              onImageClick={openImageViewer}
            />
          </div>

          <div className="lg:col-span-1">
            <Sidebar
              event={event}
              kategori={kategori}
              posterArray={posterArray}
              statusInfo={statusInfo}
              categoryConfig={categoryConfig}
              onShareClick={handleShareClick}
            />
          </div>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        eventData={event} 
        currentUrl={currentUrl} 
      />

      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        posters={posterArray || []}
        initialIndex={imageViewerIndex}
        title={event.title}
      />
    </div>
  );
}