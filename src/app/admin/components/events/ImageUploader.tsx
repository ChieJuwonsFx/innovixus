'use client';

import { useState, useId, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Image as ImageIcon, CheckCircle2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type FilePreview = {
  key: string;
  file: File;
  previewUrl: string;
};

type ExistingPreview = {
  key: string;
  url: string;
};

type CombinedPreview = {
  key: string;
  url: string;
  file?: File;
  isExisting: boolean;
};

export interface ImageUploaderProps {
  existingImages?: { url: string; id?: string }[];
  onFilesChange: (files: File[]) => void;
  onExistingImagesChange?: (images: { url: string; id?: string }[]) => void;
}

function SortableImageItem({ 
  preview, 
  onRemove, 
  onClick,
  isDraggingAny,
}: { 
  preview: CombinedPreview; 
  onRemove: (key: string) => void;
  onClick: (key: string) => void;
  isDraggingAny: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: preview.key });

  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, 
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      
      const timer = setTimeout(() => {
        setIsLongPress(true);
        setIsDragActive(true);
      }, 500); 
      setLongPressTimer(timer);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      
      if (!isLongPress && !isDraggingAny && !isDragActive) {
        e.preventDefault();
        e.stopPropagation();
        onClick(preview.key);
      }
      
      setIsLongPress(false);
      setIsDragActive(false);
      touchStartPos.current = null;
    };

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDraggingAny && !isDragActive) {
        onClick(preview.key);
      }
    };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${
        isDragging ? 'scale-105 ring-4 ring-blue-500' : ''
      }`}
    >
      <div className="aspect-square relative">
        <div
          {...attributes}
          {...listeners}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          className={`absolute inset-0 touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab md:cursor-pointer'
          }`}
          style={{ touchAction: 'none' }}
        >
          <Image 
            src={preview.url} 
            alt="Preview gambar event" 
            fill 
            className="object-cover select-none pointer-events-none" 
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
            draggable={false}
          />
        </div>

        <div className="hidden md:block absolute top-2 left-2 bg-white/95 dark:bg-gray-800/95 rounded-lg p-2 shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <GripVertical className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </div>

        {preview.isExisting ? (
          <div className="absolute top-2 right-14 md:right-16 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved</span>
          </div>
        ) : (
          <div className="absolute top-2 right-14 md:right-16 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-20">
            Baru
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(preview.key);
          }}
          className="absolute top-2 right-2 p-2 bg-red-600/95 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors z-30"
          title="Hapus gambar"
        >
          <X size={16} />
        </button>

        <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <p className="text-xs font-medium truncate">
            {preview.file?.name || 'Uploaded image'}
          </p>
          {preview.file && (
            <p className="text-xs text-gray-300">
              {(preview.file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ImageUploader({ 
  existingImages = [], 
  onFilesChange,
  onExistingImagesChange,
}: ImageUploaderProps) {
  const fileInputId = useId();
  const dragCounter = useRef(0);
  const newFilesRef = useRef<FilePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);

  const [existingPreviews, setExistingPreviews] = useState<ExistingPreview[]>(() =>
    existingImages.map((img, index) => ({
      key: img.id ? `existing-${img.id}` : `existing-${index}`,
      url: img.url,
    }))
  );

  const [newFiles, setNewFiles] = useState<FilePreview[]>([]);

  useEffect(() => {
    newFilesRef.current = newFiles;
  }, [newFiles]);

  const combinedPreviews: CombinedPreview[] = [
    ...existingPreviews.map(p => ({ ...p, isExisting: true })),
    ...newFiles.map(p => ({ key: p.key, url: p.previewUrl, file: p.file, isExisting: false })),
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, 
        tolerance: 5, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    setIsDraggingItem(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingItem(false);
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = combinedPreviews.findIndex(p => p.key === active.id);
      const newIndex = combinedPreviews.findIndex(p => p.key === over.id);
      const reordered = arrayMove(combinedPreviews, oldIndex, newIndex);

      const newExisting: ExistingPreview[] = [];
      const newFilesList: FilePreview[] = [];

      reordered.forEach(item => {
        if (item.isExisting) {
          newExisting.push({ key: item.key, url: item.url });
        } else if (item.file) {
          const original = newFiles.find(f => f.key === item.key);
          if (original) newFilesList.push(original);
        }
      });

      setExistingPreviews(newExisting);
      setNewFiles(newFilesList);
    }
  };

  const handleDragCancel = () => {
    setIsDraggingItem(false);
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      if (!isValid) alert(`File ${file.name} bukan gambar yang valid`);
      else if (!isValidSize) alert(`File ${file.name} terlalu besar (maksimal 10MB)`);
      return isValid && isValidSize;
    });

    const newPreviews: FilePreview[] = validFiles.map(file => ({
      key: `${file.name}-${file.lastModified}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewFiles(prev => [...prev, ...newPreviews]);
  };

  const handleRemove = (keyToRemove: string) => {
    const isExisting = existingPreviews.some(p => p.key === keyToRemove);
    if (isExisting) {
      const updated = existingPreviews.filter(f => f.key !== keyToRemove);
      setExistingPreviews(updated);
      if (onExistingImagesChange)
        onExistingImagesChange(updated.map(({ url }) => ({ url })));
    } else {
      const fileToRemove = newFiles.find(f => f.key === keyToRemove);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      setNewFiles(prev => prev.filter(f => f.key !== keyToRemove));
    }
    
    if (selectedImageKey === keyToRemove) {
      setSelectedImageKey(null);
    }
  };

  const closePreview = () => setSelectedImageKey(null);

  const notifyParent = useCallback(() => {
    onFilesChange(newFiles.map(f => f.file));
  }, [newFiles, onFilesChange]);

  useEffect(() => {
    notifyParent();
  }, [notifyParent]);

  useEffect(() => {
    if (onExistingImagesChange)
      onExistingImagesChange(existingPreviews.map(({ url }) => ({ url })));
  }, [existingPreviews, onExistingImagesChange]);

  useEffect(() => {
    return () => newFilesRef.current.forEach(f => URL.revokeObjectURL(f.previewUrl));
  }, []);

  const selectedImage = selectedImageKey 
    ? combinedPreviews.find(p => p.key === selectedImageKey)?.url 
    : null;

  const totalImages = combinedPreviews.length;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
          Poster Event <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          {totalImages > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {totalImages} gambar
            </span>
          )}
          {totalImages > 1 && (
            <>
              <span className="md:hidden text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                Tahan gambar untuk geser urutan
              </span>
              <span className="hidden md:flex text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full items-center gap-1">
                <GripVertical className="w-3 h-3" />
                <span>Drag untuk urutkan</span>
              </span>
            </>
          )}
        </div>
      </div>

      {totalImages > 0 && (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={combinedPreviews.map(p => p.key)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {combinedPreviews.map(preview => (
                <SortableImageItem
                  key={preview.key}
                  preview={preview}
                  onRemove={handleRemove}
                  onClick={setSelectedImageKey}
                  isDraggingAny={isDraggingItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-lg'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <label
          htmlFor={fileInputId}
          className="flex flex-col items-center justify-center px-6 md:px-8 py-8 md:py-10 cursor-pointer group"
        >
          <div
            className={`mb-3 p-4 md:p-5 rounded-full transition-all duration-300 ${
              isDragOver
                ? 'bg-blue-500 text-white shadow-xl scale-110'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 group-hover:scale-110'
            }`}
          >
            {isDragOver ? <ImageIcon className="w-10 h-10 md:w-12 md:h-12" /> : <UploadCloud className="w-10 h-10 md:w-12 md:h-12" />}
          </div>

          <div className="text-center">
            <div className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-3">
              {isDragOver ? 'Lepaskan file di sini' : 'Upload poster event'}
            </div>
            <div className="text-sm md:text-md text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Klik untuk browse</span>
              {!isDragOver && <span className="hidden sm:inline"> atau drag & drop file</span>}
            </div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
              PNG, JPG, WEBP • Max: 10MB • Multiple files
            </p>
          </div>

          <input
            id={fileInputId}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 z-10 backdrop-blur-sm"
              title="Tutup preview"
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Preview gambar"
                fill
                className="object-contain"
                unoptimized
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}